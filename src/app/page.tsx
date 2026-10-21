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
import { MobileDemo } from "@/components/landing/MobileDemo";
import { LiveChatWidget } from "@/components/landing/LiveChatWidget";
import { VideoDemoSection } from "@/components/landing/VideoDemoSection";

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"pos" | "invoices" | "stock" | "signature" | "reports">("pos");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setShowFloatingCta(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs = [
    {
      q: "Est-ce que mes données et mes transactions sont sécurisées ?",
      a: "Absolument. Vos données sont chiffrées de bout en bout avec le protocole bancaire SSL/TLS 256 bits et hébergées sur des serveurs sécurisés avec sauvegardes automatiques quotidiennes. Pour les paiements, nous nous appuyons sur des passerelles agréées par la BCEAO (comme Bictorys, Wave et Orange Money). Aucune donnée bancaire sensible n'est stockée sur nos serveurs."
    },
    {
      q: "Puis-je utiliser l'application sans connexion internet ? (Mode hors-ligne)",
      a: "Oui, parfaitement ! Conçu spécifiquement pour les réalités d'Afrique de l'Ouest, iziFlow intègre un mode hors-ligne intelligent (PWA). Vous pouvez continuer à saisir des encaissements au comptoir et délivrer des tickets de caisse même en cas de coupure réseau. Dès que la connexion est rétablie, vos données et vos niveaux de stocks se synchronisent automatiquement en arrière-plan."
    },
    {
      q: "Comment se passe le support si j'ai un problème ?",
      a: "Vous bénéficiez d'un support humain et ultra-réactif basé à Dakar, disponible 7j/7 directement sur WhatsApp (+221 77 493 73 49), par téléphone et par email (massalndiaye23@gmail.com). Nous répondons généralement en moins de 10 minutes et nous pouvons vous accompagner pas-à-pas lors d'un appel vidéo pour configurer votre compte."
    },
    {
      q: "Puis-je importer mes anciennes données Excel ?",
      a: "Oui, en 1 clic ! Vous pouvez importer directement vos fichiers Excel ou CSV existants : catalogue d'articles, liste de clients, prix et niveaux de stock initiaux. Nous fournissons des modèles Excel prêts à l'emploi et notre équipe peut vous assister gratuitement lors de la migration."
    },
    {
      q: "iziFlow est-il conforme aux normes fiscales OHADA et au Sénégal ?",
      a: "Oui, à 100%. iziFlow intègre les mentions légales obligatoires OHADA (NINEA, RCCM), le calcul automatique de la TVA à 18% (ou exonération), et génère un QR code d'authentification certifié et inviolable sur chaque document."
    },
    {
      q: "Comment fonctionne l'encaissement direct par Wave et Orange Money ?",
      a: "Sur le terminal de caisse comme sur les factures numériques partagées sur WhatsApp, vos clients règlent directement via leur compte Wave ou Orange Money. Grâce à la passerelle agréée Bictorys, l'argent arrive instantanément sur votre compte professionnel avec confirmation automatique."
    },
    {
      q: "Comment fonctionne le cachet d'entreprise et la signature électronique ?",
      a: "Vous pouvez soit uploader l'image de votre tampon physique scanné, soit utiliser notre générateur magique de tampon officiel vectoriel. Vous tracez ensuite votre signature numérique au doigt ou à la souris : ils sont automatiquement apposés en bas de vos factures et devis PDF."
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
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#showcase" className="hover:text-white transition-colors">Démonstration</a>
            <a href="#demo" className="hover:text-white transition-colors">Vidéo</a>
            <a href="#features" className="hover:text-white transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#about" className="hover:text-white transition-colors">À propos</a>
            <a href="#resources" className="hover:text-white transition-colors">Guides</a>
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
        {/* Hero Background Image with Clear Opacity & Transparency Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <img
            src="/hero-bg.jpg"
            alt="Gestion d'entreprise et facturation iziFlow"
            className="w-full h-full object-cover object-center opacity-60 md:opacity-75 filter brightness-95 contrast-105"
          />
          {/* Transparent Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70" />
        </div>

        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/30 via-violet-600/25 to-sky-500/15 blur-[130px] rounded-full pointer-events-none z-[1]" />

        <div className="max-w-5xl mx-auto px-5 text-center relative z-10 flex flex-col items-center gap-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-600/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Le n°1 de la gestion commerciale & facturation en Afrique</span>
          </div>

          {/* Main Headline with High Contrast Shadow */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-white max-w-4xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Pilotez votre entreprise en <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">3 minutes chrono</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-100 max-w-2xl font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            Ventes au comptoir, déstockage automatique, facturation certifiée avec cachet d'entreprise et encaissement Wave & Orange Money. La suite tout-en-un conforme OHADA.
          </p>

          {/* Dual CTAs - Much More Prominent */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-3 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto relative group overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-base px-9 py-4 rounded-2xl shadow-2xl shadow-indigo-600/50 hover:shadow-indigo-500/60 transition-all active:scale-95 flex items-center justify-center gap-2.5 border border-indigo-400/30"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto bg-slate-900/95 hover:bg-slate-800 text-slate-100 border border-slate-700 font-semibold text-sm px-7 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-current" />
              <span>Tester la démo en 1 clic</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-300 font-semibold -mt-2 drop-shadow-md">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Gratuit &amp; Sans CB</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Conforme OHADA &amp; Sénégal</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Support WhatsApp 7j/7</span>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 text-xs text-slate-300">
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

            <span className="font-medium drop-shadow-sm">
              Rejoint par plus de <strong>7 000 commerçants et PME</strong> au Sénégal, Côte d'Ivoire & Cameroun
            </span>
          </div>

          {/* Real Office Experience Photo Banner with Glass Frame */}
          <div className="w-full max-w-4xl mx-auto pt-4">
            <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/80 group">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
                <img
                  src="/hero-bg.jpg"
                  alt="Une bonne gestion, c'est une entreprise qui grandit - iziFlow"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Floating Quote Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-left shadow-2xl">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>L'expérience iziFlow au quotidien</span>
                  </div>
                  <p className="text-white text-xs sm:text-sm font-semibold leading-relaxed">
                    « Une bonne gestion, c'est une entreprise qui grandit. Des factures plus simples, plus de temps pour vous. »
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Smartphone App Showcase (Fintech Style) */}
          <div className="w-full pt-8 md:pt-14">
            <MobileDemo />
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

                {/* Real Mockup Visual Preview */}
                <div className="md:col-span-6 relative rounded-3xl border border-slate-800 bg-slate-950/90 p-3 shadow-2xl overflow-hidden group">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 text-xs mb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>Caisse Rapide &amp; Déstockage</span>
                    </span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                      Capture Réelle
                    </Badge>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden max-h-[360px] bg-slate-900 border border-slate-800/80">
                    <img 
                      src="/mockups/pos_caisse.jpg" 
                      alt="Caisse Rapide POS iziFlow" 
                      className="w-full h-full object-cover object-top" 
                    />
                    <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center shadow-lg">
                      <div>
                        <p className="text-[10px] text-slate-400">Total Encaissé Caisse</p>
                        <p className="font-black text-white font-mono text-sm">205 320 FCFA</p>
                      </div>
                      <span className="font-bold text-emerald-400 font-mono text-xs bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        +72 000 FCFA marge
                      </span>
                    </div>
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

                {/* Real Mockup Visual Preview */}
                <div className="md:col-span-6 relative rounded-3xl border border-slate-800 bg-slate-950/90 p-3 shadow-2xl overflow-hidden group">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 text-xs mb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-indigo-400" />
                      <span>Facture Certifiée &amp; WhatsApp</span>
                    </span>
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px]">
                      Capture Réelle
                    </Badge>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden max-h-[360px] bg-slate-900 border border-slate-800/80">
                    <img 
                      src="/mockups/invoice_detail.jpg" 
                      alt="Facture Détail WhatsApp iziFlow" 
                      className="w-full h-full object-cover object-top" 
                    />
                    <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center shadow-lg">
                      <div>
                        <p className="text-[10px] text-slate-400">Facture VTE-2026-003</p>
                        <p className="font-bold text-white text-xs">Ndiaye Agency • Dakar</p>
                      </div>
                      <span className="font-bold text-emerald-400 text-xs bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        Payée • Wave
                      </span>
                    </div>
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

                {/* Real Mockup Visual Preview */}
                <div className="md:col-span-6 relative rounded-3xl border border-slate-800 bg-slate-950/90 p-3 shadow-2xl overflow-hidden group">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 text-xs mb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span>Fiche Article &amp; Déstockage Live</span>
                    </span>
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                      Capture Réelle
                    </Badge>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden max-h-[360px] bg-slate-900 border border-slate-800/80">
                    <img 
                      src="/mockups/stock_modal.jpg" 
                      alt="Catalogue Stock iziFlow" 
                      className="w-full h-full object-cover object-top" 
                    />
                    <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center shadow-lg">
                      <div>
                        <p className="text-[10px] text-slate-400">Terminal TPE Wave (ART-2649)</p>
                        <p className="font-bold text-white text-xs">Suivi de stock actif</p>
                      </div>
                      <span className="font-bold text-amber-400 text-xs bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        Synchronisé Caisse
                      </span>
                    </div>
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

                {/* Real Mockup Visual Preview */}
                <div className="md:col-span-6 relative rounded-3xl border border-slate-800 bg-slate-950/90 p-3 shadow-2xl overflow-hidden group">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 text-xs mb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-sky-400" />
                      <span>Salaires &amp; Cotisations IPRES/CSS</span>
                    </span>
                    <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px]">
                      Capture Réelle
                    </Badge>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden max-h-[360px] bg-slate-900 border border-slate-800/80">
                    <img 
                      src="/mockups/payroll_rh.jpg" 
                      alt="Bulletins de paie RH iziFlow" 
                      className="w-full h-full object-cover object-top" 
                    />
                    <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center shadow-lg">
                      <div>
                        <p className="text-[10px] text-slate-400">Masse Salariale Nette</p>
                        <p className="font-black text-white font-mono text-sm">2 173 548 FCFA</p>
                      </div>
                      <span className="font-bold text-sky-400 font-mono text-xs bg-sky-500/15 px-2.5 py-1 rounded-lg border border-sky-500/30">
                        IPRES : 348 452 FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3.5 INTERACTIVE VIDEO DEMO SECTION (30-60 Seconds Walkthrough)
      ────────────────────────────────────────────────────────────────────────── */}
      <div id="demo">
        <VideoDemoSection />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECURITY & TRUST SECTION (Bictorys Approved Gateway & Banking Security)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 border-t border-slate-900">
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900/60 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
              Sécurité Bancaire &amp; Agréments
            </Badge>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Vos paiements et données financières en toute sécurité
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Pour garantir la protection absolue de vos fonds, iziFlow s'associe à des établissements agréés et certifiés par la Banque Centrale (BCEAO).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Passerelle Agréée Bictorys</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toutes les transactions Wave, Orange Money et cartes bancaires transitent via l'infrastructure sécurisée de Bictorys, opérateur de paiement agréé en zone UEMOA.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Chiffrement Bancaire 256 bits</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toutes les données fiscales, fiches de paie et coordonnées clients sont chiffrées de bout en bout (SSL/TLS 256 bits). Aucune donnée bancaire sensible n'est stockée sur nos serveurs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Conformité Fiscale OHADA</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Documents conformes aux règles de l'OHADA et de la DGI au Sénégal : mentions obligatoires (NINEA, RCCM), calcul automatique de TVA 18% et QR code d'authentification certifié.
              </p>
            </div>
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
          7. ABOUT US & MISSION SECTION ("Qui sommes-nous ?")
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="about" className="max-w-6xl mx-auto px-5 py-20 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 space-y-5 text-left">
            <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              Notre Mission &amp; Notre Équipe
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Conçu à Dakar pour libérer les entrepreneurs africains
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Nous avons fondé <strong>iziFlow</strong> avec une conviction simple : les commerçants, indépendants et PME d'Afrique méritent des logiciels aussi puissants et élégants que ceux des multinationales, sans la lourdeur des ERP complexes.
            </p>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Basée à Dakar avec une présence en Côte d'Ivoire et au Cameroun, notre équipe réunit ingénieurs logiciels, experts fiscaux OHADA et spécialistes du paiement mobile money. Nous construisons au quotidien l'outil le plus fiable pour gérer vos ventes, vos stocks et vos factures.
            </p>

            <div className="pt-2 grid grid-cols-3 gap-4 border-t border-slate-800 text-left">
              <div>
                <p className="text-2xl font-black text-white font-mono">7 000+</p>
                <p className="text-[11px] text-slate-400">PME &amp; Commerces</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-400 font-mono">100%</p>
                <p className="text-[11px] text-slate-400">Conforme OHADA</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400 font-mono">7j / 7</p>
                <p className="text-[11px] text-slate-400">Support WhatsApp</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 md:p-8 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Nos Engagements de Confiance</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Souveraineté et sécurité de vos données</strong>
                  <span className="text-slate-400">Vos chiffres d'affaires et informations clients vous appartiennent à 100%. Aucune revente de données.</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Accompagnement humain à chaque étape</strong>
                  <span className="text-slate-400">Une équipe disponible sur WhatsApp pour vous former, importer vos anciens fichiers Excel et répondre à vos questions fiscales.</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Évolution continue sans frais cachés</strong>
                  <span className="text-slate-400">Mises à jour automatiques au fil des nouvelles réglementations fiscales de l'UEMOA.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. RESOURCES & BLOG GUIDES ("Guides Pratiques & Fiscalité")
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="resources" className="max-w-6xl mx-auto px-5 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            Ressources &amp; Guides Pratiques
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Tout comprendre sur la fiscalité et la gestion en Afrique
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Des fiches pratiques et guides concrets pour gérer votre comptabilité sans prise de tête.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Article 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 inline-block">
                Fiscalité Sénégal
              </span>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Comment calculer et déclarer sa TVA à 18% au Sénégal en 2026
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Taux normal, régimes d'exonération, calcul du montant HT vers TTC et dates limites de déclaration auprès de la DGI.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Lecture : 4 min</span>
              <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Lire le guide &rarr;
              </span>
            </div>
          </div>

          {/* Article 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-block">
                Norme OHADA
              </span>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Les 7 mentions obligatoires sur vos factures d'entreprise en zone UEMOA
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                NINEA, numéro RCCM, adresse légale, QR code et cachet d'entreprise : évitez les sanctions lors d'un contrôle fiscal.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Lecture : 5 min</span>
              <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Lire le guide &rarr;
              </span>
            </div>
          </div>

          {/* Article 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 inline-block">
                Caisse &amp; POS
              </span>
              <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                Encaisser par Wave &amp; Orange Money au comptoir sans erreur de caisse
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pourquoi connecter sa caisse directement aux passerelles mobile money élimine les écarts de stock et les impayés.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Lecture : 3 min</span>
              <span className="text-sky-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Lire le guide &rarr;
              </span>
            </div>
          </div>

          {/* Article 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20 inline-block">
                Paie &amp; Social
              </span>
              <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                Bulletins de paie au Sénégal : Comprendre les cotisations IPRES et CSS
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Régime général des retraites, accidents du travail et allocations familiales : tout le barème social décrypté.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Lecture : 6 min</span>
              <span className="text-violet-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Lire le guide &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          9. FAQ ACCORDION (Questions Fréquentes)
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

      {/* ──────────────────────────────────────────────────────────────────────────
          10. FLOATING STICKY CTA BAR (Appears on scroll)
      ────────────────────────────────────────────────────────────────────────── */}
      {showFloatingCta && (
        <div className="fixed bottom-5 left-5 right-20 sm:left-auto sm:right-28 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 bg-slate-900/95 border border-indigo-500/40 backdrop-blur-xl p-2 sm:px-4 sm:py-2.5 rounded-full shadow-2xl shadow-indigo-600/30">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-white">izi<span className="text-indigo-400">Flow</span></span>
              <span className="text-[11px] text-slate-400">• Facturation en 3 min</span>
            </div>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-full shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          11. LIVE WHATSAPP CHAT WIDGET
      ────────────────────────────────────────────────────────────────────────── */}
      <LiveChatWidget />
    </div>
  );
}
