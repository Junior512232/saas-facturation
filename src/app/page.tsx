"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-brand-cream text-brand-dark min-h-[100dvh] selection:bg-brand-blue selection:text-white antialiased font-sans">
      {/* BEGIN: MainHeader */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-brand-cream/90 border-b border-brand-border/60 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link className="flex items-center gap-2.5 group" href="#">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-blue-glow/40 transition-transform group-hover:scale-95 duration-200">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 5h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7zm9 3a1 1 0 000 2h3a1 1 0 100-2h-3z"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-brand-dark flex items-center">
                izi<span className="text-brand-blue">Facture</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-brand-muted font-bold -mt-1">Zone OHADA • UEMOA</span>
            </div>
          </Link>
          {/* Quick Action CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5">
            {mounted && !loading && isAuthenticated ? (
              <Link
                className="bg-brand-dark text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-black transition-transform active:scale-95 shadow-sm"
                href="/dashboard"
              >
                Mon Tableau de bord
              </Link>
            ) : (
              <>
                <Link
                  className="text-xs font-semibold text-brand-dark hover:text-brand-blue px-3 py-2 transition-colors"
                  href="/login"
                >
                  Connexion
                </Link>
                <Link
                  className="bg-brand-dark text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-black transition-transform active:scale-95 shadow-sm"
                  href="/register"
                >
                  Essai gratuit
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {/* END: MainHeader */}

      <main>
        {/* BEGIN: HeroSection */}
        <section className="pt-8 pb-14 lg:pt-24 lg:pb-32 px-5 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
          {/* Minimalist Category Chip */}
          <div className="inline-flex items-center gap-2 bg-white/80 border border-brand-border px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-dark mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
            Solution Facturation FCFA &amp; UEMOA
          </div>
          {/* Main Headline in heavy typographic style */}
          <h1 className="text-4xl lg:text-5xl xl:text-6xl leading-[1.12] font-black tracking-tight text-brand-dark mb-5 text-balance">
            Fini les factures sur Word et Excel.<br />
            <span className="text-brand-blue">Facturez comme un pro.</span>
          </h1>
          <p className="text-base lg:text-lg text-brand-muted leading-relaxed font-normal mb-8 max-w-lg">
            La solution pensée pour les entrepreneurs en Côte d'Ivoire, au Sénégal, Cameroun et en Afrique. Créez des factures aux normes en 2 clics, calculez la TVA 18% et suivez vos encaissements.
          </p>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10" id="hero-cta">
            <Link
              className="w-full bg-brand-dark text-white font-bold text-center py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md active:scale-[0.98]"
              href={mounted && !loading && isAuthenticated ? "/dashboard" : "/register"}
            >
              <span>Commencer gratuitement</span>
              <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
              </svg>
            </Link>
            <a
              className="w-full bg-white border border-brand-border text-brand-dark font-bold text-center py-3.5 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-brand-creamDark transition-colors"
              href="#comment-ca-marche"
            >
              <svg className="w-4 h-4 fill-brand-blue" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"></path>
              </svg>
              <span>Voir la démo (1 min)</span>
            </a>
          </div>
          </div>
          {/* Hero Visual Elements & SeePay Style Visual Hierarchy */}
          <div className="lg:w-1/2 w-full">
          <div className="relative pt-4 lg:pt-0 w-full max-w-md mx-auto lg:max-w-none">
            {/* Floating Ivory Metric Badge */}
            <div className="bg-brand-creamDark rounded-3xl p-5 border border-brand-border/80 shadow-soft mb-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-brand-muted font-bold block mb-1">Standard UEMOA &amp; CEMAC</span>
                <p className="text-xl font-extrabold text-brand-dark">100% Conforme</p>
                <p className="text-xs text-brand-muted mt-0.5">TVA 18% &amp; mentions légales incluses</p>
              </div>
              {/* Geometric Wireframe Symbol */}
              <div className="w-14 h-14 bg-white/70 rounded-2xl flex items-center justify-center border border-brand-border">
                <svg className="w-8 h-8 text-brand-dark animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"></circle>
                  <ellipse cx="12" cy="12" rx="4" ry="9"></ellipse>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                </svg>
              </div>
            </div>
            {/* High-Impact Red Card (Inspired by SeePay's Red Action Card) */}
            <div className="bg-brand-blue rounded-3xl p-6 text-white shadow-blue-glow relative overflow-hidden mb-6">
              {/* Background geometric flare */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              {/* Stacked African Entrepreneurs Avatars */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="w-9 h-9 rounded-full ring-2 ring-brand-blue bg-amber-200 flex items-center justify-center text-xs font-bold text-brand-dark">
                    AD
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-brand-blue bg-rose-200 flex items-center justify-center text-xs font-bold text-brand-dark">
                    MK
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-brand-blue bg-sky-200 flex items-center justify-center text-xs font-bold text-brand-dark">
                    SN
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-brand-blue bg-white text-brand-blue flex items-center justify-center text-[11px] font-black">
                    +2.5k
                  </div>
                </div>
                <span className="text-xs font-medium text-white/90">Entrepreneurs actifs</span>
              </div>
              <h3 className="text-xl font-bold leading-snug mb-2 text-white">
                Accélérez vos encaissements dès aujourd'hui
              </h3>
              <p className="text-xs text-white/80 leading-relaxed mb-4">
                Paiements instantanés par Wave, Orange Money et virements sans friction.
              </p>
              <a className="inline-flex items-center gap-2 text-xs font-bold text-white border-b border-white/60 pb-1 hover:border-white" href="#tarification">
                <span>Découvrir iziFacture</span>
                <span className="text-base leading-none">↗</span>
              </a>
            </div>
            {/* SaaS Mobile Mockup Preview Card */}
            <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-card relative">
              {/* Mockup Header */}
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-brand-dark tracking-wide">FACTURE #INV-2024-089</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Payée via Wave
                </span>
              </div>
              {/* Invoice Details Preview */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-brand-muted">Client :</span>
                  <span className="text-xs font-semibold text-brand-dark">Société AgroTech SA (Abidjan)</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-brand-muted">Montant HT :</span>
                  <span className="text-xs font-semibold text-brand-dark">1 450 000 FCFA</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-brand-muted">TVA (18%) :</span>
                  <span className="text-xs font-semibold text-brand-dark">261 000 FCFA</span>
                </div>
                <div className="pt-2 border-t border-dashed border-brand-border flex justify-between items-baseline">
                  <span className="text-sm font-bold text-brand-dark">Total TTC :</span>
                  <span className="text-lg font-black text-brand-blue">1 711 000 FCFA</span>
                </div>
              </div>
              {/* Micro QR code verification indicator */}
              <div className="mt-4 pt-3 border-t border-brand-border/50 flex items-center justify-between text-[11px] text-brand-muted">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span>QR Code DGI Conforme</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">CI-2024-V9</span>
              </div>
            </div>
          </div>
          </div>
        </section>
        {/* END: HeroSection */}

        {/* BEGIN: ProblemSection */}
        <section className="py-14 lg:py-24 px-5 bg-white border-y border-brand-border/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-left lg:text-center mb-12">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-1">Le constat</span>
              <h2 className="text-2xl font-black text-brand-dark tracking-tight leading-tight">
                Le cauchemar de la facturation manuelle
              </h2>
              <p className="text-sm text-brand-muted mt-2">
                Perdre des heures sur Excel vous coûte des millions et entache votre réputation.
              </p>
            </div>
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Card 1 */}
              <div className="p-5 rounded-3xl bg-brand-cream border border-brand-border/90 flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-blue text-base font-black">
                  ✕
                </div>
                <h3 className="text-base font-bold text-brand-dark pt-1">Factures Word &amp; Excel bricolées</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Mises en page cassées, numérotation désordonnée et manque de sérieux auprès des grands comptes et bailleurs de fonds.
                </p>
              </div>
              {/* Card 2 */}
              <div className="p-5 rounded-3xl bg-brand-cream border border-brand-border/90 flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-blue text-base font-black">
                  %
                </div>
                <h3 className="text-base font-bold text-brand-dark pt-1">Erreurs de calcul de la TVA 18%</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Fausse déclaration, oublis d'acompte BIC, et maux de tête avec votre comptable lors des clôtures trimestrielles.
                </p>
              </div>
              {/* Card 3 */}
              <div className="p-5 rounded-3xl bg-brand-cream border border-brand-border/90 flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-blue text-base font-black">
                  ⏳
                </div>
                <h3 className="text-base font-bold text-brand-dark pt-1">Relances WhatsApp oubliées</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Des factures impayées dispersées dans vos conversations chat et sur des calepins sans aucune visibilité sur votre trésorerie.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* END: ProblemSection */}

        {/* BEGIN: FeaturesSection */}
        <section className="py-14 lg:py-24 px-5 max-w-6xl mx-auto">
          <div className="mb-12 lg:text-center">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-1">Fonctionnalités</span>
            <h2 className="text-2xl font-black text-brand-dark tracking-tight leading-tight">
              Tout pour accélérer vos encaissements
            </h2>
            <p className="text-sm text-brand-muted mt-2">
              Pensé spécialement pour les PME, freelances et prestataires de services en Afrique francophone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-cream flex items-center justify-center mb-4 text-brand-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-1.5">Factures &amp; Devis en 2 clics</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Émettez des PDF impeccables avec votre logo, vos coordonnées bancaires et vos mentions juridiques directement exportables.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-cream flex items-center justify-center mb-4 text-brand-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-1.5">Calcul Automatique TVA 18%</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Gestion du Hors Taxe (HT), de la TVA et du TTC sans risque d'erreur de virgule. Totalement adapté aux lois de finances locales.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-cream flex items-center justify-center mb-4 text-brand-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-1.5">Suivi des impayés &amp; alertes</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Sachez exactement qui vous doit quoi. Déclenchez des rappels courtois par WhatsApp ou email d’une simple pression.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-cream flex items-center justify-center mb-4 text-brand-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-1.5">Répertoire Client &amp; Historique</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Centralisez vos contacts (NIF, RCCM, adresses) et visualisez le chiffre d'affaires généré par chaque partenaire commercial.
              </p>
            </div>
          </div>
        </section>
        {/* END: FeaturesSection */}

        {/* BEGIN: HowItWorks */}
        <section className="py-14 lg:py-24 px-5 bg-brand-creamDark border-t border-brand-border/70" id="comment-ca-marche">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 lg:text-center">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-1">Simple &amp; Rapide</span>
              <h2 className="text-2xl lg:text-3xl font-black text-brand-dark tracking-tight">
                3 étapes pour être payé plus vite
              </h2>
            </div>
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8 relative">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-dark text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  01
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Créez votre compte en 30 sec</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Aucune carte bancaire requise. Entrez simplement votre numéro de téléphone et le nom de votre structure.
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  02
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Éditez votre facture</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Ajoutez vos prestations en FCFA. Le système applique automatiquement le taux de TVA et génère le document PDF normé.
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-dark text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  03
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Partagez et encaissez</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Envoyez le lien ou le PDF direct sur WhatsApp ou Email. Votre client paie et le statut passe à "Payé" immédiatement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: HowItWorks */}

        {/* BEGIN: TestimonialsSection */}
        <section className="py-14 lg:py-24 px-5 max-w-6xl mx-auto">
          <div className="mb-12 lg:text-center">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-1">Témoignages</span>
            <h2 className="text-2xl font-black text-brand-dark tracking-tight">
              Adopté par les entrepreneurs qui avancent
            </h2>
          </div>
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Review 1 */}
            <div className="bg-white p-5 rounded-3xl border border-brand-border">
              <div className="flex text-amber-400 text-sm mb-2">★★★★★</div>
              <p className="text-xs text-brand-charcoal italic leading-relaxed mb-4">
                "Avant iziFacture, je passais mes dimanches soirs à recalculer la TVA sur Excel pour mes clients B2B à Dakar. Maintenant, en 3 clics sur mon téléphone, c'est envoyé par WhatsApp."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-creamDark flex items-center justify-center font-bold text-xs text-brand-dark">
                  AD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-dark">Amadou Diallo</h4>
                  <p className="text-[10px] text-brand-muted">Agence Digitale Teranga • Dakar</p>
                </div>
              </div>
            </div>
            {/* Review 2 */}
            <div className="bg-white p-5 rounded-3xl border border-brand-border">
              <div className="flex text-amber-400 text-sm mb-2">★★★★★</div>
              <p className="text-xs text-brand-charcoal italic leading-relaxed mb-4">
                "Le fait d'avoir un QR code et la conformité UEMOA a complètement rassuré nos clients corporatifs à Abidjan. Les paiements tombent 2 fois plus vite."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-creamDark flex items-center justify-center font-bold text-xs text-brand-dark">
                  AK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-dark">Aminata Kouassi</h4>
                  <p className="text-[10px] text-brand-muted">Fondatrice, Ivoire Design Lab • Abidjan</p>
                </div>
              </div>
            </div>
            {/* Review 3 */}
            <div className="bg-white p-5 rounded-3xl border border-brand-border">
              <div className="flex text-amber-400 text-sm mb-2">★★★★★</div>
              <p className="text-xs text-brand-charcoal italic leading-relaxed mb-4">
                "Simple, rapide et surtout en FCFA. Fini les logiciels américains trop compliqués qui ne gèrent pas nos réalités fiscales en zone CEMAC."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-creamDark flex items-center justify-center font-bold text-xs text-brand-dark">
                  SN
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-dark">Samuel Ndongo</h4>
                  <p className="text-[10px] text-brand-muted">Consultant IT • Douala</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: TestimonialsSection */}

        {/* BEGIN: PricingSection */}
        <section className="py-14 lg:py-24 px-5 bg-white border-y border-brand-border/80" id="tarification">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-1">Tarifs transparents</span>
              <h2 className="text-2xl font-black text-brand-dark tracking-tight">
                Investissez dans votre sérénité
              </h2>
              <p className="text-xs text-brand-muted mt-1">Facturation en FCFA • Sans engagement</p>
            </div>
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
              {/* Plan Gratuit */}
              <div className="p-6 rounded-3xl bg-brand-cream border border-brand-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark">Gratuit</h3>
                    <p className="text-xs text-brand-muted">Pour démarrer sereinement</p>
                  </div>
                  <span className="text-2xl font-black text-brand-dark">0 <span className="text-xs font-normal">FCFA</span></span>
                </div>
                <ul className="text-xs text-brand-muted space-y-2.5 my-5">
                  <li className="flex items-center gap-2">✓ Jusqu'à 5 factures / mois</li>
                  <li className="flex items-center gap-2">✓ Calcul auto TVA 18%</li>
                  <li className="flex items-center gap-2">✓ Exportation PDF avec filigrane</li>
                </ul>
                <Link
                  className="block w-full py-3 text-center text-xs font-bold bg-white text-brand-dark border border-brand-border rounded-full hover:bg-zinc-100 transition-colors"
                  href="/register"
                >
                  Commencer sans frais
                </Link>
              </div>
              {/* Plan Pro (Highlighted SeePay-style) */}
              <div className="p-6 rounded-3xl bg-brand-dark text-white relative shadow-soft border-2 border-brand-blue">
                {/* Badge Recommandé */}
                <div className="absolute -top-3.5 right-6 bg-brand-blue text-white text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full shadow-sm">
                  Recommandé
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Pro</h3>
                    <p className="text-xs text-white/70">Pour indépendants et PME actives</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">5 000</span>
                    <span className="text-xs block text-white/70">FCFA / mois</span>
                  </div>
                </div>
                <ul className="text-xs text-white/90 space-y-2.5 my-5">
                  <li className="flex items-center gap-2 font-medium">✓ <span className="text-white">Factures &amp; devis illimités</span></li>
                  <li className="flex items-center gap-2 font-medium">✓ <span className="text-white">Votre propre logo (sans mention iziFacture)</span></li>
                  <li className="flex items-center gap-2 font-medium">✓ <span className="text-white">Relances WhatsApp en 1 clic</span></li>
                  <li className="flex items-center gap-2 font-medium">✓ <span className="text-white">Export comptable Excel pour déclaration</span></li>
                  <li className="flex items-center gap-2 font-medium">✓ <span className="text-white">Support WhatsApp prioritaire 7j/7</span></li>
                </ul>
                <Link
                  className="block w-full py-3.5 text-center text-xs font-bold bg-brand-blue text-white rounded-full hover:bg-brand-blueDark shadow-blue-glow transition-all active:scale-[0.98]"
                  href="/register?plan=pro"
                >
                  Choisir l'offre Pro (Essai 14 jours)
                </Link>
              </div>
              {/* Plan Business */}
              <div className="p-6 rounded-3xl bg-brand-cream border border-brand-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark">Business</h3>
                    <p className="text-xs text-brand-muted">Multi-sociétés et équipes</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-dark">15 000</span>
                    <span className="text-xs block text-brand-muted">FCFA / mois</span>
                  </div>
                </div>
                <ul className="text-xs text-brand-muted space-y-2.5 my-5">
                  <li className="flex items-center gap-2">✓ Tout le forfait Pro inclus</li>
                  <li className="flex items-center gap-2">✓ Jusqu'à 5 utilisateurs collaborateurs</li>
                  <li className="flex items-center gap-2">✓ Gestion multi-entreprises (jusqu'à 3 entités)</li>
                  <li className="flex items-center gap-2">✓ Accès direct pour votre expert-comptable</li>
                </ul>
                <Link
                  className="block w-full py-3 text-center text-xs font-bold bg-white text-brand-dark border border-brand-border rounded-full hover:bg-zinc-100 transition-colors"
                  href="/register?plan=business"
                >
                  Sélectionner Business
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* END: PricingSection */}

        {/* BEGIN: FinalCTASection */}
        <section className="py-14 lg:py-24 px-5 max-w-4xl mx-auto">
          <div className="bg-brand-blue rounded-4xl p-7 text-white text-center shadow-blue-glow relative overflow-hidden">
            {/* Graphic circle accents */}
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <span className="inline-block bg-white/20 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3 backdrop-blur-sm">
              Rejoignez le mouvement
            </span>
            <h2 className="text-2xl lg:text-4xl font-black leading-tight mb-4">
              Prêt à facturer comme un grand compte ?
            </h2>
            <p className="text-sm lg:text-base text-white/85 mb-8 leading-relaxed max-w-lg mx-auto">
              Rejoignez plus de 2 500 entrepreneurs au Sénégal, en Côte d’Ivoire et au Cameroun qui se font payer à temps.
            </p>
            <Link
              className="inline-block w-full md:w-auto md:px-12 bg-brand-dark text-white font-extrabold text-sm py-4 rounded-full hover:bg-black shadow-lg transition-transform active:scale-95"
              href={mounted && !loading && isAuthenticated ? "/dashboard" : "/register"}
            >
              Commencer gratuitement maintenant
            </Link>
            <p className="text-[10px] text-white/70 mt-3">Sans carte bancaire • Configuration en 2 minutes</p>
          </div>
        </section>
        {/* END: FinalCTASection */}
      </main>

      {/* BEGIN: MainFooter */}
      <footer className="bg-brand-dark text-white pt-12 lg:pt-20 pb-16 px-5 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto space-y-8 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center text-white font-bold text-sm">
                iF
              </div>
              <span className="text-xl font-black tracking-tight text-white">izi<span className="text-brand-blue">Facture</span></span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Le logiciel de facturation moderne conçu pour libérer le potentiel des entrepreneurs en Afrique francophone.
            </p>
          </div>
          {/* Quick Links Grid */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 text-xs text-zinc-300">
            <div>
              <h4 className="font-bold text-white mb-2.5 text-xs uppercase tracking-wider">Plateforme</h4>
              <ul className="space-y-2">
                <li><Link className="hover:text-white transition-colors" href="#">Modèles de Facture</Link></li>
                <li><Link className="hover:text-white transition-colors" href="#">Calculateur TVA 18%</Link></li>
                <li><Link className="hover:text-white transition-colors" href="#">Guide Conforme OHADA</Link></li>
                <li><Link className="hover:text-white transition-colors" href="#">Application Mobile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2.5 text-xs uppercase tracking-wider">Territoires</h4>
              <ul className="space-y-2">
                <li><Link className="hover:text-white transition-colors" href="#">🇸🇳 Sénégal (Dakar)</Link></li>
                <li><Link className="hover:text-white transition-colors" href="#">🇨🇮 Côte d'Ivoire (Abidjan)</Link></li>
                <li><Link className="hover:text-white transition-colors" href="#">🇨🇲 Cameroun (Douala)</Link></li>
                <li><Link className="hover:text-white transition-colors" href="#">🇧🇯 Bénin &amp; Togo</Link></li>
              </ul>
            </div>
          </div>
          {/* Bottom Credits and Compliance */}
          <div className="lg:col-span-4 pt-6 lg:pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row md:justify-between gap-2 text-[11px] text-zinc-500">
            <div className="flex items-center justify-between">
              <span>© 2024 iziFacture Technologies.</span>
              <span className="text-zinc-400">Devise : XOF / XAF (FCFA)</span>
            </div>
            <p className="text-zinc-400 font-medium">Fait avec fierté en Afrique 🌍</p>
          </div>
        </div>
      </footer>
      {/* END: MainFooter */}
    </div>
  );
}
