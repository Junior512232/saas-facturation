"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/encryption";
import { Database } from "@/lib/database.types";

export interface PaymentSettingsInput {
  // Bictorys (Optionnel)
  apiKey?: string;
  webhookSecret?: string;
  enableBictorys?: boolean;

  // Wave Direct (Sénégal)
  waveNumber?: string;
  waveMerchantId?: string;
  enableWaveDirect?: boolean;

  // Orange Money Direct (Sénégal)
  omNumber?: string;
  omMerchantCode?: string;
  enableOmDirect?: boolean;

  // Virement bancaire / RIB UEMOA
  bankName?: string;
  bankAccountName?: string;
  bankRib?: string;
  enableBankTransfer?: boolean;

  // Espèces / À la livraison
  enableCash?: boolean;

  // Consignes de paiement
  paymentInstructions?: string;
}

export interface PaymentSettingsResult {
  apiKey: string;
  webhookSecret: string;
  enableBictorys: boolean;

  waveNumber: string;
  waveMerchantId: string;
  enableWaveDirect: boolean;

  omNumber: string;
  omMerchantCode: string;
  enableOmDirect: boolean;

  bankName: string;
  bankAccountName: string;
  bankRib: string;
  enableBankTransfer: boolean;

  enableCash: boolean;
  paymentInstructions: string;

  // Compatibilité rétroactive
  apikey?: string;
  siteId?: string;
}

export async function savePaymentSettings(
  inputOrApiKey: string | PaymentSettingsInput,
  maybeWebhookSecret: string = ""
) {
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

  // Normalisation des arguments
  const input: PaymentSettingsInput = typeof inputOrApiKey === "string"
    ? { apiKey: inputOrApiKey, webhookSecret: maybeWebhookSecret }
    : inputOrApiKey;

  // Chiffrement des clés sensibles Bictorys si fournies
  const rawApiKey = (input.apiKey || "").trim();
  const rawSecret = (input.webhookSecret || "").trim();
  const encryptedApiKey = rawApiKey ? encrypt(rawApiKey) : "";
  const encryptedWebhookSecret = rawSecret ? encrypt(rawSecret) : "";

  // Objet JSONB de configuration globale (garantie de persistance sans friction de schéma)
  const methodsConfig = {
    enableBictorys: input.enableBictorys ?? Boolean(rawApiKey),
    enableWaveDirect: input.enableWaveDirect ?? Boolean(input.waveNumber?.trim()),
    waveNumber: input.waveNumber?.trim() || "",
    waveMerchantId: input.waveMerchantId?.trim() || "",
    enableOmDirect: input.enableOmDirect ?? Boolean(input.omNumber?.trim() || input.omMerchantCode?.trim()),
    omNumber: input.omNumber?.trim() || "",
    omMerchantCode: input.omMerchantCode?.trim() || "",
    enableBankTransfer: input.enableBankTransfer ?? Boolean(input.bankRib?.trim()),
    bankName: input.bankName?.trim() || "",
    bankAccountName: input.bankAccountName?.trim() || "",
    bankRib: input.bankRib?.trim() || "",
    enableCash: input.enableCash ?? false,
    paymentInstructions: input.paymentInstructions?.trim() || "",
  };

  // Tentative 1 : Mise à jour complète avec colonnes dédiées + config JSONB
  const primaryPayload: Record<string, any> = {
    payment_methods_config: methodsConfig,
    wave_number: methodsConfig.waveNumber || null,
    wave_merchant_id: methodsConfig.waveMerchantId || null,
    om_number: methodsConfig.omNumber || null,
    om_merchant_code: methodsConfig.omMerchantCode || null,
    bank_name: methodsConfig.bankName || null,
    bank_account_name: methodsConfig.bankAccountName || null,
    bank_rib: methodsConfig.bankRib || null,
    payment_instructions: methodsConfig.paymentInstructions || null,
  };

  if (rawApiKey !== undefined) {
    primaryPayload.bictorys_api_key = encryptedApiKey;
    primaryPayload.bictorys_webhook_secret = encryptedWebhookSecret;
    primaryPayload.cinetpay_apikey = encryptedApiKey;
    primaryPayload.cinetpay_site_id = encryptedWebhookSecret;
  }

  const { error: primaryError } = await supabase
    .from("profiles")
    .update(primaryPayload as any)
    .eq("id", user.id);

  if (!primaryError) {
    return { success: true };
  }

  console.warn("Mise à jour colonnes directes a échoué, repli adaptatif :", primaryError.message);

  // Tentative 2 : Repli avec colonnes Bictorys + JSONB seul
  const fallbackPayload: Record<string, any> = {
    payment_methods_config: methodsConfig,
  };
  if (rawApiKey !== undefined) {
    fallbackPayload.bictorys_api_key = encryptedApiKey;
    fallbackPayload.bictorys_webhook_secret = encryptedWebhookSecret;
    fallbackPayload.cinetpay_apikey = encryptedApiKey;
    fallbackPayload.cinetpay_site_id = encryptedWebhookSecret;
  }

  const { error: fallbackError } = await supabase
    .from("profiles")
    .update(fallbackPayload as any)
    .eq("id", user.id);

  if (!fallbackError) {
    return { success: true };
  }

  // Tentative 3 : Repli minimal sur cinetpay_*
  const minimalPayload: Record<string, any> = {};
  if (rawApiKey !== undefined) {
    minimalPayload.cinetpay_apikey = encryptedApiKey;
    minimalPayload.cinetpay_site_id = encryptedWebhookSecret;
  }

  const { error: minimalError } = await supabase
    .from("profiles")
    .update(minimalPayload as any)
    .eq("id", user.id);

  if (minimalError) {
    console.error("Échec persistance paramètres paiement :", minimalError);
    throw new Error("Erreur lors de la sauvegarde des paramètres de paiement.");
  }

  return { success: true };
}

export async function getPaymentSettings(): Promise<PaymentSettingsResult> {
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

  const defaultResult: PaymentSettingsResult = {
    apiKey: "",
    webhookSecret: "",
    enableBictorys: false,
    waveNumber: "",
    waveMerchantId: "",
    enableWaveDirect: true,
    omNumber: "",
    omMerchantCode: "",
    enableOmDirect: true,
    bankName: "",
    bankAccountName: "",
    bankRib: "",
    enableBankTransfer: true,
    enableCash: true,
    paymentInstructions: "Indiquez svp votre numéro de facture en référence lors de votre transfert.",
    apikey: "",
    siteId: "",
  };

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return defaultResult;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return defaultResult;
  }

  const rawData = data as any;
  const cfg = (rawData.payment_methods_config || {}) as Record<string, any>;

  // Déchiffrement Bictorys
  const rawApiKey = rawData.bictorys_api_key || rawData.cinetpay_apikey || "";
  const rawWebhookSecret = rawData.bictorys_webhook_secret || rawData.cinetpay_site_id || "";
  const decryptedApiKey = rawApiKey ? decrypt(rawApiKey) : "";
  const decryptedWebhookSecret = rawWebhookSecret ? decrypt(rawWebhookSecret) : "";

  const waveNum = rawData.wave_number || cfg.waveNumber || rawData.phone || "";
  const omNum = rawData.om_number || cfg.omNumber || rawData.phone || "";

  return {
    apiKey: decryptedApiKey,
    webhookSecret: decryptedWebhookSecret,
    enableBictorys: cfg.enableBictorys ?? Boolean(decryptedApiKey),

    waveNumber: waveNum,
    waveMerchantId: rawData.wave_merchant_id || cfg.waveMerchantId || "",
    enableWaveDirect: cfg.enableWaveDirect !== false,

    omNumber: omNum,
    omMerchantCode: rawData.om_merchant_code || cfg.omMerchantCode || "",
    enableOmDirect: cfg.enableOmDirect !== false,

    bankName: rawData.bank_name || cfg.bankName || "",
    bankAccountName: rawData.bank_account_name || cfg.bankAccountName || rawData.company_name || "",
    bankRib: rawData.bank_rib || cfg.bankRib || "",
    enableBankTransfer: cfg.enableBankTransfer !== false && Boolean(rawData.bank_rib || cfg.bankRib),

    enableCash: cfg.enableCash ?? true,
    paymentInstructions: rawData.payment_instructions || cfg.paymentInstructions || "Indiquez svp votre numéro de facture en référence lors de votre transfert.",

    apikey: decryptedApiKey,
    siteId: decryptedWebhookSecret,
  };
}
