import { NextResponse } from "next/server";
import { Resend } from "resend";

// Resend init moved inside POST to prevent build errors
/**
 * API Route to send invoice PDF link & payment link to client email
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, invoiceNumber, clientEmail, clientName, amount, senderName } = body;

    console.log(`Sending Invoice #${invoiceNumber} to ${clientName} (${clientEmail}) - Amount: ${amount} FCFA`);

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Simulating email dispatch.");
      // Fallback for development if no key is provided yet
      return NextResponse.json({
        success: true,
        message: `Facture #${invoiceNumber} envoyée avec succès à ${clientEmail} (Mode Simulation).`,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const paymentLink = `${baseUrl}/pay/${invoiceId}`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: `${senderName || "Votre Fournisseur"} <factures@votredomaine.com>`, // Mettez votre domaine vérifié sur Resend ici
      to: clientEmail,
      subject: `Nouvelle Facture ${invoiceNumber} de ${senderName || "Votre Fournisseur"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bonjour ${clientName},</h2>
          <p>Vous avez reçu une nouvelle facture (<strong>${invoiceNumber}</strong>) d'un montant de <strong>${amount} FCFA</strong>.</p>
          <p>Vous pouvez consulter les détails et procéder au paiement de manière sécurisée en cliquant sur le bouton ci-dessous :</p>
          <br/>
          <a href="${paymentLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Voir et Payer la facture
          </a>
          <br/><br/>
          <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
          <a href="${paymentLink}">${paymentLink}</a></p>
          <br/>
          <p>Merci de votre confiance !<br/>
          ${senderName || "Votre Fournisseur"}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Facture envoyée avec succès à ${clientEmail}.`,
      data,
    });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json({ error: "Échec de l'envoi de l'email" }, { status: 500 });
  }
}
