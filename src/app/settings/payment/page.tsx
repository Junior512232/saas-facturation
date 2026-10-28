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
  HelpCircle,
  Smartphone,
  Building2,
  Banknote,
  Sparkles,
  Info
} from "lucide-react";
import { savePaymentSettings, getPaymentSettings, PaymentSettingsResult } from "@/app/actions/payment-settings";
import { WaveLogo, OrangeMoneyLogo } from "@/components/ui/payment-logos";

export default function PaymentSettingsPage() {
  const [activeSection, setActiveSection] = useState<"direct" | "gateway">("direct");

  // Direct Payment States
  const [waveNumber, setWaveNumber] = useState("");
  const [waveMerchantId, setWaveMerchantId] = useState("");
  const [enableWaveDirect, setEnableWaveDirect] = useState(true);

  const [omNumber, setOmNumber] = useState("");
  const [omMerchantCode, setOmMerchantCode] = useState("");
  const [enableOmDirect, setEnableOmDirect] = useState(true);

  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankRib, setBankRib] = useState("");
  const [enableBankTransfer, setEnableBankTransfer] = useState(true);

  const [enableCash, setEnableCash] = useState(true);
  const [paymentInstructions, setPaymentInstructions] = useState("");

  // Gateway States (Bictorys)
  const [enableBictorys, setEnableBictorys] = useState(false);
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
        const settings: PaymentSettingsResult = await getPaymentSettings();
        setWaveNumber(settings.waveNumber || "");
        setWaveMerchantId(settings.waveMerchantId || "");
        setEnableWaveDirect(settings.enableWaveDirect);

        setOmNumber(settings.omNumber || "");
        setOmMerchantCode(settings.omMerchantCode || "");
        setEnableOmDirect(settings.enableOmDirect);

        setBankName(settings.bankName || "");
        setBankAccountName(settings.bankAccountName || "");
        setBankRib(settings.bankRib || "");
        setEnableBankTransfer(settings.enableBankTransfer);

        setEnableCash(settings.enableCash);
        setPaymentInstructions(settings.paymentInstructions || "");

        setApiKey(settings.apiKey || "");
        setWebhookSecret(settings.webhookSecret || "");
        setEnableBictorys(settings.enableBictorys || Boolean(settings.apiKey));
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
      await savePaymentSettings({
        waveNumber,
        waveMerchantId,
        enableWaveDirect,
        omNumber,
        omMerchantCode,
        enableOmDirect,
        bankName,
        bankAccountName,
        bankRib,
        enableBankTransfer,
        enableCash,
        paymentInstructions,
        apiKey,
        webhookSecret,
        enableBictorys,
      });
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
          <p className="text-sm text-muted-foreground">Chargement des coordonnées de règlement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Toast Notification */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">Paramètres de paiement enregistrés avec succès !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Modes de Règlement & Encaissements
            </h2>
            <p className="text-sm text-muted-foreground">
              Configurez comment vos clients sénégalais peuvent régler vos factures : Wave, Orange Money, RIB ou passerelle automatique.
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-border pt-4 pb-1">
          <button
            type="button"
            onClick={() => setActiveSection("direct")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeSection === "direct"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Paiements Directs Sénégal (Recommandé)</span>
            <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              0 Clé API
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("gateway")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeSection === "gateway"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Passerelle Bictorys (Optionnelle)</span>
            {apiKey && (
              <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Configurée
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 text-destructive animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* SECTION 1 : PAIEMENTS DIRECTS SÉNÉGAL */}
        {activeSection === "direct" && (
          <div className="flex flex-col gap-6">
            
            {/* Guide pédagogique Sénégal */}
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/20 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-foreground">
                  Paiements directs sans intermédiaire ni commission
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Au Sénégal, la quasi-totalité des clients et entreprises règlent directement via leur numéro <strong>Wave</strong>, <strong>Orange Money</strong> ou par <strong>Virement RIB</strong>.
                  Renseignez vos coordonnées ci-dessous : elles s'afficheront automatiquement sur vos factures imprimées, PDF et sur la page de paiement en ligne de vos clients.
                </p>
              </div>
            </div>

            {/* WAVE DIRECT */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1dc3f7]/15 flex items-center justify-center border border-[#1dc3f7]/30">
                    <WaveLogo className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      Wave Mobile Money Direct
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Paiement instantané par numéro ou lien de paiement Wave
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableWaveDirect}
                    onChange={(e) => setEnableWaveDirect(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-foreground">Activer sur les factures</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground">
                    Numéro de téléphone Wave marchand / compte <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    value={waveNumber}
                    onChange={(e) => setWaveNumber(e.target.value)}
                    placeholder="Ex: 77 123 45 67 ou +221771234567"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Le numéro sur lequel vos clients peuvent effectuer leur transfert Wave.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground">
                    Lien Wave Business ou identifiant marchand (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={waveMerchantId}
                    onChange={(e) => setWaveMerchantId(e.target.value)}
                    placeholder="Ex: pay.wave.com/m/M_xxxxxx ou ID Wave"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Si vous avez un lien de paiement Wave Business, il permettra au client de payer en un clic.
                  </p>
                </div>
              </div>
            </div>

            {/* ORANGE MONEY DIRECT */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff7900]/15 flex items-center justify-center border border-[#ff7900]/30">
                    <OrangeMoneyLogo className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      Orange Money Direct
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Encaissement par numéro direct ou Code Marchand Orange Money
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableOmDirect}
                    onChange={(e) => setEnableOmDirect(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-foreground">Activer sur les factures</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground">
                    Numéro de téléphone Orange Money
                  </label>
                  <input
                    type="tel"
                    value={omNumber}
                    onChange={(e) => setOmNumber(e.target.value)}
                    placeholder="Ex: 77 890 12 34 ou +221778901234"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Numéro destinataire du transfert Orange Money.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground">
                    Code Marchand Orange Money (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={omMerchantCode}
                    onChange={(e) => setOmMerchantCode(e.target.value)}
                    placeholder="Ex: 123456 (6 chiffres)"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Génère la syntaxe USSD rapide <code>*144#39*CODE*MONTANT#</code> pour vos clients.
                  </p>
                </div>
              </div>
            </div>

            {/* COMPTE BANCAIRE / RIB UEMOA */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      Virement Bancaire (RIB / IBAN Sénégal)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Indispensable pour les factures B2B et gros montants (&gt; 500 000 FCFA)
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableBankTransfer}
                    onChange={(e) => setEnableBankTransfer(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-foreground">Activer sur les factures</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground">
                    Nom de votre banque
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ex: CBAO Attijariwafa, Société Générale, Ecobank, BOA..."
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground">
                    Titulaire du compte bancaire
                  </label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="Ex: Mon Entreprise SARL"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-foreground">
                    Relevé d'Identité Bancaire (RIB UEMOA / IBAN)
                  </label>
                  <input
                    type="text"
                    value={bankRib}
                    onChange={(e) => setBankRib(e.target.value)}
                    placeholder="Ex: SN08 SN012 01234 56789012345 67"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono tracking-wider focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Format standard : Code Banque (5) - Guichet (5) - Numéro de Compte (12) - Clé RIB (2).
                  </p>
                </div>
              </div>
            </div>

            {/* ESPÈCES ET CONSIGNES */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Espèces & Consignes de paiement
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Instructions affichées à vos clients lors du règlement
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCash}
                    onChange={(e) => setEnableCash(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-foreground">Autoriser le règlement en espèces</span>
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground">
                  Instructions personnalisées de paiement (affichées sur la facture)
                </label>
                <textarea
                  rows={2}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  placeholder="Ex: Merci de mentionner votre numéro de facture en référence de votre transfert Wave ou virement."
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2 : PASSERELLE BICTORYS AUTOMATISÉE */}
        {activeSection === "gateway" && (
          <div className="flex flex-col gap-6">

            <div className="p-5 bg-gradient-to-r from-blue-500/10 via-brand-blue/10 to-transparent border border-blue-500/20 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-brand-blue shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Passerelle Bictorys : Réconciliation Automatique
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cette passerelle est <strong>optionnelle</strong>. Elle permet de générer une page de paiement hébergée Bictorys et de marquer automatiquement votre facture comme <em>"Payée"</em> dès que le client valide avec Wave ou Orange Money, sans aucune intervention de votre part.
                </p>
              </div>
            </div>

            {/* Badges Bictorys */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Modes automatisés :</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1dc3f7]/15 text-[#0091bd] border border-[#1dc3f7]/30 shadow-xs">
                <WaveLogo className="w-4 h-4" />
                <span>Wave API</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ff7900]/15 text-[#ea580c] border border-[#ff7900]/30 shadow-xs">
                <OrangeMoneyLogo className="w-4 h-4" />
                <span>Orange Money</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">
                Free Money
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                Visa / Mastercard
              </span>
              <a
                href="https://afro.tools/providers/bictorys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Standard afro.tools ATSS</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
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

            {/* Form Clés API */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Identifiants API Bictorys</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Renseignez vos clés API délivrées par Bictorys (laissez vide si vous utilisez uniquement le mode direct).
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
                      Clé API Bictorys (X-Api-Key)
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
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Ex: bict_live_xxxxxxxx ou bict_test_xxxxxxxx"
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Clé chiffrée avec un algorithme bancaire AES-256-GCM avant d'être sauvegardée.
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
                    Utilisée pour authentifier les notifications de paiement Bictorys.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableBictorys}
                      onChange={(e) => setEnableBictorys(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-bold text-foreground">
                      Activer le bouton de paiement automatisé Bictorys sur les factures publiques
                    </span>
                  </label>
                </div>
              </div>

              {/* Documentation notice */}
              <div className="p-4 bg-muted/40 rounded-xl border border-border/60 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Vous n'avez pas encore de compte Bictorys ?</p>
                  <p>
                    Ce n'est pas obligatoire. Vous pouvez très bien utiliser uniquement vos coordonnées directes Wave, Orange Money et RIB en toute simplicité.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Global Save Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed min-w-[240px]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Enregistrement en cours..." : "Enregistrer tous les paramètres"}
          </button>
        </div>

      </form>
    </div>
  );
}
