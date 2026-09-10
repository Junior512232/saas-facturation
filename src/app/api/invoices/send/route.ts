import { NextResponse } from "next/server";

/**
 * API Route to send invoice PDF & Wave/OM payment link to client email
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, clientEmail, clientName, amount, dueDate } = body;

    console.log(`Sending Invoice #${invoiceId} to ${clientName} (${clientEmail}) - Amount: ${amount} FCFA`);

    // Simulated email dispatch (Integrable with Resend / Nodemailer)
    return NextResponse.json({
      success: true,
      message: `Facture #${invoiceId} envoyée avec succès à ${clientEmail}.`,
      invoiceId,
      recipient: clientEmail,
    });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json({ error: "Failed to send invoice email" }, { status: 500 });
  }
}
