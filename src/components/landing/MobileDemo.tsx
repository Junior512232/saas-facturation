"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Send, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  CheckCheck, 
  Smartphone,
  Play,
  RotateCcw
} from "lucide-react";
import { formatFCFA } from "@/lib/utils";

// Logo Wave SVG officiel
function WaveIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <div className={`rounded-full bg-[#1dc3f7] flex items-center justify-center text-white font-black text-[10px] ${className}`}>
      W
    </div>
  );
}

// Logo WhatsApp SVG
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.947 2.801.947h.005c3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.768-5.778-5.768zm7.322 5.767c-.002 3.992-3.25 7.241-7.246 7.241-1.258 0-2.451-.334-3.51-.955l-4.103 1.076 1.096-4c-.694-1.111-1.077-2.399-1.079-3.722.002-3.992 3.25-7.241 7.246-7.241 3.995 0 7.244 3.248 7.246 7.241z"/>
    </svg>
  );
}

interface MobileDemoProps {
  videoSrc?: string; // Permet à l'utilisateur de charger sa vidéo Loom/Screen Studio s'il le souhaite
}

export function MobileDemo({ videoSrc }: MobileDemoProps) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Cycle automatique de 12-15 secondes (4,5 secondes par étape)
  useEffect(() => {
    if (!isPlaying || videoSrc) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, videoSrc]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      
      {/* Contrôles d'étapes (Timeline en haut du smartphone) */}
      {!videoSrc && (
        <div className="flex items-center justify-between w-full px-2 gap-1.5 bg-brand-creamDark/60 p-1.5 rounded-2xl border border-brand-border">
          <button 
            onClick={() => { setStep(0); setIsPlaying(false); }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
              step === 0 
                ? "bg-white text-brand-dark shadow-sm scale-[1.02]" 
                : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            <span>1. Facture</span>
          </button>

          <button 
            onClick={() => { setStep(1); setIsPlaying(false); }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
              step === 1 
                ? "bg-[#25D366] text-white shadow-sm scale-[1.02]" 
                : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            <span>2. WhatsApp</span>
          </button>

          <button 
            onClick={() => { setStep(2); setIsPlaying(false); }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
              step === 2 
                ? "bg-[#1dc3f7] text-white shadow-sm scale-[1.02]" 
                : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            <span>3. Reçu Wave</span>
          </button>
        </div>
      )}

      {/* Cadre de Téléphone Mobile (iPhone CSS) */}
      <div className="relative mx-auto w-[295px] h-[590px] bg-zinc-950 rounded-[3rem] p-3 shadow-2xl ring-1 ring-zinc-800/80 shadow-brand-dark/20">
        
        {/* Bordure interne / Écran */}
        <div className="relative w-full h-full bg-slate-100 rounded-[2.4rem] overflow-hidden flex flex-col select-none border border-zinc-800">
          
          {/* Dynamic Island / Encoche */}
          <div className="absolute top-2 inset-x-0 z-50 flex justify-center pointer-events-none">
            <div className="h-6 w-28 bg-black rounded-full flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Barres de progression Stories (12-15s en boucle) */}
          {!videoSrc && (
            <div className="absolute top-9 inset-x-4 z-40 flex gap-1.5">
              <div className="h-1 flex-1 bg-black/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-brand-blue rounded-full transition-all duration-300 ${
                    step === 0 ? "w-full animate-in" : step > 0 ? "w-full" : "w-0"
                  }`} 
                />
              </div>
              <div className="h-1 flex-1 bg-black/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-[#25D366] rounded-full transition-all duration-300 ${
                    step === 1 ? "w-full animate-in" : step > 1 ? "w-full" : "w-0"
                  }`} 
                />
              </div>
              <div className="h-1 flex-1 bg-black/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-[#1dc3f7] rounded-full transition-all duration-300 ${
                    step === 2 ? "w-full animate-in" : "w-0"
                  }`} 
                />
              </div>
            </div>
          )}

          {/* CONTENU : SOIT VIDÉO EXTERNE SOIT ANIMATION CSS */}
          {videoSrc ? (
            <div className="w-full h-full pt-8 flex items-center justify-center bg-black">
              <video 
                src={videoSrc} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div className="relative w-full h-full pt-12 flex flex-col overflow-hidden">

              {/* ======================================================== */}
              {/* ÉTAPE 1 : CRÉATION DE FACTURE (Saisie express & Calcul TVA) */}
              {/* ======================================================== */}
              <div className={`absolute inset-0 pt-12 px-3.5 pb-4 flex flex-col justify-between transition-all duration-700 ease-in-out ${
                step === 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-brand-blue flex items-center justify-center text-white text-[10px] font-black">
                        iF
                      </div>
                      <span className="text-[11px] font-bold text-zinc-800">Éditer Facture</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full">
                      #FAC-042
                    </span>
                  </div>

                  {/* Formulaire de création express */}
                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-zinc-200/80 space-y-2.5">
                    <div>
                      <span className="text-[9px] text-zinc-400 font-bold block mb-0.5">CLIENT</span>
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800">Amadou Diallo</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Dakar, SN</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-zinc-400 font-bold block mb-0.5">PRESTATION</span>
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5">
                        <p className="text-xs font-semibold text-zinc-800">Stratégie Commerciale</p>
                        <p className="text-[10px] text-zinc-500 font-mono">150 000 FCFA</p>
                      </div>
                    </div>

                    {/* Calcul TVA 18% automatique */}
                    <div className="border-t border-dashed border-zinc-200 pt-2 space-y-1 text-[10px]">
                      <div className="flex justify-between text-zinc-500">
                        <span>Sous-total HT</span>
                        <span className="font-mono">150 000 FCFA</span>
                      </div>
                      <div className="flex justify-between text-brand-blue font-semibold">
                        <span>TVA Automatique (18%)</span>
                        <span className="font-mono">+27 000 FCFA</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-900 font-bold pt-1 border-t border-zinc-100">
                        <span className="text-xs">Total TTC</span>
                        <span className="text-sm font-black text-brand-blue font-mono">177 000 FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton d'action avec simulation de clic */}
                <div className="space-y-1.5">
                  <div className="w-full bg-brand-blue text-white rounded-xl py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-blue/30 active:scale-95 transition-all">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Générer &amp; Envoyer</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <p className="text-[9px] text-center text-zinc-400 font-medium">
                    ⚡ Facture 100% conforme OHADA &amp; TVA
                  </p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* ÉTAPE 2 : ENVOI PAR WHATSAPP (Message client direct & lien) */}
              {/* ======================================================== */}
              <div className={`absolute inset-0 pt-12 px-3 pb-4 flex flex-col justify-between bg-[#efeae2] transition-all duration-700 ease-in-out ${
                step === 1 ? "opacity-100 translate-x-0" : step === 0 ? "opacity-0 translate-x-full pointer-events-none" : "opacity-0 -translate-x-full pointer-events-none"
              }`}>
                {/* Header WhatsApp */}
                <div>
                  <div className="bg-[#075e54] -mx-3 -mt-3 p-2.5 px-3 text-white flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-xs">
                        AD
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">Amadou Diallo</p>
                        <p className="text-[9px] text-emerald-200 leading-tight">en ligne</p>
                      </div>
                    </div>
                    <WhatsAppIcon className="w-4 h-4 text-emerald-300" />
                  </div>

                  {/* Date badge */}
                  <div className="flex justify-center my-2.5">
                    <span className="bg-white/80 text-[9px] font-semibold text-zinc-600 px-2 py-0.5 rounded-md shadow-2xs">
                      Aujourd'hui
                    </span>
                  </div>

                  {/* Bulle WhatsApp reçue avec le lien de paiement */}
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-zinc-200 max-w-[90%] space-y-2">
                    <p className="text-[11px] text-zinc-800 leading-relaxed">
                      Bonjour M. Diallo 👋<br />
                      Voici votre facture <strong>#FAC-042</strong> d'un montant de <strong>177 000 FCFA</strong>.
                    </p>

                    {/* Carte d'aperçu de paiement dans WhatsApp */}
                    <div className="bg-slate-50 border border-zinc-200 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-brand-blue text-white flex items-center justify-center text-[8px] font-bold">
                          iF
                        </div>
                        <span className="text-[10px] font-bold text-zinc-800">iziFacture • Paiement Sécurisé</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">Montant à régler :</span>
                        <span className="font-bold font-mono text-zinc-900">177 000 FCFA</span>
                      </div>
                      
                      {/* Bouton cliquable Wave dans le message */}
                      <div className="bg-[#1dc3f7] text-white rounded-lg py-1.5 px-2 flex items-center justify-center gap-1 font-bold text-[10px] shadow-xs">
                        <WaveIcon className="w-3.5 h-3.5" />
                        <span>Payer par Wave en 1 clic</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 text-[9px] text-zinc-400">
                      <span>12:45</span>
                      <CheckCheck className="w-3 h-3 text-sky-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 p-2 rounded-xl text-center shadow-xs">
                  <p className="text-[10px] font-bold text-zinc-700 flex items-center justify-center gap-1">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    Le client clique et valide sur son téléphone
                  </p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* ÉTAPE 3 : PAIEMENT WAVE REÇU (Notification & confirmation) */}
              {/* ======================================================== */}
              <div className={`absolute inset-0 pt-12 px-3.5 pb-4 flex flex-col justify-between bg-white transition-all duration-700 ease-in-out ${
                step === 2 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}>
                {/* Notification Push Wave instantanée */}
                <div>
                  <div className="bg-zinc-900 text-white rounded-2xl p-3 shadow-lg border border-zinc-800 mb-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-1.5">
                      <WaveIcon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1dc3f7]">Notification Wave</span>
                      <span className="text-[8px] text-zinc-400 ml-auto">À l'instant</span>
                    </div>
                    <p className="text-[11px] font-semibold text-white">
                      Vous avez reçu <strong className="text-[#1dc3f7] font-mono">177 000 FCFA</strong> de Amadou Diallo.
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Réf: #FAC-042 validée automatiquement</p>
                  </div>

                  {/* Facture marquée PAYÉE dans iziFacture */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center mt-2">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-500/20">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
                      Paiement Validé
                    </span>
                    <h3 className="text-base font-black text-zinc-900">177 000 FCFA</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Facture #FAC-042 soldée</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-slate-50 border border-zinc-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 text-[10px] font-medium">Solde actualisé :</span>
                    <span className="font-black text-emerald-600 font-mono">+177 000 FCFA</span>
                  </div>

                  <button 
                    onClick={() => setStep(0)}
                    className="w-full bg-zinc-900 text-white rounded-xl py-2 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-black transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revoir le parcours</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Barre Home en bas du téléphone */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-zinc-400 rounded-full z-50 pointer-events-none" />
        </div>
      </div>

      {/* Légende sous le téléphone */}
      <div className="text-center">
        <p className="text-xs font-semibold text-brand-dark flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
          <span>Parcours en 3 étapes : Création &rarr; WhatsApp &rarr; Wave reçu</span>
        </p>
        <p className="text-[11px] text-brand-muted mt-0.5">
          Durée : ~12 secondes • 100% automatisé
        </p>
      </div>

    </div>
  );
}
