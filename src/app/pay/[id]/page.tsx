"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Smartphone, 
  Building2, 
  Copy, 
  Check, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { formatFCFA } from "@/lib/utils";

// Mock public invoice dataset for payment page
const mockInvoices: Record<string, any> = {
  inv1: {
    number: "INV-2026-001",
    client: "Cansaas Agency",
    clientEmail: "contact@cansaas.com",
    merchant: "SeneSaaS SARL",
    merchantNinea: "00892341-2G3",
    amount: 2500000,
    dueDate: "15 Septembre 2026",
    status: "pending",
    items: [
      { description: "Développement Application Web SaaS", qty: 1, price: 2000000 },
      { description: "Maintenance & Hébergement annuel", qty: 1, price: 500000 },
    ],
  },
  inv2: {
    number: "INV-2026-002",
    client: "Africorp Solutions",
    clientEmail: "billing@africorp.sn",
    merchant: "SeneSaaS SARL",
    merchantNinea: "00892341-2G3",
    amount: 3200000,
    dueDate: "20 Septembre 2026",
    status: "pending",
    items: [
      { description: "Consulting & Audit Cybersécurité", qty: 1, price: 3200000 },
    ],
  },
};

export default function PublicPaymentPage() {
  const params = useParams();
  const id = (params?.id as string) || "inv1";
  const invoice = mockInvoices[id] || mockInvoices["inv1"];

  const [paymentMethod, setPaymentMethod] = useState<"wave" | "om" | "bank">("wave");
  const [isPaid, setIsPaid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setIsPaid(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#090d16] text-foreground p-4 md:p-10 flex flex-col items-center justify-center">
      {/* Top Header */}
      <div className="max-w-xl w-full flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            iF
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">iziFacture</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Paiement 100% Sécurisé
        </div>
      </div>

      {/* Main Payment Container */}
      <div className="max-w-xl w-full bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white text-center flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-primary-foreground/80">Règlement de Facture</span>
          <h2 className="text-3xl font-extrabold font-mono tracking-tight">{formatFCFA(invoice.amount)}</h2>
          <p className="text-xs text-primary-foreground/80">Facture N° {invoice.number} — Échéance : {invoice.dueDate}</p>
        </div>

        {isPaid ? (
          /* Successful Payment State */
          <div className="p-8 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Paiement Effectué avec Succès !</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Votre règlement de <strong>{formatFCFA(invoice.amount)}</strong> a bien été encaissé par <strong>{invoice.merchant}</strong>.
              </p>
            </div>

            <div className="w-full bg-accent/40 rounded-2xl p-4 border border-border text-xs flex flex-col gap-2 font-mono text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numéro de Reçu :</span>
                <span className="font-bold text-foreground">REC-2026-98412</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moyen de paiement :</span>
                <span className="font-bold text-primary uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut :</span>
                <span className="font-bold text-emerald-600">CONFIRMÉ</span>
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger le Reçu de Paiement PDF
            </button>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handlePayNow} className="p-6 md:p-8 flex flex-col gap-6">
            {/* Invoice Summary */}
            <div className="bg-muted/40 p-4 rounded-2xl border border-border flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Émetteur (Marchand) :</span>
                <span className="font-bold text-foreground">{invoice.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client :</span>
                <span className="font-bold text-foreground">{invoice.client}</span>
              </div>
            </div>

            {/* Choose Method */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                Sélectionnez votre moyen de paiement
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Wave Button */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wave")}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    paymentMethod === "wave" ? "border-[#1dc3f7] bg-[#1dc3f7]/10 ring-2 ring-[#1dc3f7]/30" : "border-border hover:bg-accent"
                  }`}
                >
                  <img src="/Wave.webp" alt="Wave" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-foreground">Wave</p>
                    <p className="text-[10px] text-muted-foreground">Scan QR / Instantané</p>
                  </div>
                </button>

                {/* Orange Money Button */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("om")}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    paymentMethod === "om" ? "border-[#ff6600] bg-[#ff6600]/10 ring-2 ring-[#ff6600]/30" : "border-border hover:bg-accent"
                  }`}
                >
                  <img src="/om.webp" alt="Orange Money" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-foreground">Orange Money</p>
                    <p className="text-[10px] text-muted-foreground">Pass / Validation USSD</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Phone Number Input */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Numéro de Téléphone {paymentMethod === "wave" ? "Wave" : "Orange Money"}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="+221 77 000 00 00"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={processing}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] ${
                paymentMethod === "wave" ? "bg-[#1dc3f7] hover:bg-[#00b2e3]" : "bg-[#ff6600] hover:bg-[#e05a00]"
              }`}
            >
              {processing ? (
                "Validation du paiement en cours..."
              ) : (
                <>
                  Payer {formatFCFA(invoice.amount)} par {paymentMethod === "wave" ? "Wave" : "Orange Money"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Propulsé par <strong className="text-foreground">iziFacture Senegal</strong> — Facturation & Paiements Sécurisés
      </p>
    </div>
  );
}
