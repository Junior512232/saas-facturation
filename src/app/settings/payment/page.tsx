"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Save, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  HelpCircle
} from "lucide-react";
import { savePaymentSettings, getPaymentSettings } from "@/app/actions/payment-settings";
import { WaveLogo, OrangeMoneyLogo } from "@/components/ui/payment-logos";

export default function PaymentSettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/webhooks/bictorys`);
    }

    async function loadSettings() {
      try {
        const settings = await getPaymentSettings();
        setApiKey(settings.apiKey || "");
        setWebhookSecret(settings.webhookSecret || "");
      } catch (err) {
        console.error("Failed to load payment settings", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleCopyWebhook = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2500);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await savePaymentSettings(apiKey, webhookSecret);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  const isTestKey = apiKey.toLowerCase().includes("test") || apiKey.startsWith("sk_test_") || apiKey.startsWith("pk_test_");

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement des paramètres Bictorys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full flex flex-col gap-8">
      {/* Toast Notification */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">Clés Bictorys enregistrées et chiffrées avec succès !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Paramètres de paiement Bictorys
            </h2>
            <p className="text-sm text-muted-foreground">
              Acceptez les paiements Mobile Money (Wave, Orange Money, Free Money) et Carte Bancaire directement sur vos factures.
            </p>
          </div>
        </div>

        {/* Badges des méthodes supportées par Bictorys */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Modes de paiement pris en charge :</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1dc3f7]/15 text-[#0091bd] border border-[#1dc3f7]/30 shadow-xs">
            <WaveLogo className="w-4 h-4" />
            <span>Wave Mobile Money</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ff7900]/15 text-[#ea580c] border border-[#ff7900]/30 shadow-xs">
            <OrangeMoneyLogo className="w-4 h-4" />
            <span>Orange Money</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Free Money
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Visa / Mastercard
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 text-destructive animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Security Banner */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3 text-blue-900 dark:text-blue-300">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold flex items-center gap-1.5">
            Protection des données & Chiffrement AES-256-GCM
          </h4>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            Vos identifiants Bictorys sont chiffrés avec un algorithme de niveau bancaire avant d'être persistés. Ils ne sont déchiffrés qu'au moment de générer le lien de règlement pour vos clients.
          </p>
        </div>
      </div>

      {/* Webhook Configuration Guide */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              URL de Webhook Bictorys
            </h3>
            <p className="text-xs text-muted-foreground">
              Copiez cette URL et collez-la dans la section <strong>Webhooks</strong> de votre compte Bictorys pour valider automatiquement vos factures dès réception d'un paiement.
            </p>
          </div>
          <a 
            href="https://dashboard.bictorys.com" 
            target="_blank" 
            rel="noreferrer" 
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline shrink-0"
          >
            Dashboard Bictorys <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-2.5 rounded-xl border border-border">
          <code className="text-xs font-mono text-foreground flex-1 break-all select-all px-2">
            {webhookUrl || "https://votre-domaine.com/api/webhooks/bictorys"}
          </code>
          <button
            type="button"
            onClick={handleCopyWebhook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shrink-0"
          >
            {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedWebhook ? "Copié !" : "Copier"}
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Identifiants API Bictorys</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Obtenez vos clés dans votre espace développeur Bictorys sous <strong>Paramètres &gt; Développeurs &gt; Clés API</strong>.
            </p>
          </div>
          {isTestKey && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Mode Test (Sandbox)
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {/* Clé API Publique (X-Api-Key) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Clé API Bictorys (X-Api-Key) <span className="text-destructive">*</span>
              </label>
              <button 
                type="button" 
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showApiKey ? "Masquer" : "Afficher"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ex: bict_live_xxxxxxxx ou bict_test_xxxxxxxx"
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Votre clé publique Bictorys transmise dans l'en-tête HTTP <code>X-Api-Key</code> pour créer les liens de paiement de factures.
            </p>
          </div>

          {/* Webhook Secret (X-Secret-Key) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Clé Secrète Webhook (X-Secret-Key)
              </label>
              <button 
                type="button" 
                onClick={() => setShowSecret(!showSecret)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showSecret ? "Masquer" : "Afficher"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Ex: sec_wh_xxxxxxxx"
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Utilisée pour authentifier de manière cryptographique les notifications de paiement envoyées par Bictorys à votre webhook.
            </p>
          </div>
        </div>

        {/* Documentation notice */}
        <div className="p-4 bg-muted/40 rounded-xl border border-border/60 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Vous n'avez pas encore de compte Bictorys ?</p>
            <p>
              Inscrivez-vous sur <a href="https://bictorys.com" target="_blank" rel="noreferrer" className="text-brand-blue hover:underline font-semibold">bictorys.com</a> pour activer vos encaissements Wave, Orange Money et Cartes Bancaires en quelques minutes.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed min-w-[220px]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Chiffrement et sauvegarde..." : "Enregistrer les clés"}
          </button>
        </div>
      </form>
    </div>
  );
}
