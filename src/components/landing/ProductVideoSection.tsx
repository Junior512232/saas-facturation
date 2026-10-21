"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { 
  Play, 
  ArrowRight, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  Receipt, 
  Zap
} from "lucide-react";

export function ProductVideoSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section id="demo" className="max-w-6xl mx-auto px-5 py-16 md:py-24 border-t border-slate-900 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-sky-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-600/10">
          <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
          <span>Démo Produit • Vidéo en Direct</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Découvrez iziFlow en <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">action réelle</span>
        </h2>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed">
          Voyez concrètement comment la plateforme accélère vos encaissements, gère vos stocks et émet vos factures certifiées en quelques clics.
        </p>
      </div>

      {/* Main Grid: Info + Smartphone Video Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Key Highlights & Conversion */}
        <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Prise en main express</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              Une interface intuitive pensée pour les réalités du terrain
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pas de configuration complexe ni de formation de plusieurs semaines : vous créez votre compte, ajoutez vos produits et commencez à encaisser en moins de 3 minutes chrono.
            </p>
          </div>

          {/* Value Highlights List */}
          <div className="space-y-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Facturation certifiée OHADA</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Génération instantanée de factures avec NINEA, RCCM, TVA 18%, tampon officiel d'entreprise et QR code de certification.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Encaissement 1-Clic Wave &amp; Orange Money</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Vos clients règlent directement via QR code ou lien WhatsApp avec confirmation de paiement automatique sur votre terminal.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Accessible sur Smartphone, Tablette &amp; PC</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Gérez votre boutique depuis votre téléphone ou un ordinateur avec synchronisation instantanée du stock en temps réel.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Unified CTA */}
          <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto relative group overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/40 hover:shadow-indigo-500/50 transition-all active:scale-95 flex items-center justify-center gap-2.5 border border-indigo-400/30"
            >
              <span>Créer ma première facture — gratuit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Test sans engagement • Sans carte bancaire requise</span>
          </p>
        </div>

        {/* Right Column: High-End Smartphone Frame with Real Video */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2">
          <div className="relative w-full max-w-[340px] sm:max-w-[370px]">
            
            {/* Glowing Backdrop Ring */}
            <div className="absolute -inset-3 bg-gradient-to-r from-indigo-600/40 via-violet-600/30 to-sky-500/30 rounded-[48px] blur-2xl opacity-70 pointer-events-none" />

            {/* Smartphone Outer Bezel */}
            <div className="relative rounded-[44px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-700/80 shadow-2xl shadow-black/90">
              
              {/* Inner Bezel Screen */}
              <div className="relative rounded-[36px] bg-slate-950 overflow-hidden border border-slate-800 shadow-inner">
                
                {/* Smartphone Dynamic Island / Speaker Header */}
                <div className="absolute top-0 inset-x-0 h-7 bg-slate-950 z-20 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-1.5 border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-slate-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                  </div>
                </div>

                {/* Video Element */}
                <video
                  ref={videoRef}
                  src="/videos/demo-produit.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full aspect-[464/832] object-cover bg-slate-950 pt-2 block"
                >
                  Votre navigateur ne supporte pas la lecture vidéo HTML5.
                </video>

                {/* Floating Quick Action Overlay if video is paused */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    aria-label="Lancer la démonstration vidéo"
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 transition-opacity group cursor-pointer z-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-indigo-600/90 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/60 group-hover:scale-110 transition-transform border border-indigo-400/50">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                    <span className="text-xs font-bold text-white bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-700 shadow-lg">
                      Lancer la démonstration
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Floating Trust Pill Badge (Bottom-Right) */}
            <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-slate-900/95 border border-indigo-500/40 backdrop-blur-xl px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-left z-20">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Capture Réelle</p>
                <p className="text-xs font-bold text-white">Application iziFlow</p>
              </div>
            </div>

            {/* Floating Info Pill Badge (Top-Left) */}
            <div className="absolute -top-3 -left-2 sm:-left-4 bg-slate-900/95 border border-slate-800 backdrop-blur-xl px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 text-left z-20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] font-bold text-white">Version Mobile PWA</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
