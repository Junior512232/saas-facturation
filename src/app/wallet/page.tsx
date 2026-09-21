"use client";

import { useState } from "react";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  CreditCard, 
  Send, 
  Plus, 
  CheckCircle2, 
  QrCode, 
  X, 
  Copy, 
  Check, 
  ArrowDownRight, 
  Building2,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import { formatFCFA } from "@/lib/utils";
import { useAppData } from "@/context/AppDataContext";

// Wave Brand Logo Component
function WaveLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-card flex items-center justify-center shadow-md flex-shrink-0 relative overflow-hidden border border-border/40 ${className}`}>
      <img 
        src="/Wave.webp" 
        alt="Wave" 
        className="w-full h-full object-cover rounded-xl"
      />
    </div>
  );
}

// Orange Money Brand Logo Component
function OrangeMoneyLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-card flex items-center justify-center shadow-md flex-shrink-0 relative overflow-hidden border border-border/40 ${className}`}>
      <img 
        src="/om.webp" 
        alt="Orange Money" 
        className="w-full h-full object-cover rounded-xl"
      />
    </div>
  );
}

// Realistic SVG QR Code Component
function QrCodeSVG({ value = "wave-om-pay" }: { value?: string }) {
  return (
    <div className="bg-card p-4 rounded-2xl shadow-md border border-border inline-block relative">
      <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer frame */}
        <rect x="5" y="5" width="30" height="30" rx="4" fill="black" />
        <rect x="9" y="9" width="22" height="22" rx="2" fill="white" />
        <rect x="13" y="13" width="14" height="14" rx="1" fill="black" />

        <rect x="65" y="5" width="30" height="30" rx="4" fill="black" />
        <rect x="69" y="9" width="22" height="22" rx="2" fill="white" />
        <rect x="73" y="13" width="14" height="14" rx="1" fill="black" />

        <rect x="5" y="65" width="30" height="30" rx="4" fill="black" />
        <rect x="9" y="69" width="22" height="22" rx="2" fill="white" />
        <rect x="13" y="73" width="14" height="14" rx="1" fill="black" />

        {/* Data points */}
        <rect x="42" y="6" width="6" height="6" fill="black" />
        <rect x="52" y="6" width="6" height="6" fill="black" />
        <rect x="42" y="18" width="6" height="12" fill="black" />
        <rect x="52" y="24" width="6" height="6" fill="black" />

        <rect x="6" y="42" width="6" height="6" fill="black" />
        <rect x="18" y="42" width="12" height="6" fill="black" />
        <rect x="6" y="52" width="6" height="6" fill="black" />
        <rect x="24" y="52" width="6" height="6" fill="black" />

        <rect x="42" y="42" width="16" height="16" fill="#1dc3f7" rx="2" />
        <circle cx="50" cy="50" r="5" fill="#ff6600" />

        <rect x="65" y="42" width="12" height="6" fill="black" />
        <rect x="83" y="42" width="12" height="6" fill="black" />
        <rect x="71" y="52" width="6" height="18" fill="black" />

        <rect x="42" y="65" width="6" height="12" fill="black" />
        <rect x="52" y="71" width="6" height="6" fill="black" />
        <rect x="42" y="83" width="18" height="6" fill="black" />
        <rect x="71" y="77" width="18" height="6" fill="black" />
        <rect x="83" y="89" width="12" height="6" fill="black" />
      </svg>
    </div>
  );
}

export default function WalletPage() {
  const { transactionsList } = useAppData();
  
  // Real balance from transactions
  const totalIncome = transactionsList.reduce((acc, tx) => acc + (tx.status === 'completed' ? tx.amount : 0), 0);
  
  // Mock withdrawals state to keep the UI interactive
  const [mockWithdrawals, setMockWithdrawals] = useState(0);
  const balance = Math.max(0, totalIncome - mockWithdrawals);

  const [modalType, setModalType] = useState<"withdraw" | "recharge" | "bank" | "add_account" | "qr" | null>(null);
  const [copied, setCopied] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<"wave" | "orange-money" | "bank">("wave");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [accountPhone, setAccountPhone] = useState("");
  const [accountName, setAccountName] = useState("");

  const handleCopyIBAN = () => {
    navigator.clipboard.writeText("SN010 01234 00001234567 89");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amountInput);
    if (val > 0 && val <= balance) {
      setMockWithdrawals((prev) => prev + val);
      setSuccessMessage(`Retrait de ${formatFCFA(val)} via ${selectedProvider === 'wave' ? 'Wave' : selectedProvider === 'orange-money' ? 'Orange Money' : 'Virement'} effectué avec succès !`);
      setModalType(null);
      setAmountInput("");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amountInput);
    if (val > 0) {
      setMockWithdrawals((prev) => prev - val); // Negative withdrawal = recharge
      setSuccessMessage(`Rechargement de ${formatFCFA(val)} via ${selectedProvider === 'wave' ? 'Wave' : 'Orange Money'} effectué avec succès !`);
      setModalType(null);
      setAmountInput("");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountPhone || accountName) {
      setSuccessMessage(`Nouveau compte ${selectedProvider.toUpperCase()} (${accountPhone || accountName}) lié avec succès !`);
      setModalType(null);
      setAccountPhone("");
      setAccountName("");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Portefeuille</h2>
        <p className="text-muted-foreground">Gérez vos encaissements, vos retraits Wave & Orange Money et votre solde.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <WalletIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-primary-foreground/80">Solde disponible</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Opérationnel
              </div>
            </div>

            <div>
              <h3 className="text-4xl md:text-5xl font-bold font-mono tracking-tight">
                {formatFCFA(balance).replace('FCFA', '')} <span className="text-2xl text-primary-foreground/80">FCFA</span>
              </h3>
              <p className="text-primary-foreground/70 text-sm mt-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Compte marchand vérifié
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-center gap-3 shadow-sm">
          <button 
            onClick={() => setModalType("withdraw")}
            className="w-full flex items-center justify-center gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-xl font-semibold transition-all shadow-md active:scale-[0.98]"
          >
            <ArrowUpRight className="w-5 h-5" />
            Retirer des fonds
          </button>

          <button 
            onClick={() => setModalType("recharge")}
            className="w-full flex items-center justify-center gap-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Recharger le solde
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setModalType("bank")}
              className="flex items-center justify-center gap-1.5 border border-border hover:bg-accent px-3 py-2.5 rounded-xl font-semibold transition-all text-xs text-foreground"
            >
              <Send className="w-4 h-4 text-muted-foreground" />
              Virement
            </button>

            <button 
              onClick={() => setModalType("qr")}
              className="flex items-center justify-center gap-1.5 border border-[#1dc3f7]/40 bg-[#1dc3f7]/5 hover:bg-[#1dc3f7]/15 text-[#008db9] dark:text-[#38bdf8] px-3 py-2.5 rounded-xl font-semibold transition-all text-xs"
            >
              <QrCode className="w-4 h-4" />
              Code QR
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods / Mobile Money */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Comptes & Mobile Money liés</h3>
            <p className="text-xs text-muted-foreground">Vos comptes Wave, Orange Money et Banque pour encaissements et retraits.</p>
          </div>
          <button 
            onClick={() => setModalType("add_account")}
            className="flex items-center gap-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter un compte
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Wave Card */}
          <div className="rounded-2xl border border-[#1dc3f7]/30 bg-gradient-to-br from-[#1dc3f7]/10 via-[#1dc3f7]/5 to-transparent p-6 flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <WaveLogo className="w-12 h-12" />
                <div>
                  <h4 className="font-bold text-foreground">Wave Sénégal</h4>
                  <p className="text-xs text-muted-foreground font-mono">+221 77 *** 45 89</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1dc3f7]/20 text-[#008db9] dark:text-[#38bdf8] rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Par défaut
              </span>
            </div>
            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Retraits instantanés</span>
              <button 
                onClick={() => { setSelectedProvider("wave"); setModalType("withdraw"); }}
                className="font-bold text-[#008db9] dark:text-[#38bdf8] hover:underline"
              >
                Retirer
              </button>
            </div>
          </div>

          {/* Orange Money Card */}
          <div className="rounded-2xl border border-[#ff6600]/30 bg-gradient-to-br from-[#ff6600]/10 via-[#ff6600]/5 to-transparent p-6 flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <OrangeMoneyLogo className="w-12 h-12" />
                <div>
                  <h4 className="font-bold text-foreground">Orange Money</h4>
                  <p className="text-xs text-muted-foreground font-mono">+221 78 *** 12 34</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
                Connecté
              </span>
            </div>
            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Retraits instantanés</span>
              <button 
                onClick={() => { setSelectedProvider("orange-money"); setModalType("withdraw"); }}
                className="font-bold text-[#ff6600] dark:text-[#ff8533] hover:underline"
              >
                Retirer
              </button>
            </div>
          </div>

          {/* Bank Account */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-card rounded-xl shadow-sm flex items-center justify-center text-primary flex-shrink-0 border border-border">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Compte Bancaire</h4>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-[130px]">SN010 01234 000...</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
                RIB / IBAN
              </span>
            </div>
            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Virement 24-48h</span>
              <button 
                onClick={() => setModalType("bank")}
                className="font-bold text-primary hover:underline"
              >
                Détails RIB
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Quick Banner Section */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-accent/50 via-background to-accent/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center flex-shrink-0">
            <QrCode className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-lg">Paiement rapide par Code QR</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Scannez le QR Code marchand pour recevoir un paiement direct Wave ou Orange Money.</p>
          </div>
        </div>
        <button 
          onClick={() => setModalType("qr")}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all whitespace-nowrap"
        >
          Afficher le QR Code
        </button>
      </div>

      {/* MODAL SYSTEM */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold text-foreground">
                {modalType === "withdraw" && "Retirer des fonds"}
                {modalType === "recharge" && "Recharger le solde"}
                {modalType === "bank" && "Détails du Virement Bancaire"}
                {modalType === "add_account" && "Lier un nouveau compte"}
                {modalType === "qr" && "Code QR de Paiement Wave & Orange Money"}
              </h3>
              <button 
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WITHDRAW MODAL */}
            {modalType === "withdraw" && (
              <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Choisir le moyen de retrait</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProvider("wave")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                        selectedProvider === "wave" ? "border-[#1dc3f7] bg-[#1dc3f7]/10 ring-2 ring-[#1dc3f7]/20" : "border-border hover:bg-accent"
                      }`}
                    >
                      <WaveLogo className="w-9 h-9" />
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">Wave</p>
                        <p className="text-[11px] text-muted-foreground">Instantanné</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProvider("orange-money")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                        selectedProvider === "orange-money" ? "border-[#ff6600] bg-[#ff6600]/10 ring-2 ring-[#ff6600]/20" : "border-border hover:bg-accent"
                      }`}
                    >
                      <OrangeMoneyLogo className="w-9 h-9" />
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">Orange Money</p>
                        <p className="text-[11px] text-muted-foreground">Instantanné</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Montant à retirer (FCFA)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 50000"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background font-mono text-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Solde disponible : <span className="font-bold">{formatFCFA(balance)}</span></p>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-accent"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 shadow-sm"
                  >
                    Confirmer le retrait
                  </button>
                </div>
              </form>
            )}

            {/* RECHARGE MODAL */}
            {modalType === "recharge" && (
              <form onSubmit={handleRecharge} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Mode de rechargement</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProvider("wave")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                        selectedProvider === "wave" ? "border-[#1dc3f7] bg-[#1dc3f7]/10 ring-2 ring-[#1dc3f7]/20" : "border-border hover:bg-accent"
                      }`}
                    >
                      <WaveLogo className="w-9 h-9" />
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">Wave</p>
                        <p className="text-[11px] text-muted-foreground">Sans frais</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProvider("orange-money")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                        selectedProvider === "orange-money" ? "border-[#ff6600] bg-[#ff6600]/10 ring-2 ring-[#ff6600]/20" : "border-border hover:bg-accent"
                      }`}
                    >
                      <OrangeMoneyLogo className="w-9 h-9" />
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">Orange Money</p>
                        <p className="text-[11px] text-muted-foreground">Sans frais</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Montant à recharger (FCFA)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 100000"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background font-mono text-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-accent"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 shadow-sm"
                  >
                    Recharger maintenant
                  </button>
                </div>
              </form>
            )}

            {/* BANK MODAL */}
            {modalType === "bank" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Utilisez les coordonnées bancaires ci-dessous pour effectuer un virement bancaire sur votre portefeuille.</p>

                <div className="bg-accent/40 rounded-2xl p-4 border border-border flex flex-col gap-3 text-sm font-mono">
                  <div>
                    <span className="text-xs text-muted-foreground block font-sans">Banque :</span>
                    <span className="font-bold text-foreground font-sans">Banque Atlantique Sénégal</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-sans">Titulaire du compte :</span>
                    <span className="font-bold text-foreground font-sans">SeneSaaS SARL</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-sans">IBAN / Numéro de compte :</span>
                    <div className="flex items-center justify-between bg-background p-2.5 rounded-xl border border-border mt-1">
                      <span className="font-bold text-primary">SN010 01234 00001234567 89</span>
                      <button 
                        onClick={handleCopyIBAN}
                        className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setModalType(null)}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {/* ADD ACCOUNT MODAL */}
            {modalType === "add_account" && (
              <form onSubmit={handleAddAccount} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Type de compte à lier</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProvider("wave")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        selectedProvider === "wave" ? "border-[#1dc3f7] bg-[#1dc3f7]/10" : "border-border hover:bg-accent"
                      }`}
                    >
                      <WaveLogo className="w-8 h-8" />
                      <span className="text-xs font-bold">Wave</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProvider("orange-money")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        selectedProvider === "orange-money" ? "border-[#ff6600] bg-[#ff6600]/10" : "border-border hover:bg-accent"
                      }`}
                    >
                      <OrangeMoneyLogo className="w-8 h-8" />
                      <span className="text-xs font-bold">Orange Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProvider("bank")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        selectedProvider === "bank" ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                      }`}
                    >
                      <Building2 className="w-8 h-8 text-primary" />
                      <span className="text-xs font-bold">Banque</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    {selectedProvider === 'bank' ? "IBAN / Compte Bancaire" : "Numéro de Téléphone (Mobile Money)"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={selectedProvider === 'bank' ? "SN010..." : "+221 77 000 00 00"}
                    value={accountPhone}
                    onChange={(e) => setAccountPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Nom du titulaire</label>
                  <input
                    type="text"
                    required
                    placeholder="Nom complet"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-accent"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 shadow-sm"
                  >
                    Lier le compte
                  </button>
                </div>
              </form>
            )}

            {/* QR CODE MODAL */}
            {modalType === "qr" && (
              <div className="flex flex-col items-center text-center gap-4 py-2">
                <div className="flex items-center justify-center gap-4">
                  <WaveLogo className="w-10 h-10" />
                  <span className="text-muted-foreground font-bold">&</span>
                  <OrangeMoneyLogo className="w-10 h-10" />
                </div>

                <p className="text-xs text-muted-foreground max-w-xs">
                  Scannez ce QR Code avec l'application <strong>Wave</strong> ou <strong>Orange Money</strong> pour régler directement.
                </p>

                <QrCodeSVG />

                <div className="bg-muted px-4 py-2 rounded-xl text-xs font-mono font-bold text-foreground">
                  Marchand ID : SENE-SAAS-9842
                </div>

                <button
                  onClick={() => setModalType(null)}
                  className="mt-2 w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-xl text-sm hover:bg-secondary/80"
                >
                  Fermer
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}


