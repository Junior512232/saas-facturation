"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  CheckCheck,
  Receipt,
  Sparkles
} from "lucide-react";

export function VideoDemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const steps = [
    {
      time: "0:00 - 0:15",
      title: "1. Saisie express de la facture",
      desc: "Sélection du client (Amadou Diallo), ajout de la prestation, et calcul automatique de la TVA à 18%."
    },
    {
      time: "0:15 - 0:30",
      title: "2. Cachet officiel & QR Code",
      desc: "Apposition automatique du tampon d'entreprise vectoriel certifié et du QR code fiscal OHADA."
    },
    {
      time: "0:30 - 0:45",
      title: "3. Envoi WhatsApp & Paiement Wave",
      desc: "Le client reçoit son reçu sur WhatsApp et valide le paiement direct Wave en 1 clic."
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="max-w-6xl mx-auto px-5 py-20 border-t border-slate-900">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-flex items-center gap-1.5">
          <Play className="w-3 h-3 fill-current" />
          <span>Démonstration Vidéo • 45 secondes</span>
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Voyez comment iziFlow fonctionne en temps réel
        </h2>
        <p className="text-sm md:text-base text-slate-400">
          De la saisie au paiement Wave reçu sur votre compte : découvrez le parcours automatisé.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        {/* Step progress pills on top of video container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {steps.map((s, idx) => {
            const isActive = currentStep === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  setIsPlaying(false);
                }}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isActive
                    ? "bg-indigo-600/20 border-indigo-500/60 shadow-lg shadow-indigo-600/10 scale-102"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-mono font-bold ${isActive ? "text-indigo-400" : "text-slate-500"}`}>
                    {s.time}
                  </span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Video Player Display Container */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl min-h-[360px] md:min-h-[420px] flex items-center justify-center p-6 md:p-10">
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Player controls overlay */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-300">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="hover:text-white flex items-center gap-1 font-semibold"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-indigo-400" /> : <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />}
              <span>{isPlaying ? "Pause" : "Lecture"}</span>
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => { setCurrentStep(0); setIsPlaying(true); }}
              className="hover:text-white text-slate-400"
              title="Recommencer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* STEP 0 ANIMATION: Formulaire de facture */}
          {currentStep === 0 && (
            <div className="w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                    iF
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Éditeur de Facture Certifiée</p>
                    <p className="text-[10px] text-slate-400">Réf : FAC-2026-0042</p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  Saisie Express
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Client</span>
                  <p className="font-bold text-white">Amadou Diallo</p>
                  <p className="text-[10px] text-slate-400">Dakar, Sénégal (+221 77...)</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Prestation</span>
                  <p className="font-bold text-white">Stratégie Commerciale</p>
                  <p className="text-[10px] text-slate-400 font-mono">150 000 FCFA HT</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Sous-total HT</span>
                  <span>150 000 FCFA</span>
                </div>
                <div className="flex justify-between text-indigo-300">
                  <span>TVA Automatique (18%)</span>
                  <span>+27 000 FCFA</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-indigo-500/20">
                  <span>Total TTC</span>
                  <span>177 000 FCFA</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 ANIMATION: Cachet et QR Code */}
          {currentStep === 1 && (
            <div className="w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <p className="text-xs font-bold text-white">Authentification &amp; Conformité OHADA</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Document Scellé
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-4 text-left shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-sm">NDIAYE AGENCY SARL</h4>
                    <p className="text-[10px] text-slate-500">NINEA : 001234567 • RCCM : SN-DKR-2026-B</p>
                  </div>
                  <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg p-1 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-white text-[8px] font-mono">
                      QR CODE
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-slate-300 flex justify-between items-center">
                  <div className="w-18 h-18 rounded-full border-2 border-dashed border-indigo-600/60 flex items-center justify-center text-[8px] font-black text-indigo-700 rotate-[-12deg] p-1 text-center">
                    CACHET OFFICIEL DIRECTION
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Signature Numérique</p>
                    <span className="font-serif italic text-lg text-slate-800">Moustapha N.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 ANIMATION: WhatsApp et Wave */}
          {currentStep === 2 && (
            <div className="w-full max-w-lg space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-[#075e54] p-3 rounded-2xl text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    AD
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Amadou Diallo</p>
                    <p className="text-[9px] text-emerald-200">Reçu sur WhatsApp</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-400/20 px-2 py-0.5 rounded-full font-bold">12:45</span>
              </div>

              <div className="bg-white rounded-2xl p-4 text-slate-900 space-y-2 text-left shadow-lg">
                <p className="text-xs leading-relaxed">
                  Bonjour M. Diallo 👋 Voici votre facture <strong>#FAC-2026-0042</strong> d'un montant de <strong>177 000 FCFA</strong>.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Montant à régler :</span>
                    <span className="font-black font-mono text-slate-900">177 000 FCFA</span>
                  </div>
                  <div className="py-2 px-3 bg-[#1dc3f7] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                    <span>Payer avec Wave en 1 clic</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                  <span>Paiement instantané validé</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom CTA within demo */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Automatisez votre facturation dès aujourd'hui sans carte bancaire.</span>
          </div>

          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Créer ma première facture gratuite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
