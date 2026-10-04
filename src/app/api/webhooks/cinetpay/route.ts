import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";

export async function POST(req: Request) {
  try {
    // CinetPay sends the data as URL-encoded or JSON.
    // Usually it's x-www-form-urlencoded
    const formData = await req.formData();
    const cpm_trans_id = formData.get("cpm_trans_id") as string;
    const cpm_site_id = formData.get("cpm_site_id") as string;
    // We passed invoiceId in metadata (often mapped to cpm_custom)
    const invoiceId = formData.get("cpm_custom") as string; 
    
    if (!cpm_trans_id || !cpm_site_id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Initialiser Supabase avec le rôle Service Role pour bypasser le RLS
    // Dans ce prototype, si la clé service n'est pas dispo, on utilise l'anon key (mais c'est limité)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // 2. Si on avait une table de factures dans Supabase, on chercherait le profile_id
    // const { data: invoice } = await supabase.from('invoices').select('profile_id').eq('id', invoiceId).single();
    // const { data: profile } = await supabase.from('profiles').select('cinetpay_apikey, cinetpay_site_id').eq('id', invoice.profile_id).single();
    
    // Pour cet exemple SaaS, on va récupérer la clé d'API correspondant au site_id reçu
    // (Note: dans une vraie BDD, il faut requêter de manière sécurisée)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, cinetpay_apikey, cinetpay_site_id")
      .limit(100);

    let merchantApiKey = "";
    
    // On cherche le profil qui a ce site_id (après déchiffrement)
    if (profiles) {
      for (const p of profiles) {
        // @ts-ignore
        const pSiteId = p.cinetpay_site_id ? decrypt(p.cinetpay_site_id) : "";
        if (pSiteId === cpm_site_id) {
          // @ts-ignore
          merchantApiKey = p.cinetpay_apikey ? decrypt(p.cinetpay_apikey) : "";
          break;
        }
      }
    }

    if (!merchantApiKey) {
      return NextResponse.json({ error: "Merchant not found for this Site ID" }, { status: 404 });
    }

    // 3. Vérifier le statut de la transaction avec CinetPay
    const checkPayload = {
      apikey: merchantApiKey,
      site_id: cpm_site_id,
      transaction_id: cpm_trans_id
    };

    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkPayload),
    });

    const checkData = await response.json();

    // 4. Si la transaction est valide, mettre à jour la BDD
    if (checkData.code === "00" && checkData.data && checkData.data.status === "ACCEPTED") {
      console.log(`Paiement validé pour la facture ${invoiceId}. Montant: ${checkData.data.amount}`);
      
      // Ici vous feriez :
      // await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoiceId);
      
      return NextResponse.json({ status: "success", message: "Invoice marked as paid" }, { status: 200 });
    } else {
      console.error("Échec de la vérification CinetPay:", checkData);
      return NextResponse.json({ status: "failed", message: "Transaction not accepted" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Webhook CinetPay Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
