"use client";

import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
}

/**
 * Logo officiel Wave avec le pingouin officiel et les couleurs officielles (#1DC3F2 / #00B2FE)
 */
export function WaveLogo({ className = "w-5 h-5", showText = false, textSize = "text-xs" }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle select-none shrink-0">
      <img
        src="/Wave.webp"
        alt="Logo Officiel Wave"
        className={`rounded-full object-cover shadow-sm inline-block ${className}`}
      />
      {showText && (
        <span className={`font-black tracking-tight text-[#1dc3f7] font-sans ${textSize}`}>
          Wave
        </span>
      )}
    </span>
  );
}

/**
 * Logo officiel Orange Money avec le visuel officiel (#FF7900)
 */
export function OrangeMoneyLogo({ className = "w-5 h-5", showText = false, textSize = "text-xs" }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle select-none shrink-0">
      <img
        src="/om.webp"
        alt="Logo Officiel Orange Money"
        className={`rounded-full object-cover shadow-sm inline-block ${className}`}
      />
      {showText && (
        <span className={`font-black tracking-tight text-[#ff7900] font-sans ${textSize}`}>
          Orange Money
        </span>
      )}
    </span>
  );
}

/**
 * Badge de mode de paiement avec logo officiel
 */
export function PaymentMethodBadge({ method = "cash" }: { method?: string }) {
  const m = (method || "cash").toLowerCase();
  
  if (m === "wave") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#1dc3f7]/15 text-[#0284c7] dark:text-[#38bdf8] border border-[#1dc3f7]/30 shadow-xs">
        <WaveLogo className="w-4 h-4" />
        <span>Wave</span>
      </span>
    );
  }

  if (m === "om" || m === "orange_money" || m === "orange-money") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#ff7900]/15 text-[#ea580c] dark:text-[#fb923c] border border-[#ff7900]/30 shadow-xs">
        <OrangeMoneyLogo className="w-4 h-4" />
        <span>Orange Money</span>
      </span>
    );
  }

  if (m === "cash" || m === "especes" || m === "espèces") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
        <span>💵</span>
        <span>Espèces</span>
      </span>
    );
  }

  if (m === "bank_transfer" || m === "bank" || m === "virement") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
        <span>🏦</span>
        <span>Virement</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground">
      {method.toUpperCase()}
    </span>
  );
}
