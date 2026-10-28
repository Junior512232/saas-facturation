"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatFCFA } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  ArrowRight, 
  AlertCircle, 
  MessageCircle, 
  ShieldCheck, 
  CreditCard,
  X,
  Receipt,
  Copy,
  Check,
  Banknote,
  Smartphone,
  ExternalLink,
  Send,
  Building2,
  Store
} from "lucide-react";
import { WaveLogo, OrangeMoneyLogo } from "@/components/ui/payment-logos";
import { 
  getPublicInvoiceDetails, 
  initiateBictorysPayment, 
  confirmPublicInvoicePayment,
  declareDirectPayment 
} from "@/app/actions/payment";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function PublicTicketPayPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSandboxModal, setShowSandboxModal] = useState(false);

  // Direct / Caisse Payment State
  const [selectedMethod, setSelectedMethod] = useState<"cash" | "wave" | "om" | "gateway">("cash");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [declareMethod, setDeclareMethod] = useState<"cash" | "wave" | "orange_money">("cash");
  const [declareRef, setDeclareRef] = useState("");
  const [declarePhone, setDeclarePhone] = useState("");
  const [declareName, setDeclareName] = useState("");
  const [declareNotes, setDeclareNotes] = useState("");
  const [isDeclaring, setIsDeclaring] = useState(false);
  const [declareSuccessMessage, setDeclareSuccessMessage] = useState("");

  useEffect(() => {
    // 1. Détection retour Bictorys avec succès
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("success") === "true") {
        setIsSuccess(true);
        confirmPublicInvoicePayment({
          invoiceId: id,
          paymentReference: searchParams.get("ref") || undefined,
        }).then((res) => {
          if (res.success) {
            setTicket((prev: any) => prev ? { ...prev, status: "paid" } : prev);
          }
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (searchParams.get("sandbox_pay") === "true") {
        setShowSandboxModal(true);
      } else if (searchParams.get("error") === "true") {
        setErrorMessage("Le paiement a été interrompu ou refusé. Vous pouvez réessayer.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // 2. Récupération des données du ticket
    const fetchTicket = async () => {
      const res = await getPublicInvoiceDetails(id);
      if (res.success && res.data) {
        setTicket(res.data);
        const pm = res.data.paymentMethods;
        if (pm?.hasBictorys !== false) {
          setSelectedMethod("gateway");
        } else if (pm?.wave?.enabled) {
          setSelectedMethod("wave");
        } else if (pm?.cash?.enabled) {
          setSelectedMethod("cash");
        }
      } else {
        // Essayer aussi de chercher dans le cache local (si même machine)
        try {
          const localSales = localStorage.getItem("iziflow_sales");
          if (localSales) {
            const parsed = JSON.parse(localSales);
            const found = parsed.find((s: any) => s.id === id || s.saleNumber === id);
            if (found) {
              setTicket({
                id: found.id,
                number: found.saleNumber,
                client: found.customerName || "Client de passage",
                clientPhone: "",
                clientEmail: "",
                issueDate: found.createdAt,
                amount: found.total,
                subtotal: found.subtotal,
                taxAmount: found.taxAmount,
                taxRate: 18,
                status: found.paymentMethod === "bictorys" ? "sent" : "paid",
                items: found.items.map((it: any) => ({
                  id: it.id,
                  description: it.name,
                  quantity: it.quantity,
                  unitPrice: it.unitPrice,
                })),
                merchant: {
                  name: "iziFlow SARL",
                  phone: "+221 77 493 73 49",
                  email: "contact@iziflow.sn",
                }
              });
              setLoading(false);
              return;
            }
          }
        } catch {}
        setError(res.error || "Ticket de caisse introuvable.");
      }
      setLoading(false);
    };

    fetchTicket();
  }, [id]);

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-300 text-sm font-medium">Chargement du ticket de caisse...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Ticket introuvable</h2>
        <p className="text-slate-400 max-w-md">{error || "Le lien de ce ticket de caisse est invalide ou a expiré."}</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handlePayment = async (paymentType?: "wave_money" | "orange_money" | "card" | "hosted") => {
    if (!ticket) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const res = await initiateBictorysPayment({
        invoiceId: ticket.id,
        amount: ticket.amount,
        description: `Ticket de caisse ${ticket.number}`,
        customerName: ticket.client || "Client de passage",
        customerPhone: ticket.clientPhone || undefined,
        customerEmail: ticket.clientEmail || undefined,
        paymentType,
      });

      if (res.success && res.paymentUrl) {
        if (res.simulated) {
          setShowSandboxModal(true);
          setIsProcessing(false);
        } else {
          window.location.href = res.paymentUrl;
        }
      } else {
        setErrorMessage(res.error || "Erreur d'initialisation du paiement Bictorys.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur inattendue est survenue.");
      setIsProcessing(false);
    }
  };

  const handleSimulateSandboxPayment = async (methodName: string = "Bictorys (Wave / OM)") => {
    setIsProcessing(true);
    setShowSandboxModal(false);
    const res = await confirmPublicInvoicePayment({
      invoiceId: ticket.id,
      paymentReference: `SIM-BICT-${Date.now()}`,
      paymentMethod: methodName,
    });
    if (res.success) {
      setTicket((prev: any) => ({ ...prev, status: "paid" }));
      setIsSuccess(true);
    }
    setIsProcessing(false);
  };

  const handleSendWhatsAppReceipt = () => {
    const phone = ticket.merchant?.phone ? ticket.merchant.phone.replace(/[^0-9]/g, "") : "";
    const comp = ticket.merchant?.name || "Caisse iziFlow";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://saas-facturation-ughf.vercel.app";
    const ticketUrl = `${baseUrl}/pay/ticket/${ticket.id || ticket.number}`;

    const message = 
`Bonjour ${comp},
Je consulte le ticket de caisse N° *${ticket.number}* d'un montant de *${formatFCFA(ticket.amount)}*.

Client : *${ticket.client}*
Lien du ticket : ${ticketUrl}

Pouvez-vous confirmer le bon enregistrement de ce règlement ? Merci !`;

    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleOpenDeclareModal = (method: "cash" | "wave" | "orange_money") => {
    setDeclareMethod(method);
    setDeclareName(ticket.client || "Client de passage");
    setDeclarePhone(ticket.clientPhone || "");
    setShowDeclareModal(true);
  };

  const handleSubmitDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeclaring(true);
    try {
      const res = await declareDirectPayment({
        invoiceId: ticket.id,
        method: declareMethod as any,
        reference: declareRef,
        senderPhone: declarePhone,
        senderName: declareName,
        notes: declareNotes,
      });

      if (res.success) {
        setShowDeclareModal(false);
        setDeclareSuccessMessage(res.message || "Règlement déclaré avec succès à la caisse.");
        setTimeout(() => setDeclareSuccessMessage(""), 6000);
      } else {
        setErrorMessage(res.error || "Erreur lors de la déclaration.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur de déclaration.");
    } finally {
      setIsDeclaring(false);
    }
  };

  const isPaid = ticket.status === "paid";
  const pm = ticket.paymentMethods || {};
  const waveNumber = pm.wave?.number || ticket.merchant?.phone || "";
  const omNumber = pm.orangeMoney?.number || ticket.merchant?.phone || "";
  const omMerchantCode = pm.orangeMoney?.merchantCode || "";

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center justify-start print:bg-white print:p-0">
      
      {/* Top Banner Navigation */}
      <div className="w-full max-w-[360px] mb-4 flex items-center justify-between text-xs text-slate-400 print:hidden">
        <div className="flex items-center justify-between w-full bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700">
          <div>
            <h1 className="text-sm font-bold text-white">Ticket N° {ticket.number}</h1>
            <p className="text-xs text-slate-300">
              {isPaid ? "✅ Ce ticket a été réglé avec succès." : `Montant à régler : ${formatFCFA(ticket.amount)}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 px-3 text-xs gap-1.5 bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              <Printer className="w-3.5 h-3.5" />
              Imprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {declareSuccessMessage && (
        <div className="w-full max-w-[360px] mb-3 p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 print:hidden animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{declareSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="w-full max-w-[360px] mb-3 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Realistic 80mm Physical Thermal Ticket Paper Roll */}
      <div className="w-full max-w-[360px] bg-[#fbfbfb] text-[#1c1c1e] rounded-xl shadow-2xl p-6 sm:p-7 border border-[#e5e5e5] relative overflow-hidden font-mono print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white">
        
        {/* Top Paper Cut Wave Decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 print:hidden" />

        {/* Ticket Header */}
        <div className="text-center pb-4 border-b border-dashed border-[#a1a1aa] flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm mb-2 shadow-xs">
            {ticket.merchant?.name?.slice(0, 2).toUpperCase() || "IF"}
          </div>
          <h2 className="text-base font-black tracking-tight text-black uppercase">
            {ticket.merchant?.name || "iziFlow SARL"}
          </h2>
          <p className="text-[11px] text-[#52525b] mt-0.5">Commerce Général & Vente Directe</p>
          <p className="text-[11px] text-[#52525b]">Tél : {ticket.merchant?.phone || "+221 77 493 73 49"}</p>
          <p className="text-[10px] text-[#71717a] mt-1 font-sans">Dakar, Sénégal • Certifié conforme</p>

          <div className="mt-3 w-full py-1.5 px-3 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-between text-[11px] font-bold">
            <span className="text-zinc-600">Ticket N° :</span>
            <span className="text-black font-black">{ticket.number}</span>
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-[#52525b] mt-1.5 px-1">
            <span>Date : {ticket.issueDate}</span>
            <span>Client : {ticket.client || "Client de passage"}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-4 border-b border-dashed border-[#a1a1aa] flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 pb-1 border-b border-zinc-200">
            <span>Désignation</span>
            <span>Montant</span>
          </div>
          {(ticket.items || []).map((it: any) => (
            <div key={it.id} className="flex justify-between items-start text-xs">
              <div className="flex flex-col pr-2">
                <span className="font-bold text-black leading-tight">{it.description}</span>
                <span className="text-[11px] text-[#71717a]">
                  {it.quantity} × {formatFCFA(it.unitPrice)}
                </span>
              </div>
              <span className="font-black text-black whitespace-nowrap">
                {formatFCFA(it.quantity * it.unitPrice)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className="py-4 border-b border-dashed border-[#a1a1aa] flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between text-[#52525b]">
            <span>Sous-total HT</span>
            <span>{formatFCFA(ticket.subtotal || ticket.amount)}</span>
          </div>
          <div className="flex justify-between text-[#52525b]">
            <span>TVA ({ticket.taxRate || 18}%)</span>
            <span>{formatFCFA(ticket.taxAmount || 0)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-black text-black pt-2 border-t border-zinc-200 mt-1">
            <span className="uppercase tracking-wider">TOTAL TTC</span>
            <span className="text-base text-black font-black">{formatFCFA(ticket.amount)}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="py-3 text-center border-b border-dashed border-[#a1a1aa]">
          {isPaid ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>RÉGLÉ AVEC SUCCÈS</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-300">
              <span>EN ATTENTE DE RÈGLEMENT</span>
            </div>
          )}
        </div>

        {/* Ticket Footer */}
        <div className="pt-4 text-center text-[10px] text-[#71717a] flex flex-col gap-1 font-sans">
          <p className="font-bold text-zinc-800">Merci de votre visite et à très bientôt !</p>
          <p>Conservez ce ticket comme justificatif d'achat.</p>
          <p className="text-[9px] text-zinc-400 mt-1">Émis par iziFlow Suite Commerciale • www.iziflow.sn</p>
        </div>
      </div>

      {/* SÉLECTEUR DE PAIEMENT DU TICKET : CAISSE OU BICTORYS */}
      {!isPaid && (
        <div className="w-full max-w-[360px] mt-6 bg-slate-800/95 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-2xl flex flex-col gap-4 text-white print:hidden">
          
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold">Règlement du ticket</h3>
            </div>
            <span className="text-xs font-mono font-black text-emerald-400">
              {formatFCFA(ticket.amount)}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Choisissez comment vous souhaitez régler ce ticket :
          </p>

          {/* Sélecteur de méthode (Bictorys mis en avant en premier + Wave, OM, Caisse) */}
          <div className="flex flex-col gap-2">
            {/* 1. BICTORYS EN LIGNE - EN TÊTE AVEC VALIDATION AUTOMATIQUE */}
            <button
              type="button"
              onClick={() => setSelectedMethod("gateway")}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs border transition-all ${
                selectedMethod === "gateway"
                  ? "bg-primary/20 border-primary text-primary shadow-md ring-1 ring-primary/40"
                  : "bg-slate-900/60 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-xs">Bictorys en ligne</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ⚡ 100% Automatique
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal block">
                    Wave • Orange Money • Free Money • Carte CB
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 text-primary" />
            </button>

            {/* Autres méthodes (Directes & Caisse) */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedMethod("wave")}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl font-bold text-[11px] border transition-all ${
                  selectedMethod === "wave"
                    ? "bg-[#1dc3f7]/20 border-[#1dc3f7] text-[#38bdf8] shadow-sm"
                    : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <WaveLogo className="w-4 h-4" />
                <span>Wave Direct</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("om")}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl font-bold text-[11px] border transition-all ${
                  selectedMethod === "om"
                    ? "bg-[#ff7900]/20 border-[#ff7900] text-[#fb923c] shadow-sm"
                    : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <OrangeMoneyLogo className="w-4 h-4" />
                <span>Orange M.</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("cash")}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl font-bold text-[11px] border transition-all ${
                  selectedMethod === "cash"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm"
                    : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Caisse</span>
              </button>
            </div>
          </div>

          {/* DÉTAIL SELON LE MODE CHOISI */}

          {/* 1. PASSERELLE BICTORYS (AUTOMATIQUE) */}
          {selectedMethod === "gateway" && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-primary/30 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Validation 100% Automatique</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Sans intervention du commerçant
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Payez en 1 clic : dès confirmation, votre ticket est validé instantanément par webhook et votre reçu officiel est généré.
              </p>

              {/* Raccourcis directs Mobile Money Bictorys */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePayment("wave_money")}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#1dc3f7] flex flex-col items-center gap-1 transition-all active:scale-95"
                >
                  <WaveLogo className="w-5 h-5" />
                  <span className="text-[10px] font-bold text-slate-200">Wave Auto</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePayment("orange_money")}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#ff7900] flex flex-col items-center gap-1 transition-all active:scale-95"
                >
                  <OrangeMoneyLogo className="w-5 h-5" />
                  <span className="text-[10px] font-bold text-slate-200">OM Auto</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePayment("card")}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 flex flex-col items-center gap-1 transition-all active:scale-95"
                >
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-200">Carte CB</span>
                </button>
              </div>

              {/* Bouton principal Bictorys Guichet hébergé */}
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={() => handlePayment("hosted")}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Redirection sécurisée Bictorys...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Payer {formatFCFA(ticket.amount)} en ligne</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* 2. WAVE DIRECT */}
          {selectedMethod === "wave" && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-[#1dc3f7]/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WaveLogo className="w-4 h-4" />
                  <span className="text-xs font-bold text-[#38bdf8]">Numéro Wave direct</span>
                </div>
                <a
                  href={`https://pay.wave.com/send?phone=${waveNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-[#38bdf8] hover:underline flex items-center gap-1"
                >
                  Ouvrir Wave <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-mono text-xs font-bold text-white">{waveNumber || "+221 77 123 45 67"}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(waveNumber || "+221771234567", "wave_t_phone")}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1"
                >
                  {copiedItem === "wave_t_phone" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedItem === "wave_t_phone" ? "Copié !" : "Copier"}</span>
                </button>
              </div>

              <Button
                size="sm"
                onClick={() => handleOpenDeclareModal("wave")}
                className="w-full h-9 bg-[#007da3] hover:bg-[#006a8a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>J'ai effectué mon transfert Wave</span>
              </Button>
            </div>
          )}

          {/* 3. ORANGE MONEY DIRECT */}
          {selectedMethod === "om" && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-[#ff7900]/30 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <OrangeMoneyLogo className="w-4 h-4" />
                <span className="text-xs font-bold text-[#fb923c]">Orange Money Caisse</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-mono text-xs font-bold text-white">
                  {omNumber || "+221 77 890 12 34"} {omMerchantCode ? `(Code : ${omMerchantCode})` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(omNumber || "+221778901234", "om_t_phone")}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1"
                >
                  {copiedItem === "om_t_phone" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedItem === "om_t_phone" ? "Copié !" : "Copier"}</span>
                </button>
              </div>

              <Button
                size="sm"
                onClick={() => handleOpenDeclareModal("orange_money")}
                className="w-full h-9 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>J'ai effectué mon transfert OM</span>
              </Button>
            </div>
          )}

          {/* 4. CAISSE / ESPÈCES */}
          {selectedMethod === "cash" && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Règlement au comptoir de caisse</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Remettez <strong>{formatFCFA(ticket.amount)}</strong> directement au caissier en présentant le ticket <strong>{ticket.number}</strong>.
              </p>
              <Button
                size="sm"
                onClick={() => handleOpenDeclareModal("cash")}
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmer mon règlement à la caisse</span>
              </Button>
            </div>
          )}

          {/* Bouton WhatsApp Caissier */}
          <button
            type="button"
            onClick={handleSendWhatsAppReceipt}
            className="w-full py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Envoyer un message au caissier sur WhatsApp</span>
          </button>
        </div>
      )}

      {/* Share / WhatsApp Actions (When paid) */}
      {isPaid && (
        <div className="w-full max-w-[360px] mt-6 flex flex-col gap-2 print:hidden">
          <Button
            onClick={handleSendWhatsAppReceipt}
            className="w-full h-11 font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Recevoir mon ticket sur WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="w-full h-11 font-bold bg-slate-800 text-white border-slate-700 hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Télécharger le reçu</span>
          </Button>
        </div>
      )}

      {/* Modal Déclaration de Paiement Ticket */}
      <Dialog open={showDeclareModal} onOpenChange={setShowDeclareModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 text-white border border-slate-700">
          <form onSubmit={handleSubmitDeclaration} className="flex flex-col py-3 gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Déclarer le règlement</h3>
                <p className="text-xs text-slate-400">Ticket {ticket.number} • {formatFCFA(ticket.amount)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Votre nom</label>
                <input
                  type="text"
                  required
                  value={declareName}
                  onChange={(e) => setDeclareName(e.target.value)}
                  placeholder="Ex: Fatou Diagne"
                  className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-950 text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Votre numéro de téléphone</label>
                <input
                  type="tel"
                  required
                  value={declarePhone}
                  onChange={(e) => setDeclarePhone(e.target.value)}
                  placeholder="Ex: 77 123 45 67"
                  className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-950 font-mono text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">
                  Référence de transaction ou remarque (Optionnel)
                </label>
                <input
                  type="text"
                  value={declareRef}
                  onChange={(e) => setDeclareRef(e.target.value)}
                  placeholder="Ex: Réf SMS Wave ou 'Payé en espèces au guichet'"
                  className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-950 font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setShowDeclareModal(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Annuler
              </Button>
              <Button type="submit" disabled={isDeclaring} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                {isDeclaring ? "Envoi..." : "Confirmer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="sm:max-w-md bg-slate-900 text-white border border-slate-800">
          <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Paiement validé avec succès !</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Votre ticket <strong>{ticket.number}</strong> d'un montant de <strong>{formatFCFA(ticket.amount)}</strong> a bien été acquitté.
            </p>
            <div className="flex flex-col gap-2 w-full mt-3">
              <Button onClick={handleSendWhatsAppReceipt} className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold gap-2">
                <MessageCircle className="w-4 h-4 fill-current" />
                Recevoir sur WhatsApp
              </Button>
              <Button onClick={handlePrint} variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800 font-bold gap-2">
                <Printer className="w-4 h-4" />
                Imprimer le ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sandbox Simulation Modal */}
      <Dialog open={showSandboxModal} onOpenChange={setShowSandboxModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 text-white border border-slate-700">
          <div className="flex flex-col py-4 gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <h3 className="text-sm font-bold">Paiement Sécurisé Bictorys</h3>
                <p className="text-[11px] text-slate-400">Guichet Mobile Money Wave & Orange Money</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Règlement ticket</span>
                <span className="font-bold text-white">{ticket.number}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-2">
                <span>Total à payer</span>
                <span className="text-emerald-400 text-base">{formatFCFA(ticket.amount)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Choisissez votre moyen de paiement pour valider l'encaissement :
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => handleSimulateSandboxPayment("Wave Mobile Money")}
                className="p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-emerald-500 flex flex-col items-center gap-2 transition-all hover:bg-slate-750 active:scale-[0.98]"
              >
                <WaveLogo className="w-8 h-8" />
                <span className="text-xs font-bold text-white">Wave</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSimulateSandboxPayment("Orange Money")}
                className="p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-orange-500 flex flex-col items-center gap-2 transition-all hover:bg-slate-750 active:scale-[0.98]"
              >
                <OrangeMoneyLogo className="w-8 h-8" />
                <span className="text-xs font-bold text-white">Orange Money</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSimulateSandboxPayment("Carte Bancaire")}
                className="col-span-2 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 flex items-center justify-center gap-2 transition-all hover:bg-slate-750 active:scale-[0.98]"
              >
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Régler par Carte Bancaire</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
