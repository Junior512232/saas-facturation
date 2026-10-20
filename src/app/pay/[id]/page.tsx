"use client";

import { statusStyles, statusLabels } from "@/lib/data";
import { formatFCFA } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  X,
  MessageCircle,
  Mail,
  Printer
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  initiateBictorysPayment, 
  getPublicInvoiceDetails, 
  confirmPublicInvoicePayment 
} from "@/app/actions/payment";
import { WaveLogo, OrangeMoneyLogo } from "@/components/ui/payment-logos";

export default function PublicInvoicePayPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [emailDelivered, setEmailDelivered] = useState(false);

  useEffect(() => {
    // Si l'identifiant correspond à un ticket de caisse POS, rediriger vers la vue ticket
    if (id && (id.startsWith("VTE-") || id.startsWith("TICKET-") || id.startsWith("sale_"))) {
      router.replace(`/pay/ticket/${id}`);
      return;
    }

    // Détection du retour Bictorys
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("type") === "ticket") {
        router.replace(`/pay/ticket/${id}`);
        return;
      }

      if (searchParams.get("success") === "true") {
        setIsSuccess(true);
        confirmPublicInvoicePayment({
          invoiceId: id,
          paymentReference: searchParams.get("ref") || undefined,
        }).then((res) => {
          if (res.success) {
            setInvoice((prev: any) => prev ? { ...prev, status: "paid" } : prev);
            if (res.emailSent) setEmailDelivered(true);
          }
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (searchParams.get("sandbox_pay") === "true") {
        setShowSandboxModal(true);
      } else if (searchParams.get("error") === "true") {
        setErrorMessage("Le paiement a été interrompu ou n'a pas pu être validé. Vous pouvez réessayer.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Fetch public invoice details
    const fetchInvoice = async () => {
      const res = await getPublicInvoiceDetails(id);
      if (res.success && res.data) {
        setInvoice(res.data);
      } else {
        setError(res.error || "Facture introuvable.");
      }
      setLoading(false);
    };
    
    fetchInvoice();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground text-sm font-medium">Chargement de la facture...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Facture introuvable</h2>
        <p className="text-muted-foreground max-w-md">{error || "Le lien de cette facture est invalide ou a expiré."}</p>
      </div>
    );
  }

  // Calculate totals
  const subtotal = invoice.subtotal || (invoice.items || []).reduce((acc: number, item: any) => acc + ((item?.quantity || 0) * (item?.unitPrice || 0)), 0);
  const taxAmount = invoice.taxAmount || (subtotal * (invoice?.taxRate || 0)) / 100;
  const total = invoice.amount || (subtotal + taxAmount);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handlePayment = async (paymentType?: "wave_money" | "orange_money" | "card" | "hosted") => {
    if (!invoice) return;
    setIsProcessing(true);
    setErrorMessage("");
    try {
      const res = await initiateBictorysPayment({
        invoiceId: invoice.id,
        amount: total,
        description: `Règlement facture ${invoice.number}`,
        customerName: invoice.client || "Client",
        customerEmail: invoice.clientEmail || undefined,
        customerPhone: invoice.clientPhone || undefined,
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
        setErrorMessage(res.error || "Erreur lors de l'initialisation du paiement Bictorys.");
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
      invoiceId: invoice.id,
      paymentReference: `SIM-BICT-${Date.now()}`,
      paymentMethod: methodName,
    });
    if (res.success) {
      setInvoice((prev: any) => ({ ...prev, status: "paid" }));
      if (res.emailSent) setEmailDelivered(true);
      setIsSuccess(true);
    }
    setIsProcessing(false);
  };

  const handleSendWhatsAppReceipt = () => {
    const phone = invoice.clientPhone ? invoice.clientPhone.replace(/[^0-9]/g, "") : "";
    const comp = invoice.merchant?.name || "iziFlow SARL";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://saas-facturation-ughf.vercel.app";
    const invoiceLink = `${baseUrl}/pay/${invoice.id}`;

    const message = 
`✅ *FACTURE ACQUITTÉE - REÇU DE PAIEMENT*
*${comp}*
---------------------------------------
*Facture N° :* ${invoice.number}
*Client :* ${invoice.client}
*Montant Réglé :* *${formatFCFA(total)}*
*Statut :* PAYÉ AVEC SUCCÈS via Bictorys ✅
---------------------------------------
Vous pouvez consulter et télécharger votre facture acquittée certifiée conforme en cliquant sur le lien ci-dessous :

${invoiceLink}

Merci de votre confiance et à très bientôt !`;

    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const hasPremiumFeatures = invoice.merchant.plan === "pro" || invoice.merchant.plan === "business";

  return (
    <div className="min-h-screen bg-secondary/30 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Top bar for Client */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-foreground">Bonjour {invoice.client},</h1>
            <p className="text-muted-foreground text-sm">
              {invoice.status === 'paid' 
                ? "Merci ! Cette facture a été réglée avec succès." 
                : `Vous avez une facture en attente de paiement d'un montant de ${formatFCFA(total)}.`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={handleDownloadPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
            {invoice.status !== 'paid' && (
              <Button 
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md min-w-[200px]"
                onClick={() => handlePayment("hosted")}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Redirection Bictorys...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Payer {formatFCFA(total)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive flex items-center justify-between gap-3 shadow-sm print:hidden">
            <div className="flex items-center gap-3 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setErrorMessage("")} className="h-8 px-2 text-destructive hover:bg-destructive/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Invoice Document */}
        <div className="print-area bg-card rounded-2xl border border-border shadow-md overflow-hidden p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white">
          
          {/* Invoice Top */}
          <div className="flex flex-col md:flex-row print:flex-row justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                {hasPremiumFeatures && invoice.merchant.logo_url ? (
                  <img src={invoice.merchant.logo_url} alt="Logo de l'entreprise" className="h-12 w-auto object-contain print:h-12" />
                ) : hasPremiumFeatures && invoice.merchant.name ? (
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold tracking-tight flex items-center text-foreground print:text-black">
                      {invoice.merchant.name}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-cyan-500 flex items-center justify-center text-white print:bg-brand-blue">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-extrabold tracking-tight flex items-center">
                        izi<span className="text-brand-blue">Flow</span>
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold -mt-1">Suite Commerciale • OHADA</span>
                    </div>
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex flex-col gap-1 print:text-gray-600 mt-2">
                <p className="font-semibold text-foreground print:text-black">{invoice.merchant.name}</p>
                <p>Dakar, Sénégal</p>
                <p>{invoice.merchant.email}</p>
                <p>{invoice.merchant.phone}</p>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end print:items-end">
              <h1 className="text-4xl font-black text-muted-foreground/30 uppercase tracking-widest mb-4 print:text-gray-200">Facture</h1>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground md:text-right print:text-right print:text-gray-600">Numéro:</span>
                <span className="font-semibold text-foreground print:text-black">{invoice.number}</span>
                
                <span className="text-muted-foreground md:text-right print:text-right print:text-gray-600">Date d'émission:</span>
                <span className="font-semibold text-foreground print:text-black">{invoice.issueDate}</span>
                
                <span className="text-muted-foreground md:text-right print:text-right print:text-gray-600">Statut:</span>
                <Badge className={`${statusStyles[invoice.status as keyof typeof statusStyles]} shadow-none w-max md:ml-auto`}>
                  {statusLabels[invoice.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-12 p-6 bg-muted/30 rounded-xl border border-border/50 print:bg-gray-50 print:border-gray-200">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 print:text-gray-500">Facturé à</p>
            <div className="text-foreground print:text-black">
              <p className="text-xl font-bold mb-1">{invoice.client}</p>
              {invoice.clientEmail && <p className="text-muted-foreground print:text-gray-600">{invoice.clientEmail}</p>}
              {invoice.clientPhone && <p className="text-muted-foreground print:text-gray-600 text-sm mt-0.5">{invoice.clientPhone}</p>}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <Table>
              <TableHeader className="bg-muted/50 rounded-t-xl print:bg-gray-100">
                <TableRow className="border-b-border hover:bg-transparent print:border-gray-200">
                  <TableHead className="font-semibold text-foreground print:text-black">Description</TableHead>
                  <TableHead className="text-center font-semibold text-foreground w-24 print:text-black">Qté</TableHead>
                  <TableHead className="text-right font-semibold text-foreground w-40 print:text-black">Prix unitaire</TableHead>
                  <TableHead className="text-right font-semibold text-foreground w-40 print:text-black">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item: any) => (
                  <TableRow key={item.id} className="border-b-border/50 hover:bg-transparent print:border-gray-200">
                    <TableCell className="py-4 font-medium print:text-black">{item.description}</TableCell>
                    <TableCell className="py-4 text-center print:text-gray-700">{item.quantity}</TableCell>
                    <TableCell className="py-4 text-right font-mono print:text-gray-700">{formatFCFA(item.unitPrice)}</TableCell>
                    <TableCell className="py-4 text-right font-mono font-semibold print:text-black">
                      {formatFCFA(item.quantity * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex flex-col md:flex-row print:flex-row justify-between items-start gap-8">
            <div className="w-full md:w-1/2 print:w-1/2">
              {invoice.notes && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2 print:text-gray-500">Notes</p>
                  <p className="text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border/50 print:bg-gray-50 print:border-gray-200 print:text-black">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-[350px] print:w-[350px]">
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center text-muted-foreground print:text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-mono text-foreground print:text-black">{formatFCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground print:text-gray-600">
                  <span>TVA ({invoice.taxRate}%)</span>
                  <span className="font-mono text-foreground print:text-black">{formatFCFA(taxAmount)}</span>
                </div>
                <div className="border-t border-border pt-3 mt-1 flex justify-between items-center print:border-gray-300">
                  <span className="text-lg font-bold print:text-black">Total TTC</span>
                  <span className="text-2xl font-black font-mono text-primary print:text-blue-600">{formatFCFA(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Online Payment Callout Block */}
          {invoice.status !== 'paid' && (
            <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/20 flex flex-col gap-6 print:hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-foreground text-base">Règlement en ligne sécurisé</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      Standard afro.tools ATSS
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                    Réglez instantanément avec <strong>Wave</strong>, <strong>Orange Money</strong>, <strong>Free Money</strong> ou <strong>Carte Bancaire</strong> via la passerelle certifiée <strong>Bictorys</strong>.
                  </p>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-xs text-muted-foreground">Total à régler</span>
                  <p className="text-xl font-black font-mono text-primary">{formatFCFA(total)}</p>
                </div>
              </div>

              {/* Direct Quick Payment Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handlePayment("wave_money")}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-[#1dc3f7]/10 hover:bg-[#1dc3f7]/20 border border-[#1dc3f7]/30 text-[#007da3] dark:text-[#38bdf8] font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <WaveLogo className="w-5 h-5 shrink-0" />
                  <span>Payer avec Wave</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePayment("orange_money")}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-[#ff7900]/10 hover:bg-[#ff7900]/20 border border-[#ff7900]/30 text-[#ea580c] dark:text-[#fb923c] font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <OrangeMoneyLogo className="w-5 h-5 shrink-0" />
                  <span>Payer avec OM</span>
                </button>

                <Button
                  size="lg"
                  className="h-auto py-3.5 px-4 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={() => handlePayment("hosted")}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connexion Bictorys...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Tous les modes / CB</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border text-center text-xs text-muted-foreground flex flex-col gap-1">
            <p className="font-medium text-foreground">{invoice.merchant.name} - Solution de facturation conforme OHADA</p>
            <p>
              {invoice.merchant.ninea ? `NINEA: ${invoice.merchant.ninea}` : ""} 
              {invoice.merchant.ninea && invoice.merchant.rccm ? " - " : ""}
              {invoice.merchant.rccm ? `RCCM: ${invoice.merchant.rccm}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Success Dialog when returning from Bictorys */}
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mb-2 animate-in zoom-in-75">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Paiement validé avec succès !</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              La facture <strong>{invoice.number}</strong> d'un montant de <strong>{formatFCFA(total)}</strong> a bien été enregistrée comme acquittée.
            </p>

            {emailDelivered && invoice.clientEmail && (
              <div className="w-full p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>Facture acquittée envoyée par email à <strong>{invoice.clientEmail}</strong></span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 w-full mt-2">
              <Button 
                onClick={handleSendWhatsAppReceipt} 
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold h-11"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Recevoir la facture sur WhatsApp
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                variant="outline"
                className="w-full flex items-center justify-center gap-2 font-semibold h-11"
              >
                <Download className="w-4 h-4" />
                Télécharger le reçu officiel (PDF)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sandbox Simulation Modal (when no production API key configured) */}
      <Dialog open={showSandboxModal} onOpenChange={setShowSandboxModal}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col py-4 gap-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Guichet de Paiement Bictorys</h3>
                <p className="text-[11px] text-muted-foreground">Mobile Money Wave, Orange Money & Carte Bancaire</p>
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl border border-border flex flex-col gap-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Règlement facture</span>
                <span className="font-bold text-foreground">{invoice.number}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
                <span className="text-foreground">Total à régler</span>
                <span className="text-primary text-base">{formatFCFA(total)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Sélectionnez votre moyen de paiement pour valider le règlement sécurisé :
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => handleSimulateSandboxPayment("Wave Mobile Money")}
                className="p-3.5 rounded-xl bg-card border border-border hover:border-emerald-500 flex flex-col items-center gap-2 transition-all hover:bg-emerald-50/20 active:scale-[0.98]"
              >
                <WaveLogo className="w-8 h-8" />
                <span className="text-xs font-bold text-foreground">Wave</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSimulateSandboxPayment("Orange Money")}
                className="p-3.5 rounded-xl bg-card border border-border hover:border-orange-500 flex flex-col items-center gap-2 transition-all hover:bg-orange-50/20 active:scale-[0.98]"
              >
                <OrangeMoneyLogo className="w-8 h-8" />
                <span className="text-xs font-bold text-foreground">Orange Money</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSimulateSandboxPayment("Carte Bancaire")}
                className="col-span-2 p-3 rounded-xl bg-card border border-border hover:border-indigo-500 flex items-center justify-center gap-2 transition-all hover:bg-indigo-50/20 active:scale-[0.98]"
              >
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-foreground">Régler par Carte Bancaire</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
