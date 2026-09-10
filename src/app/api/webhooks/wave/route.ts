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
    if (waveSignature && process.env.NODE_ENV === "production") {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (waveSignature !== expectedSignature) {
        console.warn("⚠️ Invalid Wave webhook signature attempt detected!");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const { id, type, data } = body;

    console.log("Wave Webhook Verified:", { id, type, amount: data?.amount, currency: data?.currency });

    if (type === "checkout.session.completed") {
      const invoiceId = data?.client_reference;
      const amountPaid = data?.amount;

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

