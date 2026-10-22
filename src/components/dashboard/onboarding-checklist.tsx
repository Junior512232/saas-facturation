"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  FileSignature, 
  FileText, 
  Users, 
  X, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompanySettings, Invoice, Client, Product } from "@/lib/data";

interface OnboardingChecklistProps {
  companySettings: CompanySettings | null;
  invoicesCount: number;
  clientsCount: number;
  productsCount: number;
  userName?: string;
  userNinea?: string;
}

export function OnboardingChecklist({
  companySettings,
  invoicesCount,
  clientsCount,
  productsCount,
  userName,
  userNinea,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDismissed = localStorage.getItem("iziflow_onboarding_dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  // Evaluation of completion
  const step1Done = Boolean(companySettings?.ninea || userNinea || companySettings?.address);
  const step2Done = Boolean(companySettings?.companyStampUrl || companySettings?.companySignatureUrl);
  const step3Done = Boolean(clientsCount > 0 || productsCount > 0);
  const step4Done = Boolean(invoicesCount > 0);

  const steps = [
    {
      id: "company",
      title: "1. Profil de l'entreprise & NINEA",
      description: "Renseignez vos mentions légales (NINEA, RCCM, adresse) pour vos en-têtes officiels.",
      done: step1Done,
      href: "/settings",
      actionText: "Configurer mon profil",
      icon: Building2,
    },
    {
      id: "stamp",
      title: "2. Cachet d'entreprise & Signature",
      description: "Importez votre cachet commercial et signature numérique certifiée.",
      done: step2Done,
      href: "/settings/signature",
      actionText: "Ajouter cachet & signature",
      icon: FileSignature,
    },
    {
      id: "client",
      title: "3. Premier client ou article en stock",
      description: "Enregistrez les coordonnées d'un client ou référencez vos produits/services.",
      done: step3Done,
      href: "/clients",
      actionText: "Ajouter un client",
      icon: Users,
    },
    {
      id: "invoice",
      title: "4. Émettre votre première facture",
      description: "Créez votre 1ère facture certifiée avec lien de paiement Wave et QR Code.",
      done: step4Done,
      href: "/invoices/new",
      actionText: "Créer ma 1ère facture",
      icon: FileText,
      highlight: true,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // If dismissed or all 4 steps are finished, don't show unless user has 0 invoices
  if (!mounted || dismissed) return null;
  if (completedCount === steps.length && invoicesCount > 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("iziflow_onboarding_dismissed", "true");
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 md:p-6 shadow-xl overflow-hidden transition-all">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Guide de démarrage rapide</span>
            </span>
            <span className="text-xs text-slate-400">
              {completedCount} sur {steps.length} étapes terminées ({progressPercent}%)
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Bienvenue {userName ? userName.split(" ")[0] : ""} ! Préparez votre entreprise en 3 minutes 🚀
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Suivez ces étapes pour commencer à émettre des factures officielles conformes OHADA et recevoir des paiements par Wave & Orange Money.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={collapsed ? "Déplier" : "Replier"}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Masquer le guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mt-4">
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      {!collapsed && (
        <div className="relative z-10 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  step.done
                    ? "bg-slate-900/60 border-emerald-500/30 text-slate-300"
                    : step.highlight
                    ? "bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/50 shadow-md shadow-indigo-600/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        step.done
                          ? "bg-emerald-500/20 text-emerald-400"
                          : step.highlight
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {step.done ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terminé
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Circle className="w-3.5 h-3.5" />
                        À faire
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href={step.href}
                    className={`inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                      step.done
                        ? "bg-slate-800/80 hover:bg-slate-800 text-slate-300"
                        : step.highlight
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                        : "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    <span>{step.done ? "Modifier" : step.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Human Support Callout */}
      {!collapsed && (
        <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Besoin d'un accompagnement personnalisé pour configurer votre compte ?</span>
          </p>
          <a
            href="https://wa.me/221774937349?text=Bonjour%20iziFlow,%20je%20souhaite%20une%20assistance%20pour%20configurer%20mon%20compte."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Assistance WhatsApp directe (+221 77 493 73 49)</span>
          </a>
        </div>
      )}
    </div>
  );
}
