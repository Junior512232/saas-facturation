"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, Wallet, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const handleSubscribe = async (planName: string, amount: number) => {
    setLoadingPlan(planName);
    // Simulate payment process (e.g. Wave / OM API Call)
    setTimeout(() => {
      setSuccess(`Félicitations ! Votre abonnement ${planName} a été activé avec succès.`);
      setLoadingPlan(null);
    }, 2000);
  };

  const currentPlan = user?.plan || "gratuit";
  const planExpiresAt = user?.plan_expires_at 
    ? new Date(user.plan_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
      {success && (
        <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Abonnement & Facturation</h2>
        <p className="text-muted-foreground">Gérez votre forfait SaaS et vos paiements.</p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Votre forfait actuel</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-cream flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-brand-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-2xl font-black capitalize">{currentPlan}</h4>
              {currentPlan !== "gratuit" && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold">Actif</span>}
            </div>
            {planExpiresAt ? (
              <p className="text-sm text-muted-foreground mt-1">Expire le {planExpiresAt}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Abonnement gratuit, fonctionnalités limitées.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Pro Plan */}
        <div className={`bg-card border rounded-3xl p-8 flex flex-col ${currentPlan === "pro" ? "border-brand-blue ring-2 ring-brand-blue/20 relative" : "border-border"}`}>
          {currentPlan === "pro" && (
            <div className="absolute -top-3 right-6 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Actuel
            </div>
          )}
          <h3 className="text-xl font-bold text-foreground mb-2">Pro</h3>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl font-black text-brand-dark">5 000</span>
            <span className="text-sm text-muted-foreground font-medium mb-1">FCFA / mois</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Factures & Devis illimités</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Personnalisation de logo</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Relances automatiques</li>
          </ul>
          <Button 
            className="w-full bg-brand-blue hover:bg-brand-blueDark text-white h-12 rounded-xl font-bold shadow-blue-glow transition-all"
            onClick={() => handleSubscribe("pro", 5000)}
            disabled={loadingPlan !== null || currentPlan === "pro"}
          >
            {loadingPlan === "pro" ? "Traitement..." : currentPlan === "pro" ? "Forfait actuel" : "Passer à l'offre Pro"}
          </Button>
        </div>

        {/* Business Plan */}
        <div className={`bg-brand-dark text-white border rounded-3xl p-8 flex flex-col relative overflow-hidden ${currentPlan === "business" ? "border-brand-blue ring-2 ring-brand-blue/20" : "border-brand-dark"}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          {currentPlan === "business" && (
            <div className="absolute -top-3 right-6 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full z-10">
              Actuel
            </div>
          )}
          <h3 className="text-xl font-bold mb-2 relative z-10">Business</h3>
          <div className="flex items-end gap-1 mb-6 relative z-10">
            <span className="text-4xl font-black">15 000</span>
            <span className="text-sm text-gray-400 font-medium mb-1">FCFA / mois</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-300 relative z-10">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Tout le forfait Pro inclus</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Multi-utilisateurs (jusqu'à 5)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Multi-entreprises (jusqu'à 3)</li>
          </ul>
          <Button 
            variant="outline"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-none h-12 rounded-xl font-bold transition-all relative z-10"
            onClick={() => handleSubscribe("business", 15000)}
            disabled={loadingPlan !== null || currentPlan === "business"}
          >
            {loadingPlan === "business" ? "Traitement..." : currentPlan === "business" ? "Forfait actuel" : "Passer à l'offre Business"}
          </Button>
        </div>
      </div>
      
      {/* Payment Information */}
      <div className="bg-muted/30 rounded-3xl p-6 mt-4 flex items-start gap-4">
        <div className="p-3 bg-brand-cream rounded-xl">
          <AlertCircle className="w-6 h-6 text-brand-blue" />
        </div>
        <div>
          <h4 className="font-semibold mb-1">Comment payer mon abonnement ?</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Lorsque vous cliquez pour passer à une offre supérieure, vous serez redirigé vers notre passerelle de paiement sécurisée. Le paiement de l'abonnement s'effectue via <strong>Wave</strong> ou <strong>Orange Money</strong>. L'activation est instantanée.
          </p>
        </div>
      </div>
    </div>
  );
}
