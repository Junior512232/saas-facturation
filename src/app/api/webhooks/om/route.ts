import { NextResponse } from "next/server";

/**
 * Orange Money Webhook Handler for Senegal
 * Receives automatic payment notifications from Orange Money API
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { status, notif_token, txnid, amount } = body;

    console.log("Orange Money Webhook Received:", { txnid, status, amount });

    if (status === "SUCCESS" || status === "INITIATED") {
      console.log(`Orange Money transaction ${txnid} confirmed for ${amount} FCFA.`);

      return NextResponse.json({
        success: true,
        transactionId: txnid,
        status: "PAID",
      });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Error processing Orange Money webhook:", error);
    return NextResponse.json({ error: "Webhook Handler Error" }, { status: 500 });
  }
}
