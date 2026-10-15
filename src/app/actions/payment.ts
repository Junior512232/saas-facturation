"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Détermine l'URL de base de l'API Bictorys (Sandbox vs Production)
 */
function getBictorysApiBase(apiKey: string): string {
  if (process.env.BICTORYS_API_URL) {
    return process.env.BICTORYS_API_URL;
  }
  const normalizedKey = apiKey.toLowerCase();
  if (
    normalizedKey.includes("test") ||
    normalizedKey.startsWith("sk_test_") ||
    normalizedKey.startsWith("pk_test_") ||
    normalizedKey.startsWith("bict_test_")
  ) {
    return "https://api.test.bictorys.com";
  }
  return "https://api.bictorys.com";
}

export async function getPublicInvoiceDetails(invoiceId: string) {
  try {
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select("*, clients(name, email, phone), invoice_items(*), profiles(company_name, logo_url, plan, rccm, ninea, phone, email)")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return { success: false, error: "Facture introuvable." };
    }

    // Format items
    const items = (invoice.invoice_items || []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    }));

    const clientData = invoice.clients as any;
    const profile = invoice.profiles as any;

    const formattedInvoice = {
      id: invoice.id,
      number: invoice.invoice_number,
      clientId: invoice.client_id,
      client: clientData?.name || (invoice as any).client_name || "Client",
      clientEmail: clientData?.email || (invoice as any).client_email || "",
      clientPhone: clientData?.phone || (invoice as any).client_phone || "",
      issueDate: invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("fr-FR") : "",
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("fr-FR") : "",
      amount: invoice.total,
      taxRate: (invoice as any).tax_rate || 18,
      status: invoice.status,
      notes: invoice.notes,
      items,
      merchant: {
        name: profile?.company_name || "iziFacture SARL",
        email: profile?.email || "contact@izifacture.com",
        phone: profile?.phone || "+221 77 000 00 00",
        logo_url: profile?.logo_url,
        plan: profile?.plan || "gratuit",
        ninea: profile?.ninea,
        rccm: profile?.rccm,
      }
    };

    return { success: true, data: formattedInvoice };
  } catch (err) {
    return { success: false, error: "Erreur lors de la récupération." };
  }
}

/**
 * Initialise un paiement Bictorys pour une facture client
 */
export async function initiateBictorysPayment({
  invoiceId,
  amount,
  currency = "XOF",
  description,
  customerName,
  customerEmail,
  customerPhone,
}: {
  invoiceId: string;
  amount: number;
  currency?: string;
  description?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  try {
    // 1. Récupération de la facture pour obtenir le profil marchand
    const { data: invoice } = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_number, profile_id, total")
      .eq("id", invoiceId)
      .single();

    if (!invoice?.profile_id) {
      throw new Error("Facture introuvable ou marchand inconnu.");
    }

    // 2. Récupération des clés API Bictorys du marchand
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("bictorys_api_key, cinetpay_apikey")
      .eq("id", invoice.profile_id)
      .single();

    // @ts-ignore
    const rawApiKey = profile?.bictorys_api_key || profile?.cinetpay_apikey;

    if (!rawApiKey) {
      throw new Error("Le marchand n'a pas encore configuré sa clé API Bictorys dans ses Paramètres de Paiement.");
    }

    const decryptedApiKey = decrypt(rawApiKey);
    if (!decryptedApiKey) {
      throw new Error("Impossible de déchiffrer la clé API Bictorys du marchand.");
    }

    // 3. Préparation du payload Bictorys Charges API
    const paymentReference = `INV-${invoice.invoice_number}-${Date.now().toString().slice(-6)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://izifacture.sn";
    const apiBase = getBictorysApiBase(decryptedApiKey);

    const payload = {
      amount: Math.round(amount),
      currency: currency,
      country: "SN",
      paymentReference: paymentReference,
      orderDetails: [
        {
          description: description || `Règlement facture ${invoice.invoice_number}`,
          amount: Math.round(amount),
        },
      ],
      customerObject: {
        name: customerName || "Client",
        email: customerEmail || undefined,
        phone: customerPhone || undefined,
      },
      successRedirectUrl: `${baseUrl}/pay/${invoiceId}?success=true&ref=${paymentReference}`,
      errorRedirectUrl: `${baseUrl}/pay/${invoiceId}?error=true`,
      metadata: {
        invoiceId: invoiceId,
        invoiceNumber: invoice.invoice_number,
        merchantId: invoice.profile_id,
        type: "invoice",
      },
    };

    // 4. Appel de l'API Bictorys Charges
    const response = await fetch(`${apiBase}/pay/v1/charges`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": decryptedApiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Erreur réponse API Bictorys:", response.status, responseData);
      const errMsg = responseData?.message || responseData?.error || responseData?.detail || `Erreur Bictorys (Code ${response.status})`;
      throw new Error(errMsg);
    }

    // Extraction de l'URL de paiement (Bictorys fournit redirectUrl ou link)
    const paymentUrl = 
      responseData?.redirectUrl || 
      responseData?.link || 
      responseData?.data?.redirectUrl || 
      responseData?.data?.link || 
      responseData?.url;

    if (!paymentUrl) {
      console.error("Réponse Bictorys inattendue (aucune URL de paiement):", responseData);
      throw new Error("L'API Bictorys n'a pas retourné de lien de paiement.");
    }

    return {
      success: true,
      paymentUrl: paymentUrl,
      transactionId: responseData?.id || responseData?.transactionId,
      paymentReference: paymentReference,
    };
  } catch (error: any) {
    console.error("Erreur initialisation paiement Bictorys:", error);
    return { 
      success: false, 
      error: error.message || "Erreur lors de l'initialisation du paiement avec Bictorys." 
    };
  }
}

/**
 * Initialise un paiement Bictorys pour un abonnement SaaS (Pro ou Business)
 */
export async function initiateSubscriptionPayment({
  plan,
}: {
  plan: "pro" | "business";
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Vous devez être connecté pour souscrire un forfait.");
    }

    // Montants en FCFA (cohérents avec la page de tarification)
    const planPrices: Record<string, number> = {
      pro: 10000,
      business: 25000,
    };

    const amount = planPrices[plan];
    if (!amount) {
      throw new Error("Plan d'abonnement invalide.");
    }

    // Récupération de la clé Bictorys de la plateforme (variables d'environnement)
    const platformApiKey = 
      process.env.BICTORYS_PLATFORM_API_KEY || 
      process.env.BICTORYS_API_KEY;

    // Si aucune clé plateforme n'est encore configurée, simuler l'activation instantanée
    if (!platformApiKey) {
      console.warn("BICTORYS_PLATFORM_API_KEY non configurée. Simulation du paiement pour l'environnement courant.");
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await supabaseAdmin
        .from("profiles")
        .update({
          plan: plan,
          plan_expires_at: nextMonth.toISOString(),
        })
        .eq("id", user.id);

      return {
        success: true,
        simulated: true,
        message: `Abonnement ${plan.toUpperCase()} activé avec succès !`,
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://izifacture.sn";
    const apiBase = getBictorysApiBase(platformApiKey);
    const paymentReference = `SUB-${plan.toUpperCase()}-${user.id.slice(0, 8)}-${Date.now()}`;

    const payload = {
      amount: amount,
      currency: "XOF",
      country: "SN",
      paymentReference: paymentReference,
      orderDetails: [
        {
          description: `Abonnement SaaS iziFacture - Forfait ${plan.toUpperCase()} (1 mois)`,
          amount: amount,
        },
      ],
      customerObject: {
        email: user.email,
      },
      successRedirectUrl: `${baseUrl}/settings/billing?subscription_success=true&plan=${plan}`,
      errorRedirectUrl: `${baseUrl}/settings/billing?error=true`,
      metadata: {
        type: "subscription",
        userId: user.id,
        plan: plan,
      },
    };

    const response = await fetch(`${apiBase}/pay/v1/charges`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": platformApiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Erreur Bictorys Subscription:", responseData);
      throw new Error(responseData?.message || "Erreur de création de paiement d'abonnement.");
    }

    const paymentUrl = 
      responseData?.redirectUrl || 
      responseData?.link || 
      responseData?.data?.redirectUrl;

    if (!paymentUrl) {
      throw new Error("Lien de paiement Bictorys manquant dans la réponse.");
    }

    return {
      success: true,
      paymentUrl,
    };
  } catch (error: any) {
    console.error("Erreur initiateSubscriptionPayment:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'initialisation de l'abonnement.",
    };
  }
}

// Rétrocompatibilité pour éviter de casser tout code legacy appelant initiateCinetPayPayment
export const initiateCinetPayPayment = initiateBictorysPayment;
