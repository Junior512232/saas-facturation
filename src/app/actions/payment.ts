"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Détermine l'URL de base de l'API Bictorys (Sandbox vs Production)
 * Priorité absolue au préfixe test_ pour empêcher tout appel en production avec des clés Sandbox
 */
function getBictorysApiBase(apiKey: string): string {
  const normalizedKey = (apiKey || "").trim().toLowerCase();

  // 1. Détection prioritaire Sandbox : préfixes test_public-, test_secret-, sk_test_, pk_test_ ou mot "test"
  const isTestKey =
    normalizedKey.startsWith("test_") ||
    normalizedKey.startsWith("pk_test_") ||
    normalizedKey.startsWith("sk_test_") ||
    normalizedKey.startsWith("bict_test_") ||
    normalizedKey.includes("test");

  if (isTestKey) {
    return "https://api.test.bictorys.com";
  }

  // 2. Si une URL d'API explicite est configurée dans l'environnement
  if (process.env.BICTORYS_API_URL) {
    return process.env.BICTORYS_API_URL.replace(/\/+$/, "");
  }

  // 3. Par défaut en production
  return "https://api.bictorys.com";
}

/**
 * Formate et valide l'objet client selon les exigences strictes de Bictorys (afro.tools ATSS)
 * Exige country: "SN" et téléphone au format numérique international
 */
function formatCustomerObject({
  name,
  email,
  phone,
  country = "SN",
}: {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
}) {
  const cust: Record<string, any> = {
    name: name?.trim() || "Client",
    country: country || "SN",
  };

  if (email && email.includes("@")) {
    cust.email = email.trim();
  }

  if (phone) {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length >= 8) {
      const fullPhone = cleaned.startsWith("221") ? cleaned : `221${cleaned}`;
      cust.phone = Number(fullPhone) || fullPhone;
    }
  }

  return cust;
}


/**
 * Récupère les détails publics d'une facture ou d'un ticket de caisse
 * Supporte la recherche par UUID ou par numéro de facture / ticket (INV-..., VTE-...)
 */
export async function getPublicInvoiceDetails(invoiceId: string) {
  try {
    let invoice: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId);

    // 1. Recherche par UUID
    if (isUuid) {
      const { data, error } = await supabaseAdmin
        .from("invoices")
        .select("*, clients(name, email, phone), invoice_items(*), profiles(*)")
        .eq("id", invoiceId)
        .maybeSingle();

      if (!error && data) {
        invoice = data;
      }
    }

    // 2. Fallback : recherche par numéro (invoice_number)
    if (!invoice) {
      const { data, error } = await supabaseAdmin
        .from("invoices")
        .select("*, clients(name, email, phone), invoice_items(*), profiles(*)")
        .eq("invoice_number", invoiceId)
        .maybeSingle();

      if (!error && data) {
        invoice = data;
      }
    }

    // 3. Fallback secondaire : si la jointure profiles a un problème de schéma
    if (!invoice && isUuid) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("*, clients(name, email, phone), invoice_items(*)")
        .eq("id", invoiceId)
        .maybeSingle();
      if (data) invoice = data;
    }

    if (!invoice) {
      return { success: false, error: "Facture ou ticket introuvable." };
    }

    // Format items
    const items = (invoice.invoice_items || []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price) || 0,
    }));

    const clientData = invoice.clients as any;
    const profile = invoice.profiles as any;
    const cfg = (profile?.payment_methods_config || {}) as Record<string, any>;

    const hasBictorysKey = Boolean(profile?.bictorys_api_key || profile?.cinetpay_apikey);
    const waveNum = profile?.wave_number || cfg.waveNumber || profile?.phone || "";
    const omNum = profile?.om_number || cfg.omNumber || profile?.phone || "";
    const bankRib = profile?.bank_rib || cfg.bankRib || "";

    const paymentMethods = {
      hasBictorys: (cfg.enableBictorys !== false) && hasBictorysKey,
      wave: {
        enabled: cfg.enableWaveDirect !== false && Boolean(waveNum),
        number: waveNum,
        merchantId: profile?.wave_merchant_id || cfg.waveMerchantId || "",
      },
      orangeMoney: {
        enabled: cfg.enableOmDirect !== false && Boolean(omNum || profile?.om_merchant_code || cfg.omMerchantCode),
        number: omNum,
        merchantCode: profile?.om_merchant_code || cfg.omMerchantCode || "",
      },
      bankTransfer: {
        enabled: cfg.enableBankTransfer !== false && Boolean(bankRib),
        bankName: profile?.bank_name || cfg.bankName || "Banque au Sénégal",
        accountName: profile?.bank_account_name || cfg.bankAccountName || profile?.company_name || "Entreprise",
        rib: bankRib,
      },
      cash: {
        enabled: cfg.enableCash ?? true,
      },
      instructions: profile?.payment_instructions || cfg.paymentInstructions || "Indiquez votre numéro de facture en référence lors de votre transfert.",
    };

    const formattedInvoice = {
      id: invoice.id,
      number: invoice.invoice_number,
      clientId: invoice.client_id,
      client: clientData?.name || (invoice as any).client_name || "Client",
      clientEmail: clientData?.email || (invoice as any).client_email || "",
      clientPhone: clientData?.phone || (invoice as any).client_phone || "",
      issueDate: invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("fr-FR") : "",
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("fr-FR") : "",
      amount: Number(invoice.total) || 0,
      subtotal: Number(invoice.subtotal) || Number(invoice.total) || 0,
      taxAmount: Number(invoice.tax_amount) || 0,
      taxRate: (invoice as any).tax_rate || 18,
      status: invoice.status,
      notes: invoice.notes,
      items,
      paymentMethods,
      merchant: {
        name: profile?.company_name || "iziFlow SARL",
        email: profile?.email || "contact@iziflow.sn",
        phone: profile?.phone || "+221 77 493 73 49",
        logo_url: profile?.logo_url || profile?.company_logo_url,
        plan: profile?.plan || "pro",
        ninea: profile?.ninea || "",
        rccm: profile?.rccm || "",
      }
    };

    return { success: true, data: formattedInvoice };
  } catch (err: any) {
    console.error("Erreur getPublicInvoiceDetails:", err);
    return { success: false, error: "Erreur lors de la récupération de la facture." };
  }
}

/**
 * Valide le paiement public d'une facture ou d'un ticket
 * Met à jour le statut en 'paid' et déclenche l'envoi de la facture acquittée par email/WhatsApp
 */
export async function confirmPublicInvoicePayment({
  invoiceId,
  paymentReference,
  paymentMethod = "Bictorys (Wave / Orange Money / CB)",
}: {
  invoiceId: string;
  paymentReference?: string;
  paymentMethod?: string;
}) {
  try {
    let invoice: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId);

    if (isUuid) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("*, clients(name, email, phone), profiles(company_name, email, phone)")
        .eq("id", invoiceId)
        .maybeSingle();
      invoice = data;
    }
    if (!invoice) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("*, clients(name, email, phone), profiles(company_name, email, phone)")
        .eq("invoice_number", invoiceId)
        .maybeSingle();
      invoice = data;
    }

    if (!invoice) {
      return { success: false, error: "Facture introuvable." };
    }

    // Mise à jour du statut en 'paid'
    await supabaseAdmin
      .from("invoices")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    // Enregistrement dans la table `payments`
    try {
      await supabaseAdmin.from("payments").insert({
        invoice_id: invoice.id,
        profile_id: invoice.profile_id,
        amount: invoice.total,
        payment_method: paymentMethod,
        transaction_id: paymentReference || `BICT-${Date.now()}`,
        status: "completed",
      });
    } catch (e) {
      console.warn("Avertissement table payments:", e);
    }

    const clientData = invoice.clients as any;
    const clientEmail = clientData?.email || invoice.client_email;
    const clientName = clientData?.name || invoice.client_name || "Client";
    const clientPhone = clientData?.phone || invoice.client_phone;
    const profile = invoice.profiles as any;
    const merchantName = profile?.company_name || "iziFlow";

    // Envoi automatique de la facture par email (Resend) si email renseigné
    let emailSent = false;
    if (clientEmail && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://saas-facturation-ughf.vercel.app";
        const invoiceLink = `${baseUrl}/pay/${invoice.id}`;

        await resend.emails.send({
          from: `${merchantName} <factures@resend.dev>`,
          to: clientEmail,
          subject: `✅ Reçu & Facture acquittée ${invoice.invoice_number} - ${merchantName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #059669; font-size: 24px; margin: 0;">🎉 Paiement confirmé avec succès !</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Merci pour votre règlement sécurisé</p>
              </div>
              <p>Bonjour <strong>${clientName}</strong>,</p>
              <p>Nous vous confirmons la bonne réception de votre paiement de <strong>${Number(invoice.total).toLocaleString("fr-FR")} FCFA</strong> pour la facture <strong>${invoice.invoice_number}</strong>.</p>
              <p>Votre facture est désormais acquittée et certifiée conforme.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${invoiceLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                  Consulter et Télécharger le reçu officiel
                </a>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                Merci de votre confiance !<br/>
                <strong>${merchantName}</strong>
              </p>
            </div>
          `,
        });
        emailSent = true;
      } catch (emailErr) {
        console.warn("Échec de l'envoi automatique de l'email:", emailErr);
      }
    }

    return {
      success: true,
      invoiceNumber: invoice.invoice_number,
      clientEmail: clientEmail || null,
      clientPhone: clientPhone || null,
      clientName: clientName,
      total: invoice.total,
      emailSent,
    };
  } catch (error: any) {
    console.error("Erreur confirmPublicInvoicePayment:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Déclare un règlement direct effectué par le client (Wave direct, Orange Money direct, Virement RIB, Espèces)
 * Ajoute la trace dans les notes de facture et informe l'entreprise
 */
export async function declareDirectPayment({
  invoiceId,
  method,
  reference,
  senderPhone,
  senderName,
  notes,
}: {
  invoiceId: string;
  method: "wave" | "orange_money" | "bank_transfer" | "cash";
  reference?: string;
  senderPhone?: string;
  senderName?: string;
  notes?: string;
}) {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId);
    let invoice: any = null;

    if (isUuid) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("id, status, notes, total, invoice_number, profile_id")
        .eq("id", invoiceId)
        .maybeSingle();
      invoice = data;
    }

    if (!invoice) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("id, status, notes, total, invoice_number, profile_id")
        .eq("invoice_number", invoiceId)
        .maybeSingle();
      invoice = data;
    }

    if (!invoice) {
      return { success: false, error: "Facture introuvable." };
    }

    const timestamp = new Date().toLocaleString("fr-FR");
    const methodLabels: Record<string, string> = {
      wave: "Wave Direct",
      orange_money: "Orange Money Direct",
      bank_transfer: "Virement Bancaire (RIB)",
      cash: "Règlement Espèces / Livraison",
    };

    const paymentLine = `\n[${timestamp}] Déclaration de paiement ${methodLabels[method] || method} : Réf : ${reference || "N/A"}${senderPhone ? ` | Tél : ${senderPhone}` : ""}${senderName ? ` | Payeur : ${senderName}` : ""}${notes ? ` | Consignes : ${notes}` : ""}`;
    const updatedNotes = ((invoice.notes || "") + paymentLine).trim();

    // Mettre à jour les notes
    await supabaseAdmin
      .from("invoices")
      .update({
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    // Enregistrer également une trace dans payments en statut 'pending'
    try {
      await supabaseAdmin.from("payments").insert({
        invoice_id: invoice.id,
        profile_id: invoice.profile_id,
        amount: invoice.total,
        payment_method: methodLabels[method] || method,
        transaction_id: reference || `DECL-${Date.now()}`,
        status: "pending",
      });
    } catch (e) {
      console.warn("Avertissement table payments insert pending:", e);
    }

    return {
      success: true,
      message: "Votre déclaration de paiement a été envoyée à l'entreprise avec succès.",
    };
  } catch (err: any) {
    console.error("Erreur declareDirectPayment:", err);
    return { success: false, error: err.message || "Erreur lors de la déclaration du paiement." };
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
  paymentType,
}: {
  invoiceId: string;
  amount: number;
  currency?: string;
  description?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentType?: "wave_money" | "orange_money" | "free_money" | "card" | "hosted";
}) {
  try {
    // 1. Récupération de la facture
    let invoice: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId);

    if (isUuid) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("id, invoice_number, profile_id, total")
        .eq("id", invoiceId)
        .maybeSingle();
      invoice = data;
    }
    if (!invoice) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("id, invoice_number, profile_id, total")
        .eq("invoice_number", invoiceId)
        .maybeSingle();
      invoice = data;
    }

    if (!invoice?.profile_id) {
      throw new Error("Facture introuvable ou marchand inconnu.");
    }

    // 2. Récupération des clés API Bictorys du marchand (safely)
    let rawApiKey: string | null = null;
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", invoice.profile_id)
        .single();
      // @ts-ignore
      rawApiKey = profile?.bictorys_api_key || profile?.cinetpay_apikey || null;
    } catch {}

    // Fallback sur les clés de plateforme configurées dans les variables d'environnement
    if (!rawApiKey || rawApiKey.includes("sample") || rawApiKey.includes("placeholder") || rawApiKey.trim().length < 8) {
      rawApiKey = process.env.BICTORYS_PLATFORM_API_KEY || process.env.BICTORYS_API_KEY || null;
    }

    const paymentReference = `INV-${invoice.invoice_number}-${Date.now().toString().slice(-6)}`;
    // afro.tools Gotcha: les URL de redirection doivent impérativement être en HTTPS
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://saas-facturation-ughf.vercel.app";
    if (baseUrl.startsWith("http://")) {
      baseUrl = baseUrl.replace("http://", "https://");
    }
    baseUrl = baseUrl.replace(/\/+$/, "");

    // Si aucune clé Bictorys n'est configurée, proposer la simulation interactive
    if (!rawApiKey) {
      return {
        success: true,
        paymentUrl: `${baseUrl}/pay/${invoice.id}?sandbox_pay=true&ref=${paymentReference}&amount=${Math.round(amount)}${paymentType ? `&method=${paymentType}` : ""}`,
        paymentReference,
        simulated: true,
      };
    }

    const decryptedApiKey = decrypt(rawApiKey) || rawApiKey;
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
      customerObject: formatCustomerObject({
        name: customerName || "Client",
        email: customerEmail,
        phone: customerPhone,
        country: "SN",
      }),
      successRedirectUrl: `${baseUrl}/pay/${invoice.id}?success=true&ref=${paymentReference}`,
      errorRedirectUrl: `${baseUrl}/pay/${invoice.id}?error=true`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        merchantId: invoice.profile_id,
        type: "invoice",
      },
    };

    // afro.tools ATSS Gotcha: payment_type est un paramètre de requête (query parameter)
    // POST /pay/v1/charges?payment_type=wave_money
    const chargesEndpoint = (paymentType && paymentType !== "hosted") 
      ? `${apiBase}/pay/v1/charges?payment_type=${paymentType}`
      : `${apiBase}/pay/v1/charges`;

    // 4. Appel de l'API Bictorys Charges
    const response = await fetch(chargesEndpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": decryptedApiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => null);

    const isTestKey =
      decryptedApiKey.toLowerCase().startsWith("test_") ||
      decryptedApiKey.toLowerCase().startsWith("pk_test_") ||
      decryptedApiKey.toLowerCase().startsWith("sk_test_") ||
      decryptedApiKey.toLowerCase().startsWith("bict_test_") ||
      decryptedApiKey.toLowerCase().includes("test");

    if (!response.ok) {
      console.error("Erreur réponse API Bictorys:", response.status, responseData);
      const errMsg = responseData?.details || responseData?.message || responseData?.error || responseData?.title || `Erreur Bictorys (Code ${response.status})`;
      
      // En production réelle, retourner l'erreur exacte Bictorys sans simuler
      if (!isTestKey) {
        return {
          success: false,
          error: `Échec passerelle Bictorys : ${errMsg}`,
        };
      }

      // En mode sandbox/test uniquement, proposer la simulation interactive
      console.warn("Basculement vers la simulation sandbox Bictorys (mode test détecté)");
      return {
        success: true,
        paymentUrl: `${baseUrl}/pay/${invoice.id}?sandbox_pay=true&ref=${paymentReference}&amount=${Math.round(amount)}${paymentType ? `&method=${paymentType}` : ""}`,
        paymentReference,
        simulated: true,
      };
    }

    // Extraction de l'URL de paiement (direct 201 ou hébergé 202 selon afro.tools ATSS)
    const paymentUrl = 
      responseData?.redirectUrl || 
      responseData?.link || 
      responseData?.data?.redirectUrl || 
      responseData?.data?.link || 
      responseData?.url;

    if (!paymentUrl) {
      console.error("Réponse Bictorys inattendue (pas d'URL de paiement):", responseData);
      if (!isTestKey) {
        return {
          success: false,
          error: "Lien de redirection Bictorys manquant dans la réponse du serveur.",
        };
      }
      return {
        success: true,
        paymentUrl: `${baseUrl}/pay/${invoice.id}?sandbox_pay=true&ref=${paymentReference}&amount=${Math.round(amount)}${paymentType ? `&method=${paymentType}` : ""}`,
        paymentReference,
        simulated: true,
      };
    }

    return {
      success: true,
      paymentUrl: paymentUrl,
      transactionId: responseData?.id || responseData?.transactionId || responseData?.chargeId,
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
 * Initialise un paiement Bictorys pour une vente directe en caisse (POS / Ticket)
 */
export async function initiateBictorysSalePayment({
  saleNumber,
  amount,
  currency = "XOF",
  description,
  customerName,
  customerPhone,
  paymentType,
}: {
  saleNumber: string;
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
  customerPhone?: string;
  paymentType?: "wave_money" | "orange_money" | "free_money" | "card" | "hosted";
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

    // 1. Récupération des clés API Bictorys du marchand
    let rawApiKey: string | null = null;
    const userId = user?.id;

    if (userId) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        // @ts-ignore
        rawApiKey = profile?.bictorys_api_key || profile?.cinetpay_apikey || null;
      } catch {}
    }

    if (!rawApiKey || rawApiKey.includes("sample") || rawApiKey.includes("placeholder") || rawApiKey.trim().length < 8) {
      rawApiKey = process.env.BICTORYS_PLATFORM_API_KEY || process.env.BICTORYS_API_KEY || null;
    }

    const paymentReference = `TICKET-${saleNumber}-${Date.now().toString().slice(-6)}`;
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://saas-facturation-ughf.vercel.app";
    if (baseUrl.startsWith("http://")) {
      baseUrl = baseUrl.replace("http://", "https://");
    }
    baseUrl = baseUrl.replace(/\/+$/, "");

    if (!rawApiKey) {
      // Simulation / redirection propre vers la page ticket
      return {
        success: true,
        paymentUrl: `${baseUrl}/pay/ticket/${saleNumber}?sandbox_pay=true&ref=${paymentReference}&amount=${Math.round(amount)}${paymentType ? `&method=${paymentType}` : ""}`,
        paymentReference,
        simulated: true,
      };
    }

    const decryptedApiKey = decrypt(rawApiKey) || rawApiKey;
    const apiBase = getBictorysApiBase(decryptedApiKey);

    const payload = {
      amount: Math.round(amount),
      currency: currency,
      country: "SN",
      paymentReference: paymentReference,
      orderDetails: [
        {
          description: description || `Ticket de caisse ${saleNumber}`,
          amount: Math.round(amount),
        },
      ],
      customerObject: formatCustomerObject({
        name: customerName || "Client de passage",
        phone: customerPhone,
        country: "SN",
      }),
      successRedirectUrl: `${baseUrl}/pay/ticket/${saleNumber}?success=true&ref=${paymentReference}`,
      errorRedirectUrl: `${baseUrl}/pay/ticket/${saleNumber}?error=true`,
      metadata: {
        type: "pos_sale",
        saleNumber: saleNumber,
        merchantId: userId,
      },
    };

    const chargesEndpoint = (paymentType && paymentType !== "hosted") 
      ? `${apiBase}/pay/v1/charges?payment_type=${paymentType}`
      : `${apiBase}/pay/v1/charges`;

    const response = await fetch(chargesEndpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": decryptedApiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => null);

    const isTestKey =
      decryptedApiKey.toLowerCase().startsWith("test_") ||
      decryptedApiKey.toLowerCase().startsWith("pk_test_") ||
      decryptedApiKey.toLowerCase().startsWith("sk_test_") ||
      decryptedApiKey.toLowerCase().startsWith("bict_test_") ||
      decryptedApiKey.toLowerCase().includes("test");

    if (!response.ok) {
      console.error("Erreur API Bictorys Ticket:", response.status, responseData);
      const errMsg = responseData?.details || responseData?.message || responseData?.error || responseData?.title || `Erreur Bictorys (${response.status})`;
      if (!isTestKey) {
        return {
          success: false,
          error: `Échec paiement ticket Bictorys : ${errMsg}`,
        };
      }
      return {
        success: true,
        paymentUrl: `${baseUrl}/pay/ticket/${saleNumber}?sandbox_pay=true&ref=${paymentReference}&amount=${Math.round(amount)}${paymentType ? `&method=${paymentType}` : ""}`,
        paymentReference,
        simulated: true,
      };
    }

    const paymentUrl = 
      responseData?.redirectUrl || 
      responseData?.link || 
      responseData?.data?.redirectUrl || 
      responseData?.data?.link || 
      responseData?.url;

    if (!paymentUrl) {
      if (!isTestKey) {
        return {
          success: false,
          error: "Lien de redirection Bictorys manquant dans la réponse du serveur.",
        };
      }
      return {
        success: true,
        paymentUrl: `${baseUrl}/pay/ticket/${saleNumber}?sandbox_pay=true&ref=${paymentReference}&amount=${Math.round(amount)}${paymentType ? `&method=${paymentType}` : ""}`,
        paymentReference,
        simulated: true,
      };
    }

    return {
      success: true,
      paymentUrl,
      paymentReference,
    };
  } catch (error: any) {
    console.error("Erreur initiateBictorysSalePayment:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'initialisation du paiement Bictorys.",
    };
  }
}

/**
 * Enregistre une vente POS / Ticket dans la base de données Supabase
 * Permet au ticket d'avoir un lien de consultation et de paiement public permanent
 */
export async function createPosSaleInvoice(saleData: {
  saleNumber: string;
  clientId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) { cookieStore.set(name, value, options); },
          remove(name: string, options: any) { cookieStore.delete(name); },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    let profileId = user?.id;

    if (!profileId) {
      const { data: adminProfile } = await supabaseAdmin.from("profiles").select("id").limit(1).single();
      if (!adminProfile) throw new Error("Profil marchand introuvable");
      profileId = adminProfile.id;
    }

    const isPaid = saleData.paymentMethod !== "bictorys";

    // 1. Insertion de la facture / ticket
    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .insert({
        profile_id: profileId,
        client_id: saleData.clientId || null,
        invoice_number: saleData.saleNumber,
        status: isPaid ? "paid" : "sent",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: new Date().toISOString().split("T")[0],
        subtotal: saleData.subtotal,
        tax_amount: saleData.taxAmount,
        total: saleData.total,
        notes: `Ticket de caisse POS - ${saleData.customerName || "Client de passage"}`,
      })
      .select()
      .single();

    if (error || !invoice) {
      console.warn("Échec insertion ticket dans invoices:", error);
      return { success: false, error: error?.message };
    }

    // 2. Insertion des articles vendus
    if (saleData.items && saleData.items.length > 0) {
      const itemsToInsert = saleData.items.map((it: any) => ({
        invoice_id: invoice.id,
        description: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        amount: it.totalPrice || it.quantity * it.unitPrice,
      }));
      await supabaseAdmin.from("invoice_items").insert(itemsToInsert);
    }

    return {
      success: true,
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
    };
  } catch (err: any) {
    console.error("createPosSaleInvoice error:", err);
    return { success: false, error: err.message };
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

    const planPrices: Record<string, number> = {
      pro: 10000,
      business: 25000,
    };

    const amount = planPrices[plan];
    if (!amount) {
      throw new Error("Plan d'abonnement invalide.");
    }

    const platformApiKey = 
      process.env.BICTORYS_PLATFORM_API_KEY || 
      process.env.BICTORYS_API_KEY;

    if (!platformApiKey) {
      console.error("BICTORYS_PLATFORM_API_KEY non configurée sur le serveur.");
      return {
        success: false,
        error: "La passerelle de paiement d'abonnement est temporairement indisponible. Veuillez contacter l'administrateur.",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://saas-facturation-ughf.vercel.app";
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
      customerObject: formatCustomerObject({
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Abonné SaaS",
        email: user.email,
        phone: user.user_metadata?.phone || user.phone,
        country: "SN",
      }),
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

// Rétrocompatibilité
export const initiateCinetPayPayment = initiateBictorysPayment;

/**
 * Vérifie le statut d'une transaction Bictorys côté serveur
 * Conforme aux spécifications afro.tools (ATSS) : capability verify_transaction
 */
export async function verifyBictorysTransaction({
  transactionId,
  invoiceId,
}: {
  transactionId: string;
  invoiceId?: string;
}) {
  try {
    const rawApiKey = 
      process.env.BICTORYS_PRIVATE_KEY || 
      process.env.BICTORYS_PLATFORM_API_KEY || 
      process.env.BICTORYS_API_KEY || 
      "";

    const apiBase = getBictorysApiBase(rawApiKey);
    const response = await fetch(`${apiBase}/pay/v1/transactions/${transactionId}/status`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-API-Key": rawApiKey,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return { success: false, status: "unknown", error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const isSucceeded = data?.status === "succeeded" || data?.status === "success";

    if (isSucceeded && invoiceId) {
      await confirmPublicInvoicePayment({
        invoiceId,
        paymentReference: transactionId,
        paymentMethod: "Bictorys (Vérifié en direct)",
      });
    }

    return {
      success: true,
      status: data?.status,
      data,
    };
  } catch (err: any) {
    console.error("Erreur verifyBictorysTransaction:", err);
    return { success: false, error: err.message };
  }
}
