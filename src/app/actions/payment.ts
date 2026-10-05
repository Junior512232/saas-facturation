"use server";

import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getPublicInvoiceDetails(invoiceId: string) {
  try {
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select("*, clients(name, email), invoice_items(*), profiles(company_name, logo_url, plan, rccm, ninea, phone, email)")
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
      client: clientData?.name || invoice.client_name || "Client",
      clientEmail: clientData?.email || invoice.client_email || "",
      issueDate: invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("fr-FR") : "",
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("fr-FR") : "",
      amount: invoice.total,
      taxRate: invoice.tax_rate || 18,
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

export async function initiateCinetPayPayment({
  invoiceId,
  amount,
  currency = "XOF",
  description,
  customerName,
  customerEmail,
}: {
  invoiceId: string;
  amount: number;
  currency?: string;
  description: string;
  customerName: string;
  customerEmail: string;
}) {
  try {
    // 1. Fetch the invoice to get the profile_id (merchant)
    const { data: invoice } = await supabaseAdmin
      .from("invoices")
      .select("profile_id")
      .eq("id", invoiceId)
      .single();

    if (!invoice?.profile_id) {
      throw new Error("Facture introuvable ou marchand inconnu.");
    }

    // 2. Fetch the merchant's payment keys
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("cinetpay_site_id, cinetpay_apikey")
      .eq("id", invoice.profile_id)
      .single();

    if (!profile?.cinetpay_site_id || !profile?.cinetpay_apikey) {
      throw new Error("Le marchand n'a pas configuré ses paramètres de paiement CinetPay.");
    }

    // Decrypt keys
    // @ts-ignore
    const siteId = decrypt(profile.cinetpay_site_id);
    // @ts-ignore
    const apikey = decrypt(profile.cinetpay_apikey);

    // 2. Préparer le payload pour l'API CinetPay
    const transactionId = `${invoiceId}_${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://izifacture.com";

    const payload = {
      apikey: apikey,
      site_id: siteId,
      transaction_id: transactionId,
      amount: Math.round(amount),
      currency: currency,
      channels: "ALL",
      description: description,
      notify_url: `${baseUrl}/api/webhooks/cinetpay`,
      return_url: `${baseUrl}/pay/${invoiceId}?success=true`,
      customer_name: customerName,
      customer_surname: "",
      customer_email: customerEmail,
      customer_phone_number: "",
      customer_address: "Dakar",
      customer_city: "Dakar",
      customer_country: "SN",
      customer_state: "DK",
      customer_zip_code: "00000",
      metadata: invoiceId, 
    };

    // 3. Appel de l'API CinetPay
    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.code === "201" && data.data && data.data.payment_url) {
      return { success: true, paymentUrl: data.data.payment_url, paymentToken: data.data.payment_token };
    } else {
      console.error("Erreur CinetPay:", data);
      throw new Error(data.message || data.description || "Erreur d'initialisation du paiement CinetPay.");
    }
  } catch (error: any) {
    console.error("CinetPay Init Error:", error);
    return { success: false, error: error.message || "Erreur serveur interne." };
  }
}
