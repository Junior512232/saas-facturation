"use server";

import { getPaymentSettings } from "./payment-settings";

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
    // 1. Récupérer les clés CinetPay du marchand (actuellement connecté dans notre démo)
    const { siteId, apikey } = await getPaymentSettings();
    
    if (!siteId || !apikey) {
      throw new Error("Les paramètres de paiement CinetPay ne sont pas configurés par le marchand.");
    }

    // 2. Préparer le payload pour l'API CinetPay
    // CinetPay demande un transaction_id unique
    const transactionId = `${invoiceId}_${Date.now()}`;
    
    // On génère l'URL de base dynamiquement si possible, sinon on met une URL fixe pour le retour
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://izifacture.com";

    const payload = {
      apikey: apikey,
      site_id: siteId,
      transaction_id: transactionId,
      amount: Math.round(amount),
      currency: currency,
      channels: "ALL",
      description: description,
      // L'URL de notre webhook qui recevra la confirmation silencieuse
      notify_url: `${baseUrl}/api/webhooks/cinetpay`,
      // L'URL où l'utilisateur est redirigé après le paiement
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
      // On peut passer des métadonnées comme l'ID de la facture pour le retrouver dans le webhook
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
