"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { savePaymentSettings, getPaymentSettings } from "@/app/actions/payment-settings";

export default function PaymentSettingsPage() {
  const [siteId, setSiteId] = useState("");
  const [apikey, setApikey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getPaymentSettings();
        setSiteId(settings.siteId || "");
        setApikey(settings.apikey || "");
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await savePaymentSettings(siteId, apikey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full flex flex-col gap-8">
      {/* Toast Notification */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Clés CinetPay enregistrées de manière sécurisée !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-primary" />
          Paramètres de paiement
        </h2>
        <p className="text-muted-foreground mt-2">
          Configurez votre compte <strong>CinetPay</strong> pour encaisser les paiements (Wave, Orange Money, Free Money, Visa, Mastercard) directement sur votre propre portefeuille.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Warning Box */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-500">Chiffrement AES-256-GCM</h4>
          <p className="text-xs text-amber-700/80 dark:text-amber-500/80">
            Vos clés API sont chiffrées de bout en bout avant d'être stockées dans notre base de données. Sans ces clés correctement renseignées, vos clients ne pourront pas régler leurs factures en ligne.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-foreground">Clés API CinetPay</h3>
          <p className="text-xs text-muted-foreground">
            Vous trouverez ces informations dans votre <a href="https://app.cinetpay.com/" target="_blank" rel="noreferrer" className="text-brand-blue hover:underline font-semibold">Tableau de bord CinetPay</a> sous Paramètres &gt; API.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Site ID</label>
            <input
              type="text"
              required
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="Ex: 5865432"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <p className="text-[11px] text-muted-foreground">L'identifiant unique de votre site CinetPay.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">API Key (Clé secrète)</label>
            <input
              type="password"
              required
              value={apikey}
              onChange={(e) => setApikey(e.target.value)}
              placeholder="Ex: 1234567890abcdef1234567890abcdef"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <p className="text-[11px] text-muted-foreground">Votre clé d'API (apikey) strictement confidentielle.</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-4 pt-6 border-t border-border">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Chiffrement..." : "Enregistrer de façon sécurisée"}
          </button>
        </div>
      </form>
    </div>
  );
}
