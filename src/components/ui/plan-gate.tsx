"use client";

import Link from "next/link";
import { Lock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanType } from "@/lib/plans";

interface PlanGateProps {
  requiredPlan: "pro" | "business";
  currentPlan?: string | null;
  title?: string;
  description?: string;
  features?: string[];
}

export function PlanGate({
  requiredPlan,
  currentPlan = "gratuit",
  title,
  description,
  features,
}: PlanGateProps) {
  const isBusiness = requiredPlan === "business";
  const planColor = isBusiness ? "text-purple-600 dark:text-purple-400" : "text-brand-blue";
  const planBg = isBusiness ? "bg-purple-500/10 border-purple-500/20" : "bg-brand-blue/10 border-brand-blue/20";
  const btnBg = isBusiness ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-brand-blue hover:bg-brand-blueDark text-white";

  const defaultTitle = isBusiness 
    ? "Fonctionnalité exclusive au Forfait Business" 
    : "Fonctionnalité réservée au Forfait Pro";

  const defaultDescription = isBusiness
    ? "Le module CRM, le pipeline d'opportunités commerciales et les rapports financiers avancés (P&L OHADA) sont disponibles dès le forfait Business."
    : "Passez au forfait Pro pour débloquer les factures étendues, la gestion complète des stocks et les tickets de caisse illimités.";

  const defaultFeatures = isBusiness
    ? [
        "Pipeline commercial CRM (gestion des prospects et closing)",
        "Compte de résultat financier automatique (P&L OHADA)",
        "Gestion RH complète et jusqu'à 25 bulletins de paie / mois",
        "Export comptable Excel consolidé pour votre expert-comptable",
      ]
    : [
        "Jusqu'à 150 factures et devis par mois",
        "Tickets de caisse POS illimités",
        "Gestion des stocks illimitée avec alertes de réapprovisionnement",
        "Votre propre logo sans aucun filigrane",
      ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-8 md:p-12 rounded-3xl bg-card border border-border shadow-xl flex flex-col items-center text-center relative overflow-hidden">
      {/* Background glow decoration */}
      <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${isBusiness ? "bg-purple-600" : "bg-brand-blue"}`} />

      {/* Lock Badge */}
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-md border ${planBg} ${planColor}`}>
        <Lock className="w-9 h-9" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-muted border border-border">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Forfait {requiredPlan.toUpperCase()} requis</span>
      </div>

      <h2 className="text-2xl md:text-3xl font-black text-foreground max-w-xl leading-tight mb-3">
        {title || defaultTitle}
      </h2>

      <p className="text-sm text-muted-foreground max-w-lg mb-8 leading-relaxed">
        {description || defaultDescription}
      </p>

      {/* Feature List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full text-left mb-8">
        {(features || defaultFeatures).map((feat, idx) => (
          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-medium text-foreground">
            <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${planColor}`} />
            <span>{feat}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Link href="/settings/billing">
          <Button size="lg" className={`h-12 px-8 font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${btnBg}`}>
            <span className="flex items-center gap-2">
              <span>Débloquer le forfait {requiredPlan.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="lg" className="h-12 px-6 rounded-xl font-semibold">
            Retour au tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  );
}
