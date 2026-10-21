"use client";

import { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  Sparkles, 
  Receipt, 
  ShoppingBag, 
  Briefcase,
  Layers, 
  Package,
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCheck,
  ArrowRight
} from "lucide-react";

// Logo Wave SVG
function WaveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <div className={`rounded-full bg-[#1dc3f7] flex items-center justify-center text-white font-black text-[10px] shrink-0 ${className}`}>
      W
    </div>
  );
}

// Logo WhatsApp SVG
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.947 2.801.947h.005c3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.768-5.778-5.768zm7.322 5.767c-.002 3.992-3.25 7.241-7.246 7.241-1.258 0-2.451-.334-3.51-.955l-4.103 1.076 1.096-4c-.694-1.111-1.077-2.399-1.079-3.722.002-3.992 3.25-7.241 7.246-7.241 3.995 0 7.244 3.248 7.246 7.241z"/>
    </svg>
  );
}

interface ScreenItem {
  id: string;
  tabLabel: string;
  shortTag: string;
  title: string;
  subtitle: string;
  image: string;
  icon: any;
  highlightText: string;
  statBadge: {
    label: string;
    value: string;
    color: string;
  };
}

const SCREENS: ScreenItem[] = [
  {
    id: "invoice",
    tabLabel: "Facture & WhatsApp",
    shortTag: "Facture VTE-003",
    title: "Facturation Certifiée & Envoi WhatsApp",
    subtitle: "Modèle conforme OHADA avec cachet d'entreprise, envoyé sur WhatsApp en 1 clic et payable par Wave ou Orange Money.",
    image: "/mockups/invoice_detail.jpg",
    icon: Receipt,
    highlightText: "Bouton WhatsApp officiel • Reçu direct client",
    statBadge: {
      label: "Statut facture",
      value: "Payée (Wave)",
      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    }
  },
  {
    id: "pos",
    tabLabel: "Caisse & Ventes",
    shortTag: "POS 205 320 F",
    title: "Caisse Rapide & Déstockage Comptoir",
    subtitle: "Terminal tactile pour encaisser au comptoir, imprimer les tickets thermiques et suivre la marge brute en temps réel.",
    image: "/mockups/pos_caisse.jpg",
    icon: ShoppingBag,
    highlightText: "+72 000 FCFA de bénéfice commercial net",
    statBadge: {
      label: "Total Encaissé",
      value: "205 320 FCFA",
      color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
    }
  },
  {
    id: "payroll",
    tabLabel: "Paie & RH",
    shortTag: "Social & IPRES",
    title: "Bulletins de Salaires & Cotisations IPRES",
    subtitle: "Édition de fiches de paie conformes OHADA / Code du travail sénégalais avec barème IPRES & CSS automatique.",
    image: "/mockups/payroll_rh.jpg",
    icon: Briefcase,
    highlightText: "Masse salariale : 2 173 548 FCFA",
    statBadge: {
      label: "Cotisations IPRES/CSS",
      value: "348 452 FCFA",
      color: "bg-sky-500/15 text-sky-300 border-sky-500/30"
    }
  },
  {
    id: "modules",
    tabLabel: "Hub Modules",
    shortTag: "CRM & Relances",
    title: "Modules Commerciaux & Pipeline CRM",
    subtitle: "Activez votre pipeline de prospects, planifiez les relances WhatsApp d'impayés et gérez votre catalogue d'articles.",
    image: "/mockups/dashboard_modules.jpg",
    icon: Layers,
    highlightText: "Pipeline CRM • Relances WhatsApp • Stocks",
    statBadge: {
      label: "Suite Complète",
      value: "5 Modules Actifs",
      color: "bg-purple-500/15 text-purple-300 border-purple-500/30"
    }
  },
  {
    id: "stock",
    tabLabel: "Stocks & Articles",
    shortTag: "Catalogue",
    title: "Catalogue Produits & Alertes Rupture",
    subtitle: "Fiche article complète avec code SKU, prix d'achat, prix de vente et décompte automatique lors des encaissements.",
    image: "/mockups/stock_modal.jpg",
    icon: Package,
    highlightText: "Terminal TPE Wave & QR Code en stock",
    statBadge: {
      label: "Déstockage",
      value: "100% Automatique",
      color: "bg-amber-500/15 text-amber-300 border-amber-500/30"
    }
  }
];

export function MobileDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through screens every 4.5 seconds when isPlaying is true
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SCREENS.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const activeScreen = SCREENS[activeIdx];

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      
      {/* ──────────────────────────────────────────────────────────────────
          1. TOP PILL SELECTOR (Switch between real app screens)
      ────────────────────────────────────────────────────────────────── */}
      <div className="w-full flex flex-col items-center gap-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Application Mobile en direct</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Captures réelles sur smartphone</span>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl max-w-full overflow-x-auto scrollbar-none shadow-xl">
          {SCREENS.map((screen, idx) => {
            const Icon = screen.icon;
            const isActive = activeIdx === idx;
            return (
              <button
                key={screen.id}
                onClick={() => {
                  setActiveIdx(idx);
                  setIsPlaying(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 scale-102"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{screen.tabLabel}</span>
              </button>
            );
          })}

          {/* Play / Pause toggle */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            title={isPlaying ? "Mettre en pause l'animation" : "Lancer le défilement automatique"}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ml-1"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />}
          </button>
        </div>

        {/* Story-like progress indicator pills */}
        <div className="flex items-center gap-1.5 w-full max-w-xs px-4">
          {SCREENS.map((_, i) => (
            <div 
              key={i} 
              className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden cursor-pointer"
              onClick={() => { setActiveIdx(i); setIsPlaying(false); }}
            >
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  activeIdx === i 
                    ? "bg-gradient-to-r from-indigo-500 to-violet-400 w-full" 
                    : activeIdx > i 
                    ? "bg-indigo-600/60 w-full" 
                    : "w-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          2. SMARTPHONE DEVICE & SURROUNDING FINTECH BADGES
      ────────────────────────────────────────────────────────────────── */}
      <div className="relative w-full flex items-center justify-center py-4">

        {/* Ambient Radial Glow Behind Device */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[520px] bg-gradient-to-tr from-indigo-600/30 via-violet-600/25 to-sky-500/20 blur-[90px] rounded-full pointer-events-none -z-10" />

        {/* ── FLOATING FINTECH BADGE LEFT (Wave Payment Received) ── */}
        <div className="hidden lg:flex absolute left-4 xl:left-8 top-1/4 -translate-y-1/2 flex-col gap-3 z-20 animate-in fade-in slide-in-from-left-6 duration-700">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl shadow-black/60 max-w-[240px] text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <WaveIcon className="w-5 h-5 shadow-sm" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#1dc3f7]">Encaissement Wave</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium">À l'instant</span>
            </div>
            <p className="text-lg font-black font-mono text-emerald-400 leading-tight">
              +205 320 FCFA
            </p>
            <p className="text-[11px] text-slate-300 mt-1 font-medium">
              Facture <strong>VTE-2026-003</strong> soldée
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Reçu Bictorys
              </span>
              <span>Comptoir POS</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl max-w-[240px] text-left">
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Paie &amp; Cotisations</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Masse salariale : <strong className="text-white font-mono">2 173 548 FCFA</strong>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">IPRES/CSS : 348 452 FCFA</p>
          </div>
        </div>

        {/* ── FLOATING FINTECH BADGE RIGHT (WhatsApp Receipt Sent) ── */}
        <div className="hidden lg:flex absolute right-4 xl:right-8 top-1/3 -translate-y-1/2 flex-col gap-3 z-20 animate-in fade-in slide-in-from-right-6 duration-700">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl shadow-black/60 max-w-[250px] text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#25D366]">
                <WhatsAppIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Relance WhatsApp</span>
              </div>
              <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <p className="text-xs font-bold text-white leading-snug">
              Facture PDF &amp; Reçu transmis au client
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              +221 77 493 73 49
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Ndiaye Agency</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">1-Clic</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl max-w-[250px] text-left">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Conformité Fiscale</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Système Comptable <strong>OHADA &amp; NINEA</strong>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">TVA 18% &amp; QR Code certifié</p>
          </div>
        </div>

        {/* ── THE IPHONE SMARTPHONE FRAME ── */}
        <div className="relative group">
          
          {/* External phone chassis (Titanium dark finish) */}
          <div className="relative w-[285px] sm:w-[325px] md:w-[340px] aspect-[472/1024] bg-[#0b0f17] rounded-[48px] p-2.5 sm:p-3 shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-[6px] sm:border-[8px] border-slate-800/90 ring-1 ring-white/15 select-none transition-transform duration-300 group-hover:scale-[1.01]">
            
            {/* Side volume / power buttons simulation */}
            <div className="absolute -left-[11px] top-24 w-[3px] h-10 bg-slate-700 rounded-l-sm" />
            <div className="absolute -left-[11px] top-38 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
            <div className="absolute -right-[11px] top-32 w-[3px] h-14 bg-slate-700 rounded-r-sm" />

            {/* Inner screen bezel */}
            <div className="relative w-full h-full bg-black rounded-[38px] overflow-hidden border border-slate-900 flex flex-col">
              
              {/* Dynamic Island Pill */}
              <div className="absolute top-2 inset-x-0 z-40 flex justify-center pointer-events-none">
                <div className="h-5 sm:h-6 w-24 sm:w-28 bg-black rounded-full flex items-center justify-between px-2.5 sm:px-3 border border-slate-900 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-indigo-950" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* Real App Screenshot Image */}
              <div className="relative w-full h-full overflow-hidden bg-slate-950">
                {SCREENS.map((screen, idx) => (
                  <div
                    key={screen.id}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      activeIdx === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={screen.image}
                      alt={screen.title}
                      className="w-full h-full object-cover object-top select-none"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}

                {/* Subtle Glass Specular Glare Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none z-20" />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-40 pointer-events-none backdrop-blur-sm" />
            </div>
          </div>
        </div>

      </div>

      {/* ──────────────────────────────────────────────────────────────────
          3. ACTIVE SCREEN DETAILS & CAPTION CARD
      ────────────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-xl mx-auto mt-6 text-center">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${activeScreen.statBadge.color}`}>
              {activeScreen.statBadge.label} : {activeScreen.statBadge.value}
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded-full font-medium">
              {activeScreen.shortTag}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white">
            {activeScreen.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
            {activeScreen.subtitle}
          </p>

          {/* Quick interactive navigation links */}
          <div className="pt-2 flex items-center gap-3 text-xs text-indigo-400 font-semibold">
            <button 
              onClick={() => {
                setActiveIdx((prev) => (prev + 1) % SCREENS.length);
                setIsPlaying(false);
              }}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span>Écran suivant ({SCREENS[(activeIdx + 1) % SCREENS.length].tabLabel})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
