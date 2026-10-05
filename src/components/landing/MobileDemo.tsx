"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, CreditCard } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export function MobileDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4000); // Change step every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-[280px] h-[580px] bg-white rounded-[2.5rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden ring-4 ring-zinc-100/50">
      {/* Phone Notch */}
      <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 rounded-b-xl w-32 mx-auto z-50"></div>
      
      {/* Screen Content Container */}
      <div className="relative w-full h-full bg-slate-50 flex flex-col pt-8">
        
        {/* Step 0: Dashboard */}
        <div className={`absolute inset-0 pt-8 px-4 transition-all duration-700 ease-in-out ${step === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">iF</div>
            <div className="w-8 h-8 rounded-full bg-zinc-200"></div>
          </div>
          <p className="text-xs text-brand-muted mb-1">Chiffre d'affaires</p>
          <h2 className="text-2xl font-black text-brand-dark mb-6">{formatFCFA(4500000)}</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-border/50 mb-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-blue/5 rounded-bl-full"></div>
            <h3 className="text-sm font-bold text-brand-dark mb-1">Facture #INV-001</h3>
            <p className="text-[10px] text-brand-muted mb-3">Société AgroTech SA</p>
            <div className="flex justify-between items-end">
              <span className="text-brand-blue font-bold text-sm">{formatFCFA(1711000)}</span>
              <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold">Payée</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-border/50 relative overflow-hidden">
            <h3 className="text-sm font-bold text-brand-dark mb-1">Facture #INV-002</h3>
            <p className="text-[10px] text-brand-muted mb-3">Cabinet Conseil RH</p>
            <div className="flex justify-between items-end">
              <span className="text-brand-dark font-bold text-sm">{formatFCFA(590000)}</span>
              <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-bold">En attente</span>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button className="bg-brand-dark text-white rounded-full p-3 shadow-lg flex items-center justify-center animate-bounce">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>

        {/* Step 1: Client Payment View */}
        <div className={`absolute inset-0 pt-8 px-4 bg-zinc-50 transition-all duration-700 ease-in-out ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-4 mx-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h2 className="text-center text-xs font-bold text-brand-muted mb-1">FACTURE #INV-002</h2>
            <p className="text-center text-2xl font-black text-brand-dark mb-6">{formatFCFA(590000)}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between border-b border-dashed border-zinc-200 pb-2">
                <span className="text-[10px] text-zinc-500">Service</span>
                <span className="text-[10px] font-bold text-zinc-800">Audit RH</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-zinc-200 pb-2">
                <span className="text-[10px] text-zinc-500">TVA (18%)</span>
                <span className="text-[10px] font-bold text-zinc-800">90 000 FCFA</span>
              </div>
            </div>

            <button className="w-full bg-[#1dc3f7] text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <span>Payer avec Wave</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full bg-zinc-900 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 mt-2">
              <CreditCard className="w-4 h-4" />
              <span>Carte bancaire</span>
            </button>
          </div>
        </div>

        {/* Step 2: Payment Success */}
        <div className={`absolute inset-0 pt-20 px-4 flex flex-col items-center bg-white transition-all duration-700 ease-in-out ${step === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-brand-dark mb-2 text-center">Paiement réussi !</h2>
          <p className="text-xs text-brand-muted text-center px-4 mb-8">
            La facture #INV-002 a été réglée avec succès. Le marchand a été notifié.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full text-center">
            <span className="text-[10px] text-brand-muted block mb-1">Montant payé</span>
            <span className="text-lg font-bold text-brand-dark">{formatFCFA(590000)}</span>
          </div>
        </div>

      </div>
      
      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-zinc-300 rounded-full z-50"></div>
    </div>
  );
}
