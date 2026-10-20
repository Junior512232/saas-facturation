"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  CreditCard, 
  Building2, 
  UserCheck, 
  Zap,
  Check,
  FileText,
  Receipt,
  Users,
  Package,
  X as CloseIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { initiateSubscriptionPayment } from "@/app/actions/payment";

export default function BillingPage() {
  const { user, updateProfile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("subscription_success") === "true") {
        setSuccess("Règlement reçu ! Votre forfait est en cours d'activation via la passerelle sécurisée.");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get("error") === "true") {
        setError("Le paiement de l'abonnement n'a pas pu aboutir ou a été interrompu.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleSubscribe = async (planName: "pro" | "business") => {
    setLoadingPlan(planName);
    setError("");
    
    try {
      const res = await initiateSubscriptionPayment({ plan: planName });
      
      if (res.success && res.paymentUrl) {
        // Redirection vers le guichet sécurisé Bictorys
        window.location.href = res.paymentUrl;
      } else {
        setError(res.error || "Impossible d'initialiser le paiement sécurisé de l'abonnement.");
        setLoadingPlan(null);
      }
    } catch (err: any) {
      console.error("Failed to subscribe:", err);
      setError(err.message || "Une erreur est survenue lors de l'accès au paiement.");
      setLoadingPlan(null);
    }
  };

  const currentPlan = user?.plan || "gratuit";
  const planExpiresAt = user?.plan_expires_at 
    ? new Date(user.plan_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full flex flex-col gap-8">
      {/* Messages de statut */}
      {success && (
        <div className="bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive text-destructive-foreground px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Titre et description */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Abonnement & Forfaits</h2>
        <p className="text-muted-foreground text-sm">Tarification transparente en FCFA • Sans engagement • Paiement Bictorys instantané.</p>
      </div>

      {/* Résumé du forfait actuel */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Votre formule active :</span>
              <h4 className="text-2xl font-black capitalize text-foreground">{currentPlan}</h4>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Actif
              </span>
            </div>
            {planExpiresAt ? (
              <p className="text-xs text-muted-foreground mt-1">Renouvellement prévu le <strong className="text-foreground">{planExpiresAt}</strong></p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Forfait gratuit de base limité à 5 factures par mois avec filigrane.</p>
            )}
          </div>
        </div>

        {currentPlan === "gratuit" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <Zap className="w-4 h-4 shrink-0" />
            <span>Passez à Pro pour débloquer les factures illimitées et retirer le filigrane</span>
          </div>
        )}
      </div>

      {/* Grille des offres : 3 colonnes axées sur les fonctionnalités et quotas réels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* 1. PLAN GRATUIT */}
        <div className={`rounded-3xl p-6 sm:p-7 flex flex-col border transition-all ${
          currentPlan === "gratuit" 
            ? "bg-card border-border shadow-sm ring-1 ring-border" 
            : "bg-card/60 border-border/60"
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border inline-block mb-1">
                Découverte & Essai
              </span>
              <h3 className="text-xl font-black text-foreground">Gratuit</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Pour tester et émettre ses premières factures</p>
            </div>
            {currentPlan === "gratuit" && (
              <span className="bg-muted text-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-border">
                Actuel
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-4">
            <span className="text-3xl font-black text-foreground">0</span>
            <span className="text-xs text-muted-foreground font-semibold">FCFA / mois</span>
          </div>

          {/* Quotas clés chiffrés */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-2 mb-5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Factures & Devis :
              </span>
              <span className="font-mono font-bold text-foreground">5 / mois</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Receipt className="w-3.5 h-3.5 text-muted-foreground" /> Tickets de Caisse :
              </span>
              <span className="font-mono font-bold text-foreground">15 / mois</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Users className="w-3.5 h-3.5 text-muted-foreground" /> Bulletins de Paie :
              </span>
              <span className="font-mono font-bold text-foreground">1 test / mois</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Package className="w-3.5 h-3.5 text-muted-foreground" /> Articles en Stock :
              </span>
              <span className="font-mono font-bold text-foreground">10 articles max</span>
            </div>
          </div>

          <ul className="space-y-2.5 mb-8 flex-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Export PDF standard (avec filigrane iziFlow)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Calcul automatique TVA sénégalaise 18%</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Terminal de caisse direct au comptoir</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Partage manuel de liens de paiement</span>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground/60">
              <CloseIcon className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <span>Sans logo personnalisé ni cachet d'entreprise</span>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground/60">
              <CloseIcon className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <span>Sans relances automatiques WhatsApp</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-border mt-auto">
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl text-xs font-bold"
              disabled={true}
            >
              {currentPlan === "gratuit" ? "Forfait actuel (Gratuit)" : "Forfait de base"}
            </Button>
          </div>
        </div>

        {/* 2. PLAN PRO (Recommandé • Commerces & TPE) */}
        <div className={`rounded-3xl p-6 sm:p-7 flex flex-col relative transition-all border-2 ${
          currentPlan === "pro"
            ? "bg-card border-brand-blue ring-2 ring-brand-blue/30 shadow-lg"
            : "bg-card border-brand-blue shadow-md hover:shadow-xl hover:border-brand-blue"
        }`}>
          {/* Badge Recommandé */}
          <div className="absolute -top-3.5 right-6 bg-brand-blue text-white text-[10px] font-black tracking-wider uppercase px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Recommandé • Commerces &amp; TPE
          </div>

          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 inline-block mb-1">
                Le Plus Populaire
              </span>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                Pro
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Pour commerçants, boutiques, artisans &amp; prestataires</p>
            </div>
            {currentPlan === "pro" && (
              <span className="bg-brand-blue text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                Actuel
              </span>
            )}
          </div>

          {/* Prix PRO : 10 000 FCFA */}
          <div className="flex items-baseline gap-1 my-4">
            <span className="text-4xl font-black text-foreground">10 000</span>
            <span className="text-xs text-muted-foreground font-semibold">FCFA / mois</span>
          </div>

          {/* Quotas clés chiffrés */}
          <div className="p-3.5 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 space-y-2 mb-5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <FileText className="w-3.5 h-3.5 text-brand-blue" /> Factures &amp; Devis :
              </span>
              <span className="font-mono font-black text-brand-blue">150 / mois</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Receipt className="w-3.5 h-3.5 text-brand-blue" /> Tickets de Caisse :
              </span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">ILLIMITÉS</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Users className="w-3.5 h-3.5 text-brand-blue" /> Bulletins de Paie :
              </span>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400">Jusqu'à 5 / mois</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Package className="w-3.5 h-3.5 text-brand-blue" /> Gestion des Stocks :
              </span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">ILLIMITÉE + Alertes</span>
            </div>
          </div>

          <ul className="space-y-2.5 mb-8 flex-1 text-xs text-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-semibold">Votre propre logo (aucun filigrane iziFlow)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-semibold">Signature numérique &amp; Cachet officiel d'entreprise</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-semibold">Paiements directs Wave &amp; Orange Money sur factures</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-semibold">Relances des factures impayées en 1 clic sur WhatsApp</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Envoi des tickets de caisse par WhatsApp &amp; impression 80mm</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Bulletins de paie conformes IPRES / CSS / Code du Travail</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Journal des ventes &amp; suivi des marges commerciales</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Support WhatsApp prioritaire 7j/7</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-border mt-auto">
            <Button 
              className="w-full bg-brand-blue hover:bg-brand-blueDark text-white h-11 rounded-xl text-xs font-bold shadow-md shadow-brand-blue/20 transition-all active:scale-[0.98]"
              onClick={() => handleSubscribe("pro")}
              disabled={loadingPlan !== null || currentPlan === "pro"}
            >
              {loadingPlan === "pro" ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirection Bictorys...
                </div>
              ) : currentPlan === "pro" ? (
                "Forfait actuel (Pro)"
              ) : (
                "Passer à l'offre Pro (10 000 FCFA)"
              )}
            </Button>
          </div>
        </div>

        {/* 3. PLAN BUSINESS (Pack Complet Entreprise & PME) */}
        <div className={`rounded-3xl p-6 sm:p-7 flex flex-col border transition-all ${
          currentPlan === "business"
            ? "bg-card border-purple-500 ring-2 ring-purple-500/30 shadow-lg"
            : "bg-card border-border hover:border-foreground/30 shadow-sm"
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 inline-block mb-1">
                Pack Complet Entreprise
              </span>
              <h3 className="text-xl font-black text-foreground">Business</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Pour PME structurées, RH complètes &amp; suivi commercial</p>
            </div>
            {currentPlan === "business" && (
              <span className="bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                Actuel
              </span>
            )}
          </div>

          {/* Prix BUSINESS : 25 000 FCFA */}
          <div className="flex items-baseline gap-1 my-4">
            <span className="text-4xl font-black text-foreground">25 000</span>
            <span className="text-xs text-muted-foreground font-semibold">FCFA / mois</span>
          </div>

          {/* Quotas clés chiffrés */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 mb-5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <FileText className="w-3.5 h-3.5 text-purple-600" /> Factures &amp; Devis :
              </span>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400">100% ILLIMITÉS</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Receipt className="w-3.5 h-3.5 text-purple-600" /> Tickets de Caisse :
              </span>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400">100% ILLIMITÉS</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Users className="w-3.5 h-3.5 text-purple-600" /> Bulletins de Paie :
              </span>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400">Jusqu'à 25 / mois</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Package className="w-3.5 h-3.5 text-purple-600" /> Stocks &amp; Valorisation :
              </span>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400">Illimité + Coût d'achat</span>
            </div>
          </div>

          <ul className="space-y-2.5 mb-8 flex-1 text-xs text-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-semibold text-foreground">Tout le forfait Pro inclus sans exception</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-semibold">Pipeline Commercial CRM complet (prospects &amp; devis)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-semibold">Compte de résultat financier automatique (P&amp;L OHADA)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Gestion RH avancée (cotisations salariales &amp; patronales IPRES/CSS)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Relances WhatsApp groupées et campagnes</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Export comptable Excel consolidé pour votre expert-comptable</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Support VIP dédié par téléphone &amp; WhatsApp 7j/7</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-border mt-auto">
            <Button 
              variant={currentPlan === "business" ? "outline" : "default"}
              className={`w-full h-11 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                currentPlan === "business" 
                  ? "" 
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
              }`}
              onClick={() => handleSubscribe("business")}
              disabled={loadingPlan !== null || currentPlan === "business"}
            >
              {loadingPlan === "business" ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirection Bictorys...
                </div>
              ) : currentPlan === "business" ? (
                "Forfait actuel (Business)"
              ) : (
                "Passer à l'offre Business (25 000 FCFA)"
              )}
            </Button>
          </div>
        </div>

      </div>

      {/* Tableau comparatif détaillé des fonctionnalités clés */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Tableau comparatif des fonctionnalités &amp; quotas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Détail complet des fonctionnalités et limites incluses selon chaque forfait.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Fonctionnalité / Module</th>
                <th className="py-3 px-4 text-center">Gratuit (0 F)</th>
                <th className="py-3 px-4 text-center bg-brand-blue/5 text-brand-blue">Pro (10 000 F)</th>
                <th className="py-3 px-4 text-center bg-purple-500/5 text-purple-600 dark:text-purple-400">Business (25 000 F)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* SECTION 1: QUOTAS */}
              <tr className="bg-muted/20 font-bold text-[11px] text-muted-foreground uppercase">
                <td colSpan={4} className="py-2.5 px-4">1. Quotas &amp; Volumes Mensuels</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Nombre de factures &amp; devis</td>
                <td className="py-3 px-4 text-center font-mono text-muted-foreground">5 / mois</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-brand-blue bg-brand-blue/5">150 / mois</td>
                <td className="py-3 px-4 text-center font-mono font-black text-purple-600 bg-purple-500/5">100% ILLIMITÉ</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Tickets de caisse directe (POS)</td>
                <td className="py-3 px-4 text-center font-mono text-muted-foreground">15 / mois</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 bg-brand-blue/5">ILLIMITÉ</td>
                <td className="py-3 px-4 text-center font-mono font-black text-purple-600 bg-purple-500/5">ILLIMITÉ</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Bulletins de paie RH certifiés</td>
                <td className="py-3 px-4 text-center font-mono text-muted-foreground">1 d'essai / mois</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-purple-600 bg-brand-blue/5">Jusqu'à 5 / mois</td>
                <td className="py-3 px-4 text-center font-mono font-black text-purple-600 bg-purple-500/5">Jusqu'à 25 / mois</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Catalogue &amp; Stocks d'articles</td>
                <td className="py-3 px-4 text-center text-muted-foreground">10 articles max</td>
                <td className="py-3 px-4 text-center font-semibold text-foreground bg-brand-blue/5">Illimité + Alertes rupture</td>
                <td className="py-3 px-4 text-center font-semibold text-foreground bg-purple-500/5">Illimité + Valorisation PUMP</td>
              </tr>

              {/* SECTION 2: FONCTIONNALITÉS COMMERCIALES */}
              <tr className="bg-muted/20 font-bold text-[11px] text-muted-foreground uppercase">
                <td colSpan={4} className="py-2.5 px-4">2. Personnalisation &amp; Paiements Mobiles</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Logo d'entreprise sans filigrane</td>
                <td className="py-3 px-4 text-center text-muted-foreground/60">Filigrane iziFlow</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-brand-blue/5">✓ Inclus sans filigrane</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-purple-500/5">✓ Inclus sans filigrane</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Signature numérique &amp; Cachet officiel</td>
                <td className="py-3 px-4 text-center text-muted-foreground/60">—</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-brand-blue/5">✓ Certifié sur factures &amp; paie</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-purple-500/5">✓ Certifié sur factures &amp; paie</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Paiements directs Wave &amp; Orange Money</td>
                <td className="py-3 px-4 text-center text-muted-foreground">Manuel</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-brand-blue/5">✓ Liens instantanés intégrés</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-purple-500/5">✓ Liens instantanés intégrés</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Relances WhatsApp en 1 clic</td>
                <td className="py-3 px-4 text-center text-muted-foreground/60">—</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-brand-blue/5">✓ En 1 clic pré-rempli</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-purple-500/5">✓ En 1 clic &amp; groupées</td>
              </tr>

              {/* SECTION 3: RH, CRM & COMPTABILITÉ */}
              <tr className="bg-muted/20 font-bold text-[11px] text-muted-foreground uppercase">
                <td colSpan={4} className="py-2.5 px-4">3. RH, CRM &amp; Rapports OHADA</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Conformité Paie IPRES &amp; CSS Sénégal</td>
                <td className="py-3 px-4 text-center text-muted-foreground">Modèle basique</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-brand-blue/5">✓ Barème complet OHADA</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-purple-500/5">✓ Part salariale &amp; patronale</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Pipeline Commercial CRM &amp; Prospects</td>
                <td className="py-3 px-4 text-center text-muted-foreground/60">—</td>
                <td className="py-3 px-4 text-center text-muted-foreground/60">—</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-purple-500/5">✓ Inclus complet (5 étapes)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Compte de résultat automatique (P&amp;L)</td>
                <td className="py-3 px-4 text-center text-muted-foreground/60">—</td>
                <td className="py-3 px-4 text-center text-muted-foreground bg-brand-blue/5">Marges de caisse</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-purple-500/5">✓ P&amp;L, Bilan &amp; Export Excel</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Support &amp; Assistance technique</td>
                <td className="py-3 px-4 text-center text-muted-foreground">Email standard</td>
                <td className="py-3 px-4 text-center font-semibold text-foreground bg-brand-blue/5">WhatsApp prioritaire 7j/7</td>
                <td className="py-3 px-4 text-center font-bold text-purple-600 bg-purple-500/5">VIP Téléphone &amp; WhatsApp 7j/7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Informations sur le paiement Bictorys */}
      <div className="bg-card border border-border rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm mb-1">Paiement sécurisé instantané avec Bictorys</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Votre abonnement s'active dès la confirmation du paiement. Bictorys prend en charge <strong>Wave</strong>, <strong>Orange Money</strong>, <strong>Free Money</strong> et les <strong>Cartes Bancaires (Visa / Mastercard)</strong>. Aucun prélèvement automatique forcé : vous renouvelez selon vos besoins.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-muted text-foreground border border-border">
            Wave
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-muted text-foreground border border-border">
            Orange Money
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-muted text-foreground border border-border">
            Cartes CB
          </span>
        </div>
      </div>
    </div>
  );
}
