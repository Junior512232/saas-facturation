"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Puzzle, 
  Package, 
  ShoppingBag, 
  FileCheck2, 
  Briefcase, 
  UserCheck, 
  MessageCircle, 
  TrendingUp, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck
} from "lucide-react";
import { useExtensions, ExtensionItem } from "@/context/ExtensionsContext";

const ICON_MAP: Record<string, any> = {
  Package,
  ShoppingBag,
  FileCheck2,
  Briefcase,
  UserCheck,
  MessageCircle,
  TrendingUp,
};

const CATEGORIES = [
  { id: "all", label: "Toutes les extensions" },
  { id: "commerce", label: "Commerce & Stocks" },
  { id: "finance", label: "Finance & Pilotage" },
  { id: "hr", label: "RH & Paie" },
  { id: "legal", label: "Juridique & Signature" },
  { id: "communication", label: "Communication" },
];

export default function ExtensionsHubPage() {
  const { extensions, toggleExtension, activeCount, resetExtensions } = useExtensions();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastToggled, setLastToggled] = useState<{ name: string; enabled: boolean } | null>(null);

  const filteredExtensions = extensions.filter((ext) => {
    const matchesCategory = selectedCategory === "all" || ext.category === selectedCategory;
    const matchesSearch = 
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (ext: ExtensionItem) => {
    toggleExtension(ext.id);
    setLastToggled({ name: ext.name, enabled: !ext.enabled });
    setTimeout(() => {
      setLastToggled(null);
    }, 3000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {lastToggled && (
        <div className="fixed top-6 right-6 z-50 bg-foreground text-background px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 border border-border">
          <div className={`w-2.5 h-2.5 rounded-full ${lastToggled.enabled ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span className="text-sm font-medium">
            Extension <strong>{lastToggled.name}</strong> {lastToggled.enabled ? "activée dans la barre latérale !" : "désactivée."}
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue/15 via-background to-card border border-border p-8 md:p-10 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>iziFlow App Store & Architecture Modulaire</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Hub d'Extensions & Modules
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Personnalisez votre expérience iziFlow à la carte. Activez uniquement les briques dont votre entreprise a besoin pour garder une interface claire, fluide et adaptée à votre métier.
            </p>
          </div>

          {/* Quick Counter Card */}
          <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-5 flex items-center gap-5 shadow-lg shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <Puzzle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-foreground">{activeCount}</span>
                <span className="text-sm text-muted-foreground font-semibold">/ {extensions.length}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Extensions activées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search, Categories & Reset */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une extension..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
          </div>

          <button
            onClick={resetExtensions}
            title="Réinitialiser les modules"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-all shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Par défaut</span>
          </button>
        </div>
      </div>

      {/* Grid of Extensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExtensions.map((ext) => {
          const IconComponent = ICON_MAP[ext.iconName] || Puzzle;
          const isEnabled = ext.enabled;

          return (
            <div
              key={ext.id}
              className={`group rounded-3xl border transition-all duration-200 flex flex-col justify-between p-6 bg-card relative ${
                isEnabled 
                  ? "border-primary/30 shadow-md ring-1 ring-primary/10" 
                  : "border-border/70 hover:border-border hover:shadow-sm opacity-85"
              }`}
            >
              <div>
                {/* Card Top: Icon, Badge, Toggle */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
                    isEnabled 
                      ? "bg-brand-blue text-white shadow-blue-glow/40" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-2">
                    {ext.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                        {ext.badge}
                      </span>
                    )}

                    {/* Interactive Toggle Switch */}
                    <button
                      onClick={() => handleToggle(ext)}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        isEnabled ? "bg-emerald-600" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 shadow-sm ${
                          isEnabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Title & Category */}
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{ext.name}</h3>
                    {isEnabled && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{ext.categoryLabel}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                  {ext.description}
                </p>
              </div>

              {/* Card Footer: Status & Direct Action */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {ext.stats || (isEnabled ? "Module actif" : "Désactivé")}
                </span>

                {isEnabled ? (
                  <Link
                    href={ext.route}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors group/link"
                  >
                    <span>Ouvrir</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleToggle(ext)}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Activer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredExtensions.length === 0 && (
        <div className="text-center py-16 bg-card rounded-3xl border border-dashed border-border p-8">
          <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Aucune extension trouvée</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Essayez de modifier vos critères de recherche ou réinitialisez les filtres.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Pro Tip Box */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Besoin d'une extension sur-mesure ?</h4>
            <p className="text-xs text-muted-foreground">iziFlow est conçu pour s'adapter aux spécificités de votre activité (connexions API, terminaux de paiement, balance connectée).</p>
          </div>
        </div>
        <Link
          href="/support"
          className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl transition-all text-center shrink-0"
        >
          Contacter le support
        </Link>
      </div>
    </div>
  );
}
