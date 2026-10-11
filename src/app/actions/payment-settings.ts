"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";

export async function savePaymentSettings(apiKey: string, webhookSecret: string = "") {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Non autorisé");
  }

  // Chiffrement des clés sensibles Bictorys
  const encryptedApiKey = encrypt(apiKey?.trim() || "");
  const encryptedWebhookSecret = encrypt(webhookSecret?.trim() || "");

  // Tentative de sauvegarde dans les colonnes Bictorys dédiées
  // Avec fallback gracieux sur cinetpay_* si les nouvelles colonnes ne sont pas encore migrées
  const updatePayload: Record<string, any> = {
    bictorys_api_key: encryptedApiKey,
    bictorys_webhook_secret: encryptedWebhookSecret,
    // Backup de compatibilité avec le schéma existant
    cinetpay_apikey: encryptedApiKey,
    cinetpay_site_id: encryptedWebhookSecret,
  };

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload as any)
    .eq("id", user.id);

  if (error) {
    // Si la colonne bictorys_api_key n'existe pas encore dans Supabase, sauvegarder via cinetpay_*
    console.warn("Échec d'enregistrement avec bictorys_*, tentative avec les colonnes existantes:", error.message);
    const { error: fallbackError } = await supabase
      .from("profiles")
      .update({
        cinetpay_apikey: encryptedApiKey,
        cinetpay_site_id: encryptedWebhookSecret,
      } as any)
      .eq("id", user.id);

    if (fallbackError) {
      console.error("Error saving payment settings fallback:", fallbackError);
      throw new Error("Erreur lors de la sauvegarde des paramètres de paiement.");
    }
  }

  return { success: true };
}

export async function getPaymentSettings() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { apiKey: "", webhookSecret: "", siteId: "", apikey: "" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("bictorys_api_key, bictorys_webhook_secret, cinetpay_site_id, cinetpay_apikey")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    // Si la requête a échoué (par exemple colonne inexistante), essayer avec cinetpay seul
    const { data: fallbackData } = await supabase
      .from("profiles")
      .select("cinetpay_site_id, cinetpay_apikey")
      .eq("id", user.id)
      .single();

    if (!fallbackData) {
      return { apiKey: "", webhookSecret: "", siteId: "", apikey: "" };
    }

    const decryptedKey = fallbackData.cinetpay_apikey ? decrypt(fallbackData.cinetpay_apikey) : "";
    const decryptedSecret = fallbackData.cinetpay_site_id ? decrypt(fallbackData.cinetpay_site_id) : "";

    return {
      apiKey: decryptedKey,
      webhookSecret: decryptedSecret,
      apikey: decryptedKey,
      siteId: decryptedSecret,
    };
  }

  // Déchiffrement des clés
  // @ts-ignore
  const rawApiKey = data.bictorys_api_key || data.cinetpay_apikey || "";
  // @ts-ignore
  const rawWebhookSecret = data.bictorys_webhook_secret || data.cinetpay_site_id || "";

  const decryptedApiKey = rawApiKey ? decrypt(rawApiKey) : "";
  const decryptedWebhookSecret = rawWebhookSecret ? decrypt(rawWebhookSecret) : "";

  return {
    apiKey: decryptedApiKey,
    webhookSecret: decryptedWebhookSecret,
    // Compatibilité rétroactive
    apikey: decryptedApiKey,
    siteId: decryptedWebhookSecret,
  };
}
