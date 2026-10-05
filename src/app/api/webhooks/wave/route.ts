import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Secure Wave Webhook Handler for Senegal
 * Verifies HMAC SHA256 signatures to prevent fraudulent payment injection
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const waveSignature = req.headers.get("wave-signature");
    const webhookSecret = process.env.WAVE_WEBHOOK_SECRET || "default_wave_secret_key";

    // HMAC Signature Verification
    if (!waveSignature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (waveSignature !== expectedSignature) {
      console.warn("⚠️ Invalid Wave webhook signature attempt detected!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { id, type, data } = body;

    console.log("Wave Webhook Verified:", { id, type, amount: data?.amount, currency: data?.currency });

    if (type === "checkout.session.completed") {
      const invoiceId = data?.client_reference;
      const amountPaid = data?.amount;
      const txnid = id;

      if (!invoiceId) {
        return NextResponse.json({ error: "Missing invoice reference" }, { status: 400 });
      }

      // 1. Initialize Supabase Admin (Service Role) to bypass RLS
      const { createClient } = require("@supabase/supabase-js");
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 2. Fetch Invoice
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from("invoices")
        .select("id, profile_id, status")
        .eq("id", invoiceId)
        .single();

      if (invoiceError || !invoice) {
        console.error("Facture introuvable :", invoiceId);
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      if (invoice.status === "paid") {
        return NextResponse.json({ success: true, message: "Facture déjà payée." });
      }

      // 3. Mettre à jour la facture en "payée"
      const { error: updateError } = await supabaseAdmin
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", invoiceId);

      if (updateError) throw new Error("Erreur mise à jour facture.");

      // 4. Enregistrer la trace comptable du paiement
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
          invoice_id: invoiceId,
          profile_id: invoice.profile_id,
          amount: parseFloat(amountPaid),
          payment_method: "Wave",
          transaction_id: txnid,
          status: "completed"
        });

      if (paymentError) console.error("Erreur insertion paiement Wave:", paymentError);

      console.log(`✅ Secure Payment confirmed for Invoice #${invoiceId}: ${amountPaid} FCFA via Wave.`);

      return NextResponse.json({
        success: true,
        message: "Payment recorded securely",
        invoiceId,
        amount: amountPaid,
      });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Error processing Wave webhook:", error);
    return NextResponse.json({ error: "Webhook Handler Error" }, { status: 500 });
  }
}

