"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag, 
  Package, 
  FileCheck2, 
  BarChart3, 
  Smartphone, 
  ShieldCheck, 
  ChevronRight, 
  Star, 
  Play, 
  Receipt, 
  Layers, 
  TrendingUp, 
  Check, 
  HelpCircle,
  ChevronDown,
  Building,
  Lock,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFCFA } from "@/lib/utils";

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"pos" | "invoices" | "stock" | "signature" | "reports">("pos");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const faqs = [
    {
      q: "iziFlow est-il conforme aux normes fiscales OHADA et au Sénégal ?",
      a: "Oui, parfaitement ! iziFlow intègre les mentions légales obligatoires OHADA (NINEA, RCCM), le calcul automatique de la TVA à 18% (ou exonération), et génère un QR code d'authentification certifié sur chaque document."
    },
    {
      q: "Comment fonctionne l'encaissement direct par Wave et Orange Money ?",
      a: "Sur le terminal de caisse comme sur les factures numériques, vos clients peuvent payer directement via leur compte Wave ou Orange Money. Vous pouvez également intégrer vos propres passerelles (Bictorys, Wave Merchant) pour recevoir l'argent instantanément sur votre compte professionnel."
    },
    {
      q: "Mes stocks sont-ils automatiquement mis à jour lors d'une vente ?",
      a: "Absolument. Dès qu'une vente est validée en caisse ou qu'une facture de marchandises est émise, les quantités sont décomptées en temps réel. Dès qu'un article passe sous le seuil d'alerte, une notification visuelle vous prévient pour éviter toute rupture."
    },
    {
      q: "Comment fonctionne le cachet d'entreprise et la signature électronique ?",
      a: "Vous pouvez soit uploader l'image de votre tampon physique scanné, soit utiliser notre générateur magique de tampon officiel vectoriel. Vous tracez ensuite votre signature numérique au doigt ou à la souris : ils sont alors automatiquement apposés en bas de vos factures et devis PDF."
    },
    {
      q: "Puis-je utiliser iziFlow sur mon smartphone ou tablette ?",
      a: "Oui, iziFlow est entièrement 'Mobile-First' et 'Tablet-Ready'. Vous pouvez l'utiliser comme terminal de caisse tactile au comptoir ou créer une facture sur votre téléphone pendant vos déplacements."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. NAVIGATION BAR (Glassmorphism inspired by Izimelo)
      ────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-95 duration-200">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                izi<span className="text-indigo-400">Flow</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-1">Suite Commerciale • OHADA</span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#showcase" className="hover:text-white transition-colors">Démonstration</a>
            <a href="#features" className="hover:text-white transition-colors">Modules & Caisse</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Témoignages</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {mounted && !loading && isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                Mon Espace Entreprise
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>Commencer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. HERO SECTION (Punchy, Direct, Modern, Izimelo Aesthetic)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/25 via-violet-600/20 to-sky-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-5 text-center relative z-10 flex flex-col items-center gap-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Le n°1 de la gestion commerciale & facturation en Afrique</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-white max-w-4xl">
            Pilotez votre entreprise en <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">3 minutes chrono</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
            Ventes au comptoir, déstockage automatique, facturation certifiée avec cachet d'entreprise et encaissement Wave & Orange Money. La suite tout-en-un conforme OHADA.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-2 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Créer mon compte gratuit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm px-6 py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-current" />
              <span>Tester la démo en 1 clic</span>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 text-xs text-slate-400">
            <div className="flex -space-x-2">
              <img className="w-8 h-8 rounded-full border-2 border-slate-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" alt="User 1" />
              <img className="w-8 h-8 rounded-full border-2 border-slate-950 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" alt="User 2" />
              <img className="w-8 h-8 rounded-full border-2 border-slate-950 object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop" alt="User 3" />
              <img className="w-8 h-8 rounded-full border-2 border-slate-950 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop" alt="User 4" />
            </div>

            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>

            <span>
              Rejoint par plus de <strong>7 000 commerçants et PME</strong> au Sénégal, Côte d'Ivoire & Cameroun
            </span>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. INTERACTIVE PRODUCT SHOWCASE (Like Izimelo Audio/Video Selector)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="showcase" className="max-w-6xl mx-auto px-5 pb-24">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Showcase Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-slate-800/80 mb-8">
            {[
              { id: "pos", label: "Caisse Rapide (POS)", icon: ShoppingBag },
              { id: "invoices", label: "Factures & Devis", icon: Receipt },
              { id: "stock", label: "Gestion de Stocks", icon: Package },
              { id: "signature", label: "Cachet & Signature", icon: FileCheck2 },
              { id: "reports", label: "Rapport P&L", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeShowcaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveShowcaseTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105" 
                      : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Live Content */}
          <div className="min-h-[380px] flex flex-col justify-center">
            {activeShowcaseTab === "pos" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="md:col-span-6 space-y-4 text-left">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    Encaissement 1-Clic
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                    Une caisse tactile ultra-rapide connectée à votre stock
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Prenez les commandes au comptoir, choisissez le mode de règlement (Wave, OM, Cash) et imprimez le ticket de caisse thermique en un instant. Le stock se décrémente automatiquement.
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-slate-300 pt-2 font-medium">
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Calculateur automatique de monnaie à rendre</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> QR code de paiement Wave & Orange Money instantané</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Décompte automatique des quantités physiques</div>
                  </div>
                </div>

                {/* Mock Card Preview */}
                <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl text-left font-mono">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="font-bold text-white">COMMANDE #VTE-2026-089</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-sans text-[10px] font-bold">Payé • Wave</span>
                  </div>
                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>2x Terminal TPE Wave</span>
                      <span className="font-bold text-white">150 000 FCFA</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>1x Rouleaux Papier 80mm</span>
                      <span className="font-bold text-white">12 000 FCFA</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                    <span>TOTAL TTC</span>
                    <span className="text-xl text-indigo-400">162 000 FCFA</span>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "invoices" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="md:col-span-6 space-y-4 text-left">
                  <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                    Norme OHADA & UEMOA
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                    Factures & Devis professionnels et certifiés
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Éditez des factures impeccables avec votre logo, NINEA, RCCM et TVA 18%. Vos clients règlent en ligne via le lien de paiement inclus sur le document.
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-slate-300 pt-2 font-medium">
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Export PDF haute définition sans filigrane</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Partage direct sur WhatsApp en 1 clic</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Relances automatiques d'échéances impayées</div>
                  </div>
                </div>

                <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <p className="font-black text-sm text-white">iziFlow Entreprise</p>
                      <p className="text-[10px] text-slate-400">NINEA : 001234567 2V3</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">FAC-2026-0042</Badge>
                  </div>
                  <div className="py-4 text-xs space-y-1 text-slate-300">
                    <p>Client : <strong className="text-white">CANSAAS AGENCY</strong></p>
                    <p>Échéance : 15 Novembre 2026</p>
                    <p className="text-xl font-bold font-mono text-emerald-400 pt-2">1 450 000 FCFA</p>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "stock" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="md:col-span-6 space-y-4 text-left">
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                    Anti-Rupture
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                    Maîtrisez votre stock et valorisez votre marchandise
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Visualisez le capital immobilisé en entrepôt, réapprovisionnez en un clic et soyez alerté avant qu'un produit ne tombe en rupture.
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-slate-300 pt-2 font-medium">
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Jauges visuelles colorées par niveau de stock</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Calcul automatique de la marge commerciale brute</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Journal complet de traçabilité des entrées/sorties</div>
                  </div>
                </div>

                <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl text-left space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Terminal TPE Wave</p>
                      <span className="text-[10px] text-slate-400">18 unités en stock</span>
                    </div>
                    <span className="text-emerald-400 font-bold">En stock</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Papier Thermique 80mm</p>
                      <span className="text-[10px] text-amber-400 font-bold">Reste 4 packs (Seuil: 8)</span>
                    </div>
                    <span className="text-amber-400 font-bold">Alerte</span>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "signature" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="md:col-span-6 space-y-4 text-left">
                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                    Juridique & Conformité
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                    Cachet officiel & Signature électronique intégrés
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Scellez vos documents d'entreprise avec votre tampon officiel (ou notre générateur magique vectoriel) et votre signature manuscrite autorisée.
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-slate-300 pt-2 font-medium">
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> Générateur automatique de cachet rond ou rectangulaire</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> Pad de signature tactile au doigt ou stylet</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> Mention légale de certification OHADA</div>
                  </div>
                </div>

                <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl text-left relative overflow-hidden flex flex-col justify-between h-56">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pour l'entreprise :</p>
                    <p className="text-sm font-bold text-white">La Direction Générale</p>
                    <p className="text-[10px] text-slate-400">Bon pour accord et certification de service fait</p>
                  </div>
                  <div className="flex items-center justify-between z-10">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-400/60 flex items-center justify-center text-[9px] font-black text-indigo-400 rotate-[-12deg]">
                      CACHET OFFICIEL
                    </div>
                    <span className="font-serif italic text-2xl text-slate-200">Moustapha F.</span>
                  </div>
                  <p className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> Document certifié conforme par iziFlow
                  </p>
                </div>
              </div>
            )}

            {activeShowcaseTab === "reports" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="md:col-span-6 space-y-4 text-left">
                  <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-xs">
                    Finance & Expert-Comptable
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                    Compte de résultat (P&L) & Marges consolidées
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Découvrez en temps réel vos revenus réels encaissés, le coût des marchandises vendues et la marge nette sans attendre la fin du mois.
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-slate-300 pt-2 font-medium">
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-400" /> Calcul automatique de la TVA collectée (18%)</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-400" /> Marge brute commerciale en temps réel</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-400" /> Export PDF prêt pour l'expert-comptable</div>
                  </div>
                </div>

                <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl text-left font-mono space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Produits d'Exploitation</span>
                    <span className="font-bold text-white">35 450 000 FCFA</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Coût des Ventes (Achats)</span>
                    <span>-14 200 000 FCFA</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-emerald-400">
                    <span>MARGE COMMERCIALE BRUTE</span>
                    <span className="text-lg">+21 250 000 FCFA</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. FEATURES GRID ("Pourquoi les entrepreneurs adorent iziFlow")
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-5 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            Une suite complète
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Tout ce dont votre entreprise a besoin au même endroit
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Fini les calculs manuels sur Excel et les factures Word sans cachet. iziFlow automatise tout votre cycle commercial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Factures & Devis Certifiés</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modèles conformes NINEA, RCCM et TVA 18%. Envoi automatique par email ou WhatsApp avec lien de paiement instantané.
              </p>
            </div>
            <div className="pt-6 text-xs text-indigo-400 font-semibold flex items-center gap-1 mt-4">
              <span>Découvrir la facturation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Caisse Rapide & Déstockage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Encaissez au comptoir en quelques clics. Prise en charge Wave, Orange Money et espèces avec calcul de monnaie.
              </p>
            </div>
            <div className="pt-6 text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-4">
              <span>Découvrir la caisse POS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gestion des Stocks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suivi des entrées/sorties en temps réel, valorisation du capital immobilisé et alertes de rupture personnalisables.
              </p>
            </div>
            <div className="pt-6 text-xs text-amber-400 font-semibold flex items-center gap-1 mt-4">
              <span>Découvrir l'inventaire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Signature & Cachet Officiel</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Générez votre tampon d'entreprise vectoriel en 1 clic et signez à l'écran pour authentifier vos documents légaux.
              </p>
            </div>
            <div className="pt-6 text-xs text-violet-400 font-semibold flex items-center gap-1 mt-4">
              <span>En savoir plus sur le cachet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rapport Financier & P&L</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compte de résultat synthétique OHADA, suivi des marges brutes et export certifié pour votre expert-comptable.
              </p>
            </div>
            <div className="pt-6 text-xs text-sky-400 font-semibold flex items-center gap-1 mt-4">
              <span>Voir les analyses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hub Extensions Modulaire</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Activez uniquement ce dont vous avez besoin : Paie & Salaires RH, CRM prospects, relances WhatsApp et connecteurs.
              </p>
            </div>
            <div className="pt-6 text-xs text-purple-400 font-semibold flex items-center gap-1 mt-4">
              <span>Explorer le Hub d'Extensions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. TESTIMONIALS / AVIS CLIENTS (Like Izimelo "Ils ont marqué le coup")
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="testimonials" className="max-w-6xl mx-auto px-5 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            Témoignages Réels
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Ils ont transformé leur gestion avec iziFlow
          </h2>
          <p className="text-sm text-slate-400">
            Découvrez comment entrepreneurs et commerçants gagnent des heures chaque semaine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-6">
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "Avant iziFlow, je passais mes dimanches soirs à recalculer la TVA sur Excel pour mes clients B2B à Dakar. Maintenant, en 3 clics sur mon téléphone, c'est envoyé avec le cachet officiel sur WhatsApp."
            </p>
            <div className="flex items-center gap-3">
              <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" alt="Sarah K." />
              <div>
                <p className="text-sm font-bold text-white">Sarah K.</p>
                <p className="text-xs text-slate-400">Fondatrice, Agency Cansaas (Dakar)</p>
              </div>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-6">
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "Le module de caisse rapide au comptoir a changé notre vie en boutique. On encaisse par Wave en 5 secondes, le stock est déduit et on sait exactement combien de marge on a fait dans la journée."
            </p>
            <div className="flex items-center gap-3">
              <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" alt="Moussa D." />
              <div>
                <p className="text-sm font-bold text-white">Moussa D.</p>
                <p className="text-xs text-slate-400">Gérant, Boutique Le Relais (Abidjan)</p>
              </div>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-6">
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "Mon expert-comptable était ravi quand je lui ai transmis le compte de résultat synthétique exporté directement depuis iziFlow. Tout est carré, conforme et clair."
            </p>
            <div className="flex items-center gap-3">
              <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop" alt="Aïcha T." />
              <div>
                <p className="text-sm font-bold text-white">Aïcha T.</p>
                <p className="text-xs text-slate-400">Directrice, SeneService SARL (Thiès)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. PRICING SECTION (Simple, Transparent)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-6xl mx-auto px-5 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            Tarifs Transparents
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Des forfaits pensés pour la réalité des TPE & PME
          </h2>
          <p className="text-sm text-slate-400">
            Aucun engagement. Démarrez gratuitement et évoluez selon votre croissance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Gratuit */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 inline-block mb-2">
                Découverte &amp; Test
              </span>
              <h3 className="text-xl font-bold text-white">Gratuit</h3>
              <p className="text-xs text-slate-400 mt-1">Pour tester et émettre ses premières factures</p>
              
              <div className="my-5">
                <span className="text-4xl font-black text-white font-mono">0 FCFA</span>
                <span className="text-xs text-slate-400"> / mois</span>
              </div>

              {/* Quotas concrets */}
              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5 mb-5 text-xs">
                <div className="flex justify-between text-slate-200">
                  <span>📄 Factures :</span>
                  <span className="font-bold font-mono">5 / mois</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>🧾 Tickets caisse :</span>
                  <span className="font-bold font-mono">15 / mois</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>💼 Bulletins paie :</span>
                  <span className="font-bold font-mono">1 test / mois</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>📦 Stock articles :</span>
                  <span className="font-bold font-mono">10 articles max</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Export PDF standard (filigrane iziFlow)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Calcul automatique TVA 18%</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Caisse Rapide comptoir basique</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Partage de lien de paiement manuel</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold text-center block transition-colors">
              Commencer gratuitement
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-900 border-2 border-indigo-500 relative flex flex-col justify-between shadow-2xl">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
              Recommandé • Commerces &amp; TPE
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-block mb-2">
                Le Plus Populaire
              </span>
              <h3 className="text-xl font-bold text-white">Pro</h3>
              <p className="text-xs text-indigo-300 mt-1">Pour commerçants, boutiques, artisans &amp; indépendants</p>
              
              <div className="my-5">
                <span className="text-4xl font-black text-white font-mono">10 000 FCFA</span>
                <span className="text-xs text-slate-400"> / mois</span>
              </div>

              {/* Quotas concrets */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-1.5 mb-5 text-xs">
                <div className="flex justify-between text-white">
                  <span className="font-semibold">📄 Factures &amp; devis :</span>
                  <span className="font-extrabold font-mono text-indigo-300">150 / mois</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="font-semibold">🧾 Tickets de caisse :</span>
                  <span className="font-extrabold font-mono text-emerald-400">ILLIMITÉS</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="font-semibold">💼 Bulletins de paie :</span>
                  <span className="font-extrabold font-mono text-purple-300">Jusqu'à 5 / mois</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="font-semibold">📦 Gestion stocks :</span>
                  <span className="font-extrabold font-mono text-emerald-400">ILLIMITÉE + Alertes</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Votre propre logo</strong> (sans filigrane)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Cachet officiel &amp; Signature numérique</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Paiements directs Wave &amp; Orange Money</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Relances WhatsApp en 1 clic</strong> (impayés)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Tickets caisse thermiques 80mm &amp; WhatsApp</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Bulletins conformes IPRES / CSS / Code Travail</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Support prioritaire WhatsApp 7j/7</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold text-center block shadow-lg shadow-indigo-600/30 transition-all">
              Choisir le forfait Pro (10 000 FCFA)
            </Link>
          </div>

          {/* Business */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 inline-block mb-2">
                Pack Complet Entreprise
              </span>
              <h3 className="text-xl font-bold text-white">Business</h3>
              <p className="text-xs text-slate-400 mt-1">Pour PME structurées, RH complètes &amp; équipes</p>
              
              <div className="my-5">
                <span className="text-4xl font-black text-white font-mono">25 000 FCFA</span>
                <span className="text-xs text-slate-400"> / mois</span>
              </div>

              {/* Quotas concrets */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1.5 mb-5 text-xs">
                <div className="flex justify-between text-white">
                  <span className="font-semibold">📄 Factures &amp; devis :</span>
                  <span className="font-extrabold font-mono text-purple-400">100% ILLIMITÉS</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="font-semibold">🧾 Tickets de caisse :</span>
                  <span className="font-extrabold font-mono text-purple-400">100% ILLIMITÉS</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="font-semibold">💼 Bulletins de paie :</span>
                  <span className="font-extrabold font-mono text-purple-400">Jusqu'à 25 / mois</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="font-semibold">📦 Stocks &amp; Coût :</span>
                  <span className="font-extrabold font-mono text-purple-400">Illimité + Valorisation</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Tout le forfait Pro inclus sans exception</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Pipeline Commercial CRM complet</strong> (prospects)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Compte de résultat automatique (P&amp;L OHADA)</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> RH avancée (déclarations IPRES &amp; CSS complètes)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Relances WhatsApp groupées et campagnes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Export comptable Excel pour expert-comptable</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Support VIP dédié Téléphone &amp; WhatsApp 7j/7</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold text-center block shadow-lg shadow-purple-600/30 transition-all">
              Choisir le forfait Business (25 000 FCFA)
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. FAQ ACCORDION (Like Izimelo "Questions Fréquentes")
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="max-w-4xl mx-auto px-5 py-20 border-t border-slate-900">
        <div className="text-center mb-12 space-y-3">
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Questions Fréquentes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Tout ce que vous devez savoir pour démarrer avec iziFlow.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-400" : "text-slate-500"}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. CALL TO ACTION BANNER (Final High-Converting Card)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="relative rounded-3xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/30 p-8 md:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Prêt à simplifier la gestion de votre entreprise ?
            </h2>
            <p className="text-sm md:text-base text-slate-300">
              Rejoignez des milliers de professionnels qui automatisent leurs ventes, stocks et factures dès aujourd'hui.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
              >
                <span>Créer mon compte gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-[11px] text-slate-400">
              Inscription en 1 minute • Sans carte bancaire • Conforme OHADA
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          9. FOOTER (Clean, Professional, Like Izimelo)
      ────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                iF
              </div>
              <span className="text-lg font-black text-white">izi<span className="text-indigo-400">Flow</span></span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              La suite de gestion commerciale tout-en-un pour les entreprises et commerçants d'Afrique francophone.
            </p>
          </div>

          <div>
            <p className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Produit</p>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/inventory" className="hover:text-white transition-colors">Gestion de Stocks</Link></li>
              <li><Link href="/sales" className="hover:text-white transition-colors">Caisse Rapide (POS)</Link></li>
              <li><Link href="/invoices" className="hover:text-white transition-colors">Factures & Devis</Link></li>
              <li><Link href="/settings/signature" className="hover:text-white transition-colors">Signature & Cachet</Link></li>
              <li><Link href="/reports" className="hover:text-white transition-colors">Rapport Financier P&L</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Territoires</p>
            <ul className="space-y-2 text-[11px]">
              <li>🇸🇳 Sénégal (Dakar, Thiès, Touba)</li>
              <li>🇨🇮 Côte d'Ivoire (Abidjan, Bouaké)</li>
              <li>🇨🇲 Cameroun (Douala, Yaoundé)</li>
              <li>🇧🇯 Bénin & Togo</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Légal & Contact</p>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#" className="hover:text-white transition-colors">Conditions Générales d'Utilisation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a></li>
              <li><a href="mailto:contact@iziflow.sn" className="hover:text-white transition-colors">contact@iziflow.sn</a></li>
              <li><span className="text-slate-500">Conforme Système Comptable OHADA</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 iziFlow Technologies. Tous droits réservés.</p>
          <p className="flex items-center gap-1 font-medium text-slate-400">
            Fait avec fierté en Afrique 🌍
          </p>
        </div>
      </footer>
    </div>
  );
}
