import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Comparaison sécurisée à temps constant (anti-timing attack)
 * Conforme aux spécifications afro.tools (ATSS) pour Bictorys
 */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  try {
    // Récupération du corps brut (Raw Body) nécessaire pour le calcul HMAC
    const rawBody = await req.text();
    let body: any;

    try {
      body = JSON.parse(rawBody);
    } catch {
      // Fallback si form-urlencoded
      const searchParams = new URLSearchParams(rawBody);
      body = Object.fromEntries(searchParams.entries());
    }

    console.log("[Webhook Bictorys] Payload reçu :", JSON.stringify(body, null, 2));

    const secretKeyHeader = req.headers.get("x-secret-key") || req.headers.get("X-Secret-Key") || "";
    const signatureHeader = req.headers.get("x-webhook-signature") || req.headers.get("X-Webhook-Signature") || "";
    const timestampHeader = req.headers.get("x-webhook-timestamp") || req.headers.get("X-Webhook-Timestamp") || "";

    const transactionId = body.id || body.transactionId || body.chargeId || "";
    const status = (body.status || body.event || "").toLowerCase();
    const paymentReference = body.paymentReference || body.reference || "";
    const metadata = body.metadata || {};

    // 1. Anti-rejeu (Replay attack protection) : rejet si timestamp > 5 minutes
    if (timestampHeader) {
      const ts = Number(timestampHeader);
      if (!isNaN(ts) && Math.abs(Date.now() - ts) > 300_000) {
        console.warn("[Webhook Bictorys] Requête rejetée : timestamp expiré (> 5 minutes).");
        return NextResponse.json({ error: "Timestamp expired" }, { status: 400 });
      }
    }

    // 2. Vérification du statut de succès
    const isSuccessful = 
      status === "succeeded" || 
      status === "success" || 
      status === "authorized" || 
      status === "charge.successful" ||
      body.event === "charge.successful";

    if (!isSuccessful) {
      console.warn(`[Webhook Bictorys] Transaction non acquittée (statut: ${status}). Accusé de réception 200 envoyé.`);
      return NextResponse.json({ 
        status: "ignored", 
        message: `Transaction not settled (status: ${status})` 
      }, { status: 200 });
    }

    // --- CAS 1 : Abonnement SaaS iziFacture (Plateforme) ---
    if (metadata.type === "subscription" || paymentReference.startsWith("SUB-")) {
      const userId = metadata.userId;
      const plan = metadata.plan || (paymentReference.includes("BUSINESS") ? "business" : "pro");

      // Vérification du secret plateforme
      const platformSecret = process.env.BICTORYS_PLATFORM_WEBHOOK_SECRET || process.env.BICTORYS_WEBHOOK_SECRET;
      if (platformSecret) {
        if (signatureHeader && timestampHeader) {
          const expectedSig = crypto
            .createHmac("sha256", platformSecret)
            .update(`${timestampHeader}.${rawBody}`)
            .digest("hex");
          if (!safeCompare(signatureHeader, expectedSig)) {
            console.warn("[Webhook Bictorys] Signature HMAC invalide pour l'abonnement SaaS.");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
          }
        } else if (secretKeyHeader) {
          if (!safeCompare(secretKeyHeader, platformSecret)) {
            console.warn("[Webhook Bictorys] Clé secrète invalide pour l'abonnement SaaS.");
            return NextResponse.json({ error: "Invalid secret key" }, { status: 401 });
          }
        }
      }

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

    // --- CAS 2 : Règlement Facture Client ou Ticket de Caisse POS ---
    const invoiceIdentifier = 
      metadata.invoiceId || 
      metadata.invoiceNumber || 
      metadata.saleNumber || 
      (paymentReference.startsWith("INV-") ? paymentReference.split("-")[1] : null) ||
      (paymentReference.startsWith("TICKET-") ? paymentReference.replace("TICKET-", "").split("-")[0] : null) ||
      paymentReference;

    if (!invoiceIdentifier) {
      console.warn("[Webhook Bictorys] Requête sans référence de facture ou ticket.");
      return NextResponse.json({ error: "Missing invoice identifier" }, { status: 200 });
    }

    // Recherche de la facture (par UUID ou numéro de facture / ticket)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceIdentifier);
    let invoice: any = null;

    if (isUuid) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("id, profile_id, invoice_number, total, status")
        .eq("id", invoiceIdentifier)
        .maybeSingle();
      invoice = data;
    }

    if (!invoice) {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("id, profile_id, invoice_number, total, status")
        .eq("invoice_number", invoiceIdentifier)
        .maybeSingle();
      invoice = data;
    }

    if (!invoice) {
      console.error(`[Webhook Bictorys] Facture ou ticket ${invoiceIdentifier} introuvable.`);
      return NextResponse.json({ error: "Invoice not found" }, { status: 200 });
    }

    // 3. Vérification de l'authenticité (HMAC ou X-Secret-Key) avec les clés du marchand
    if (invoice.profile_id) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("bictorys_webhook_secret, cinetpay_site_id")
        .eq("id", invoice.profile_id)
        .single();

      // @ts-ignore
      const rawSecret = profile?.bictorys_webhook_secret || profile?.cinetpay_site_id || process.env.BICTORYS_PLATFORM_WEBHOOK_SECRET;
      
      if (rawSecret) {
        const decryptedSecret = decrypt(rawSecret) || rawSecret;
        
        if (signatureHeader && timestampHeader) {
          const expectedSig = crypto
            .createHmac("sha256", decryptedSecret)
            .update(`${timestampHeader}.${rawBody}`)
            .digest("hex");
          if (!safeCompare(signatureHeader, expectedSig)) {
            console.warn("[Webhook Bictorys] Signature HMAC invalide.");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
          }
        } else if (secretKeyHeader) {
          if (!safeCompare(secretKeyHeader, decryptedSecret)) {
            console.warn("[Webhook Bictorys] Clé secrète X-Secret-Key invalide pour le marchand.");
            return NextResponse.json({ error: "Invalid secret key" }, { status: 401 });
          }
        }
      }
    }

    // 4. Contrôle Anti-Fraude (Vérification du montant afro.tools ATSS Gotcha)
    const paidAmount = Number(body.amount);
    const expectedAmount = Number(invoice.total);
    if (!isNaN(paidAmount) && paidAmount > 0 && expectedAmount > 0) {
      // Tolérance minime de 1 FCFA pour éviter les soucis d'arrondi
      if (paidAmount < expectedAmount - 1) {
        console.warn(`[Webhook Bictorys] Alerte Anti-Fraude : Montant reçu (${paidAmount}) inférieur au montant attendu (${expectedAmount}).`);
        return NextResponse.json({ error: "Amount mismatch detected" }, { status: 400 });
      }
    }

    // 5. Idempotence : si la facture est déjà marquée 'paid', acquitter immédiatement sans doublon
    if (invoice.status === "paid") {
      console.log(`[Webhook Bictorys] Facture ${invoice.invoice_number} déjà payée (idempotence respectée).`);
      return NextResponse.json({ status: "already_paid", message: "Invoice already marked as paid" }, { status: 200 });
    }

    // 6. Mise à jour de la facture en 'paid'
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

    // 7. Enregistrement de l'historique dans la table `payments`
    try {
      await supabaseAdmin
        .from("payments")
        .insert({
          invoice_id: invoice.id,
          profile_id: invoice.profile_id,
          amount: paidAmount > 0 ? paidAmount : expectedAmount,
          payment_method: body.payment_type || body.paymentMethod || "Bictorys (Wave / OM / CB)",
          transaction_id: transactionId || paymentReference || `BICT-${Date.now()}`,
          status: "completed",
        });
    } catch (paymentInsertErr) {
      console.warn("[Webhook Bictorys] Avertissement table payments:", paymentInsertErr);
    }

    console.log(`[Webhook Bictorys] Facture/Ticket ${invoice.invoice_number} réglé avec succès via Bictorys !`);

    // Réponse HTTP 200 immédiate pour stopper les tentatives de réémission
    return NextResponse.json({
      status: "success",
      message: `Invoice ${invoice.invoice_number} marked as paid`,
      transactionId,
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Webhook Bictorys] Erreur serveur interne:", error);
    // Renvoi 200 ou 500 selon criticité
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
