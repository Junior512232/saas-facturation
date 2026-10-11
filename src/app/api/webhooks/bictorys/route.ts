import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const secretKeyHeader = req.headers.get("x-secret-key") || req.headers.get("X-Secret-Key") || "";
    
    // Parse le corps de la requête (Bictorys envoie généralement du JSON)
    let body: any;
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    console.log("[Webhook Bictorys] Payload reçu :", JSON.stringify(body, null, 2));

    const transactionId = body.id || body.transactionId || body.chargeId;
    const status = (body.status || body.event || "").toLowerCase();
    const paymentReference = body.paymentReference || body.reference || "";
    const metadata = body.metadata || {};

    // Vérifie si le statut indique un succès
    const isSuccessful = 
      status === "succeeded" || 
      status === "success" || 
      status === "authorized" || 
      status === "charge.successful" ||
      body.event === "charge.successful";

    if (!isSuccessful) {
      console.warn(`[Webhook Bictorys] Transaction non approuvée ou statut en attente : ${status}`);
      return NextResponse.json({ 
        status: "ignored", 
        message: `Transaction not settled (status: ${status})` 
      }, { status: 200 });
    }

    // --- CAS 1 : Abonnement SaaS Platform ---
    if (metadata.type === "subscription" || paymentReference.startsWith("SUB-")) {
      const userId = metadata.userId;
      const plan = metadata.plan || (paymentReference.includes("BUSINESS") ? "business" : "pro");

      if (userId) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            plan: plan,
            plan_expires_at: nextMonth.toISOString(),
          })
          .eq("id", userId);

        if (profileError) {
          console.error("[Webhook Bictorys] Erreur mise à jour profil SaaS:", profileError);
          return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
        }

        console.log(`[Webhook Bictorys] Forfait ${plan} activé avec succès pour le user ${userId}`);
        return NextResponse.json({ status: "success", type: "subscription_activated" }, { status: 200 });
      }
    }

    // --- CAS 2 : Règlement de Facture Client ---
    const invoiceId = metadata.invoiceId;

    if (!invoiceId) {
      console.warn("[Webhook Bictorys] Requête sans identifiant de facture.");
      return NextResponse.json({ error: "Missing invoice identifier" }, { status: 400 });
    }

    // 1. Récupérer la facture
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select("id, profile_id, invoice_number, total, status")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error(`[Webhook Bictorys] Facture ${invoiceId} introuvable:`, invoiceError);
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 2. Vérification cryptographique optionnelle avec le secret marchand
    if (secretKeyHeader) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("bictorys_webhook_secret, cinetpay_site_id")
        .eq("id", invoice.profile_id)
        .single();

      // @ts-ignore
      const rawSecret = profile?.bictorys_webhook_secret || profile?.cinetpay_site_id;
      if (rawSecret) {
        const decryptedSecret = decrypt(rawSecret);
        if (decryptedSecret && secretKeyHeader !== decryptedSecret) {
          console.warn("[Webhook Bictorys] Signature/Secret-Key invalide pour le marchand.");
          return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
        }
      }
    }

    // 3. Mettre à jour la facture comme payée
    const { error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    if (updateError) {
      console.error(`[Webhook Bictorys] Erreur mise à jour facture:`, updateError);
      return NextResponse.json({ error: "Database update error" }, { status: 500 });
    }

    // 4. Enregistrer la trace de transaction dans `payments`
    try {
      await supabaseAdmin
        .from("payments")
        .insert({
          invoice_id: invoice.id,
          profile_id: invoice.profile_id,
          amount: Number(body.amount) || Number(invoice.total),
          payment_method: body.paymentMethod || "Bictorys (Wave / OM / CB)",
          transaction_id: transactionId || paymentReference,
          status: "completed",
        });
    } catch (paymentInsertErr) {
      console.warn("[Webhook Bictorys] Avertissement enregistrement paiement table payments:", paymentInsertErr);
    }

    console.log(`[Webhook Bictorys] Facture ${invoice.invoice_number} marquée comme PAYÉE via Bictorys !`);

    return NextResponse.json({
      status: "success",
      message: `Invoice ${invoice.invoice_number} marked as paid`,
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Webhook Bictorys] Erreur serveur interne:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
