"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";

export async function savePaymentSettings(siteId: string, apikey: string) {
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

  // Encrypt the sensitive keys
  const encryptedSiteId = encrypt(siteId);
  const encryptedApiKey = encrypt(apikey);

  // For this project, we save them into the `profiles` table.
  // Note: the `profiles` table must have `cinetpay_site_id` and `cinetpay_apikey` columns.
  const { error } = await supabase
    .from("profiles")
    .update({
      cinetpay_site_id: encryptedSiteId,
      cinetpay_apikey: encryptedApiKey,
    } as any) // Using any to bypass strict type checking if not updated in types yet
    .eq("id", user.id);

  if (error) {
    console.error("Error saving payment settings:", error);
    throw new Error("Erreur lors de la sauvegarde des paramètres de paiement.");
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

  if (!user) return { siteId: "", apikey: "" };

  const { data, error } = await supabase
    .from("profiles")
    .select("cinetpay_site_id, cinetpay_apikey")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return { siteId: "", apikey: "" };
  }

  // Decrypt the sensitive keys
  // @ts-ignore - bypassing strict types for new columns
  const decryptedSiteId = data.cinetpay_site_id ? decrypt(data.cinetpay_site_id) : "";
  // @ts-ignore
  const decryptedApiKey = data.cinetpay_apikey ? decrypt(data.cinetpay_apikey) : "";

  return {
    siteId: decryptedSiteId,
    apikey: decryptedApiKey,
  };
}
