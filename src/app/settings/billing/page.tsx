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
  Check
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
        const plan = urlParams.get("plan") || "pro";
        setSuccess(`Félicitations ! Votre forfait ${plan.toUpperCase()} a été activé avec succès via Bictorys.`);
        
        // Mettre à jour le profil local
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        updateProfile({
          plan: plan,
          plan_expires_at: nextMonth.toISOString(),
        }).catch(console.error);

        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get("error") === "true") {
        setError("Le paiement de l'abonnement n'a pas pu aboutir ou a été interrompu.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [updateProfile]);

  const handleSubscribe = async (planName: "pro" | "business") => {
    setLoadingPlan(planName);
    setError("");
    
    try {
      const res = await initiateSubscriptionPayment({ plan: planName });
      
      if (res.success) {
        if (res.paymentUrl) {
          // Redirection vers le checkout Bictorys
          window.location.href = res.paymentUrl;
        } else if (res.simulated) {
          // Mode simulation (ex: dev local sans clé Bictorys configurée)
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          await updateProfile({
            plan: planName,
            plan_expires_at: nextMonth.toISOString(),
          });
          setSuccess(res.message || `Félicitations ! Votre forfait ${planName.toUpperCase()} est actif.`);
          setLoadingPlan(null);
        }
      } else {
        setError(res.error || "Impossible d'initialiser le paiement Bictorys.");
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

      {/* Grille des offres : 3 colonnes cohérentes (Gratuit / Pro / Business) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* 1. PLAN GRATUIT */}
        <div className={`rounded-3xl p-6 sm:p-7 flex flex-col border transition-all ${
          currentPlan === "gratuit" 
            ? "bg-card border-border shadow-sm ring-1 ring-border" 
            : "bg-card/60 border-border/60"
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-foreground">Gratuit</h3>
              <p className="text-xs text-muted-foreground">Pour démarrer sereinement</p>
            </div>
            {currentPlan === "gratuit" && (
              <span className="bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                Forfait Actuel
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-5">
            <span className="text-3xl font-black text-foreground">0</span>
            <span className="text-xs text-muted-foreground font-semibold">FCFA / mois</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Jusqu'à 5 factures / mois</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Calcul automatique TVA 18%</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Exportation PDF avec filigrane iziFacture</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Gestion des clients & historique</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-border mt-auto">
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl text-xs font-bold"
              disabled={true}
            >
              {currentPlan === "gratuit" ? "Inclus par défaut" : "Forfait de base"}
            </Button>
          </div>
        </div>

        {/* 2. PLAN PRO (Mis en valeur - Recommandé) */}
        <div className={`rounded-3xl p-6 sm:p-7 flex flex-col relative transition-all border-2 ${
          currentPlan === "pro"
            ? "bg-card border-brand-blue ring-2 ring-brand-blue/30 shadow-lg"
            : "bg-card border-brand-blue shadow-md hover:shadow-xl hover:border-brand-blue"
        }`}>
          {/* Badge Recommandé */}
          <div className="absolute -top-3.5 right-6 bg-brand-blue text-white text-[10px] font-black tracking-wider uppercase px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Recommandé
          </div>

          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Pro
              </h3>
              <p className="text-xs text-muted-foreground">Pour indépendants et PME actives</p>
            </div>
            {currentPlan === "pro" && (
              <span className="bg-brand-blue text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                Forfait Actuel
              </span>
            )}
          </div>

          {/* Prix PRO : 5 000 FCFA avec haute lisibilité en mode sombre & clair */}
          <div className="flex items-baseline gap-1 my-5">
            <span className="text-4xl font-black text-foreground">5 000</span>
            <span className="text-xs text-muted-foreground font-semibold">FCFA / mois</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1 text-xs text-foreground">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-medium">Factures & devis illimités</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-medium">Votre propre logo (sans mention ni filigrane)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-medium">Paiements en ligne Bictorys (Wave, OM, CB)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-medium">Relances WhatsApp & Email en 1 clic</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-medium">Export comptable Excel pour déclaration</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-medium">Support WhatsApp & Email prioritaire 7j/7</span>
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
                "Forfait actuel"
              ) : (
                "Passer à l'offre Pro (5 000 FCFA)"
              )}
            </Button>
          </div>
        </div>

        {/* 3. PLAN BUSINESS */}
        <div className={`rounded-3xl p-6 sm:p-7 flex flex-col border transition-all ${
          currentPlan === "business"
            ? "bg-card border-brand-blue ring-2 ring-brand-blue/30 shadow-lg"
            : "bg-card border-border hover:border-foreground/30 shadow-sm"
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-foreground">Business</h3>
              <p className="text-xs text-muted-foreground">Multi-sociétés et équipes</p>
            </div>
            {currentPlan === "business" && (
              <span className="bg-brand-blue text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                Forfait Actuel
              </span>
            )}
          </div>

          {/* Prix BUSINESS : 15 000 FCFA avec haute lisibilité */}
          <div className="flex items-baseline gap-1 my-5">
            <span className="text-4xl font-black text-foreground">15 000</span>
            <span className="text-xs text-muted-foreground font-semibold">FCFA / mois</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1 text-xs text-foreground">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-foreground">Tout le forfait Pro inclus</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Jusqu'à 5 utilisateurs collaborateurs</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Gestion multi-entreprises (jusqu'à 3 entités)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Accès direct pour votre expert-comptable</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Statistiques financières & audit approfondi</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Support dédié VIP par téléphone & WhatsApp</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-border mt-auto">
            <Button 
              variant={currentPlan === "business" ? "outline" : "default"}
              className={`w-full h-11 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                currentPlan === "business" 
                  ? "" 
                  : "bg-foreground text-background hover:bg-foreground/90 shadow-sm"
              }`}
              onClick={() => handleSubscribe("business")}
              disabled={loadingPlan !== null || currentPlan === "business"}
            >
              {loadingPlan === "business" ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Redirection Bictorys...
                </div>
              ) : currentPlan === "business" ? (
                "Forfait actuel"
              ) : (
                "Passer à l'offre Business (15 000 FCFA)"
              )}
            </Button>
          </div>
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
