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
  Receipt
} from "lucide-react";
import { WaveLogo, OrangeMoneyLogo } from "@/components/ui/payment-logos";
import { getPublicInvoiceDetails, initiateBictorysPayment, confirmPublicInvoicePayment } from "@/app/actions/payment";
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
    const phone = ticket.clientPhone ? ticket.clientPhone.replace(/[^0-9]/g, "") : "";
    const comp = ticket.merchant?.name || "iziFlow POS";
    const itemsText = (ticket.items || []).map((it: any) => `• ${it.description} (x${it.quantity}) : ${formatFCFA(it.quantity * it.unitPrice)}`).join("\n");
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://saas-facturation-ughf.vercel.app";
    const ticketUrl = `${baseUrl}/pay/ticket/${ticket.id}`;

    const message = 
`🧾 *TICKET DE CAISSE ACQUITTÉ*
*${comp}*
---------------------------------------
*Ticket N° :* ${ticket.number}
*Date :* ${ticket.issueDate}
*Client :* ${ticket.client}
*Statut :* PAYÉ AVEC SUCCÈS ✅

*Articles :*
${itemsText}

---------------------------------------
*Sous-total HT :* ${formatFCFA(ticket.subtotal || ticket.amount)}
*TVA :* ${formatFCFA(ticket.taxAmount || 0)}
*TOTAL TTC RÉGLÉ :* *${formatFCFA(ticket.amount)}*
---------------------------------------
🔗 *Consulter votre ticket officiel en ligne :*
${ticketUrl}

Merci pour votre confiance et à très bientôt !`;

    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const isPaid = ticket.status === "paid";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black py-8 px-4 flex flex-col items-center justify-start text-foreground print:bg-white print:p-0">
      
      {/* Top Banner Alert (print:hidden) */}
      <div className="w-full max-w-md mb-6 print:hidden">
        {errorMessage && (
          <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center justify-between text-sm shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage("")} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 shadow-xl flex items-center justify-between gap-3">
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
          {ticket.items.map((it: any) => (
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
              <span>RÉGLÉ VIA WAVE / OM / CB</span>
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

      {/* Online Payment Callout Block (When unpaid) */}
      {!isPaid && (
        <div className="w-full max-w-[360px] mt-6 bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-2xl flex flex-col gap-4 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold">Régler ce ticket en ligne</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Réglez instantanément avec <strong>Wave</strong>, <strong>Orange Money</strong> ou <strong>Carte Bancaire</strong> via Bictorys.
          </p>

          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <WaveLogo className="w-4 h-4" />
              <span className="text-[11px] font-bold">Wave</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <OrangeMoneyLogo className="w-4 h-4" />
              <span className="text-[11px] font-bold">Orange M.</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-bold">Carte CB</span>
            </div>
          </div>
          {/* Actions de paiement direct & Bictorys */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePayment("wave_money")}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1dc3f7]/15 hover:bg-[#1dc3f7]/25 border border-[#1dc3f7]/30 text-[#38bdf8] font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <WaveLogo className="w-4 h-4 shrink-0" />
                <span>Payer Wave</span>
              </button>

              <button
                type="button"
                onClick={() => handlePayment("orange_money")}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#ff7900]/15 hover:bg-[#ff7900]/25 border border-[#ff7900]/30 text-[#fb923c] font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <OrangeMoneyLogo className="w-4 h-4 shrink-0" />
                <span>Payer OM</span>
              </button>
            </div>

            <Button
              onClick={() => handlePayment("hosted")}
              disabled={isProcessing}
              className="w-full h-11 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion Bictorys...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Tous les moyens / Carte ({formatFCFA(ticket.amount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
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

      {/* Success Dialog */}
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="sm:max-w-md bg-slate-900 text-white border border-slate-800">
          <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Paiement validé avec succès !</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Votre ticket <strong>{ticket.number}</strong> d'un montant de <strong>{formatFCFA(ticket.amount)}</strong> a bien été acquitté via Bictorys.
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

      {/* Sandbox Simulation Modal (when no production API key configured) */}
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
