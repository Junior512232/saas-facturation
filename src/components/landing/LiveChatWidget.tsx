"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Phone, CheckCheck, Sparkles } from "lucide-react";

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "221774937349";
  const defaultMessage = "Bonjour Massal, je souhaite avoir une démonstration d'iziFlow ou des renseignements sur la facturation.";

  const quickQuestions = [
    "Je souhaite tester la démo iziFlow",
    "Comment fonctionne l'encaissement Wave ?",
    "Puis-je importer mes données Excel ?"
  ];

  const openWhatsApp = (customText?: string) => {
    const text = encodeURIComponent(customText || defaultMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      
      {/* ── CHAT POPUP WINDOW ── */}
      {isOpen && (
        <div className="mb-3 w-[320px] sm:w-[350px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#075E54] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                  MN
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Massal Ndiaye</p>
                <p className="text-[11px] text-emerald-200 leading-tight">Support iziFlow • En ligne</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-slate-900/60 space-y-3">
            
            {/* Incoming bubble */}
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-200 space-y-2">
              <p className="font-medium leading-relaxed">
                Bonjour 👋 Bienvenue sur <strong>iziFlow</strong> !
              </p>
              <p className="text-slate-300 leading-relaxed">
                Une question sur la facturation OHADA, la caisse comptoir ou la passerelle Wave ? Je vous réponds directement.
              </p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                <span>À l'instant</span>
                <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
              </div>
            </div>

            {/* Quick action chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions fréquentes :</p>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => openWhatsApp(q)}
                  className="w-full text-left text-xs bg-slate-950/70 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{q}</span>
                  <Send className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>

            {/* CTA WhatsApp Button */}
            <div className="pt-2">
              <button
                onClick={() => openWhatsApp()}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.947 2.801.947h.005c3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.768-5.778-5.768zm7.322 5.767c-.002 3.992-3.25 7.241-7.246 7.241-1.258 0-2.451-.334-3.51-.955l-4.103 1.076 1.096-4c-.694-1.111-1.077-2.399-1.079-3.722.002-3.992 3.25-7.241 7.246-7.241 3.995 0 7.244 3.248 7.246 7.241z"/>
                </svg>
                <span>Ouvrir la discussion WhatsApp</span>
              </button>
            </div>

            {/* Direct phone option */}
            <div className="text-center pt-1">
              <a
                href="tel:+221774937349"
                className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3 h-3 text-indigo-400" />
                <span>Assistance téléphonique : +221 77 493 73 49</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ── FLOATING TRIGGER BUTTON ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-2xl shadow-[#25D366]/40 transition-all hover:scale-105 active:scale-95 group"
        aria-label="Contacter le support WhatsApp"
      >
        {/* Pulsating badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950 text-[9px] font-black items-center justify-center text-white">
            1
          </span>
        </span>

        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.947 2.801.947h.005c3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.768-5.778-5.768zm7.322 5.767c-.002 3.992-3.25 7.241-7.246 7.241-1.258 0-2.451-.334-3.51-.955l-4.103 1.076 1.096-4c-.694-1.111-1.077-2.399-1.079-3.722.002-3.992 3.25-7.241 7.246-7.241 3.995 0 7.244 3.248 7.246 7.241z"/>
        </svg>

        <span className="hidden sm:inline">Besoin d'aide ? <strong>WhatsApp</strong></span>
      </button>

    </div>
  );
}
