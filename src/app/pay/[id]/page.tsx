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
  Printer,
  Copy,
  Check,
  Building2,
  Smartphone,
  ExternalLink,
  Send,
  Sparkles,
  Info
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
  confirmPublicInvoicePayment,
  declareDirectPayment
} from "@/app/actions/payment";
import { WaveLogo, OrangeMoneyLogo } from "@/components/ui/payment-logos";
import QRCode from "react-qr-code";

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

  // Direct Payments State
  const [selectedMethod, setSelectedMethod] = useState<"wave" | "om" | "bank" | "gateway">("wave");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [declareMethod, setDeclareMethod] = useState<"wave" | "orange_money" | "bank_transfer" | "cash">("wave");
  const [declareRef, setDeclareRef] = useState("");
  const [declarePhone, setDeclarePhone] = useState("");
  const [declareName, setDeclareName] = useState("");
  const [declareNotes, setDeclareNotes] = useState("");
  const [isDeclaring, setIsDeclaring] = useState(false);
  const [declareSuccessMessage, setDeclareSuccessMessage] = useState("");

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
        // Définir la méthode sélectionnée par défaut selon ce qui est disponible
        const pm = res.data.paymentMethods;
        if (pm?.wave?.enabled) {
          setSelectedMethod("wave");
        } else if (pm?.orangeMoney?.enabled) {
          setSelectedMethod("om");
        } else if (pm?.bankTransfer?.enabled) {
          setSelectedMethod("bank");
        } else if (pm?.hasBictorys) {
          setSelectedMethod("gateway");
        }
      } else {
        setError(res.error || "Facture introuvable.");
      }
      setLoading(false);
    };
    
    fetchInvoice();
  }, [id, router]);

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2500);
  };

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

  const pm = invoice.paymentMethods || {};
  const waveNumber = pm.wave?.number || invoice.merchant?.phone || "";
  const omNumber = pm.orangeMoney?.number || invoice.merchant?.phone || "";
  const omMerchantCode = pm.orangeMoney?.merchantCode || "";
  const bankName = pm.bankTransfer?.bankName || "";
  const bankAccountName = pm.bankTransfer?.accountName || invoice.merchant?.name || "";
  const bankRib = pm.bankTransfer?.rib || "";
  const instructions = pm.instructions || invoice.notes || "";
  const hasBictorys = pm.hasBictorys;

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
    const merchantPhone = invoice.merchant?.phone ? invoice.merchant.phone.replace(/[^0-9]/g, "") : "";
    const comp = invoice.merchant?.name || "Entreprise";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const invoiceLink = `${baseUrl}/pay/${invoice.id}`;

    const message = 
`Bonjour ${comp},
Je viens d'effectuer le paiement de la facture N° *${invoice.number}* d'un montant de *${formatFCFA(total)}*.

Client : *${invoice.client}*
Lien de la facture : ${invoiceLink}

Merci de bien vouloir accuser réception et marquer la facture comme acquittée.`;

    const whatsappUrl = merchantPhone 
      ? `https://wa.me/${merchantPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleOpenDeclareModal = (method: "wave" | "orange_money" | "bank_transfer" | "cash") => {
    setDeclareMethod(method);
    setDeclareName(invoice.client || "");
    setDeclarePhone(invoice.clientPhone || "");
    setShowDeclareModal(true);
  };

  const handleSubmitDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeclaring(true);
    try {
      const res = await declareDirectPayment({
        invoiceId: invoice.id,
        method: declareMethod,
        reference: declareRef,
        senderPhone: declarePhone,
        senderName: declareName,
        notes: declareNotes,
      });

      if (res.success) {
        setShowDeclareModal(false);
        setDeclareSuccessMessage(res.message || "Votre déclaration de paiement a bien été transmise à l'entreprise.");
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

  const hasPremiumFeatures = invoice.merchant?.plan === "pro" || invoice.merchant?.plan === "business";

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
                : `Vous avez une facture en attente de règlement d'un montant de ${formatFCFA(total)}.`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={handleDownloadPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
            {invoice.status !== 'paid' && (
              <Button 
                onClick={handleSendWhatsAppReceipt}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Vendeur</span>
              </Button>
            )}
          </div>
        </div>

        {/* Success declaration banner */}
        {declareSuccessMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-300 flex items-center gap-3 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{declareSuccessMessage}</p>
          </div>
        )}

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

        {/* BLOC DE PAIEMENT SÉNÉGAL (MOBILE MONEY & DIRECT) */}
        {invoice.status !== 'paid' && (
          <div className="bg-card rounded-2xl border-2 border-primary/20 shadow-lg p-6 sm:p-8 flex flex-col gap-6 print:hidden">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-emerald-500 flex items-center justify-center text-white shadow-md">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                    Comment souhaitez-vous régler ?
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Choisissez votre méthode préférée : Wave direct, Orange Money, Virement ou Carte.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right w-full sm:w-auto p-3 sm:p-0 bg-muted/40 sm:bg-transparent rounded-xl">
                <span className="text-xs text-muted-foreground block">Montant net à payer</span>
                <span className="text-2xl font-black font-mono text-primary">{formatFCFA(total)}</span>
              </div>
            </div>

            {/* Method Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Option Wave */}
              <button
                type="button"
                onClick={() => setSelectedMethod("wave")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  selectedMethod === "wave"
                    ? "bg-[#1dc3f7]/15 border-[#1dc3f7] text-[#007da3] dark:text-[#38bdf8] shadow-sm scale-[1.02]"
                    : "bg-background border-border hover:border-[#1dc3f7]/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <WaveLogo className="w-5 h-5 shrink-0" />
                <span>Wave</span>
              </button>

              {/* Option OM */}
              <button
                type="button"
                onClick={() => setSelectedMethod("om")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  selectedMethod === "om"
                    ? "bg-[#ff7900]/15 border-[#ff7900] text-[#ea580c] dark:text-[#fb923c] shadow-sm scale-[1.02]"
                    : "bg-background border-border hover:border-[#ff7900]/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <OrangeMoneyLogo className="w-5 h-5 shrink-0" />
                <span>Orange Money</span>
              </button>

              {/* Option Virement RIB */}
              <button
                type="button"
                onClick={() => setSelectedMethod("bank")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  selectedMethod === "bank"
                    ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm scale-[1.02]"
                    : "bg-background border-border hover:border-blue-500/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Virement RIB</span>
              </button>

              {/* Option Carte / Passerelle Bictorys */}
              <button
                type="button"
                onClick={() => setSelectedMethod("gateway")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  selectedMethod === "gateway"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                    : "bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Carte / Gateway</span>
              </button>
            </div>

            {/* CONTENU SELON LA MÉTHODE CHOISIE */}

            {/* 1. WAVE DIRECT */}
            {selectedMethod === "wave" && (
              <div className="p-6 rounded-2xl bg-[#1dc3f7]/5 border border-[#1dc3f7]/20 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <WaveLogo className="w-8 h-8 shrink-0" />
                    <div>
                      <h3 className="font-bold text-foreground text-base">Règlement direct par Wave</h3>
                      <p className="text-xs text-muted-foreground">
                        Effectuez un transfert simple de <strong>{formatFCFA(total)}</strong> sur le numéro ci-dessous.
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://pay.wave.com/send?phone=${waveNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1dc3f7] hover:bg-[#19b2e3] text-white font-bold text-xs shadow-sm transition-all shrink-0"
                  >
                    <span>Ouvrir l'application Wave</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border flex flex-col gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Numéro Wave du destinataire</span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black font-mono text-foreground tracking-wider">
                        {waveNumber || "+221 77 123 45 67"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(waveNumber || "+221771234567", "wave_phone")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                      >
                        {copiedItem === "wave_phone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedItem === "wave_phone" ? "Copié !" : "Copier"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border flex flex-col gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Motif / Référence à renseigner</span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold font-mono text-foreground">
                        {invoice.number}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(invoice.number, "wave_ref")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                      >
                        {copiedItem === "wave_ref" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedItem === "wave_ref" ? "Copié !" : "Copier"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Une fois votre transfert Wave validé, cliquez sur <strong>J'ai effectué mon transfert</strong> pour notifier le vendeur.
                  </p>
                  <Button
                    onClick={() => handleOpenDeclareModal("wave")}
                    className="w-full sm:w-auto bg-[#007da3] hover:bg-[#006a8a] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>J'ai effectué mon transfert Wave</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 2. ORANGE MONEY DIRECT */}
            {selectedMethod === "om" && (
              <div className="p-6 rounded-2xl bg-[#ff7900]/5 border border-[#ff7900]/20 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <OrangeMoneyLogo className="w-8 h-8 shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground text-base">Règlement direct Orange Money</h3>
                    <p className="text-xs text-muted-foreground">
                      Transférez <strong>{formatFCFA(total)}</strong> au numéro ou code marchand ci-dessous.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border flex flex-col gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Numéro Orange Money</span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black font-mono text-foreground tracking-wider">
                        {omNumber || "+221 77 890 12 34"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(omNumber || "+221778901234", "om_phone")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                      >
                        {copiedItem === "om_phone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedItem === "om_phone" ? "Copié !" : "Copier"}</span>
                      </button>
                    </div>
                  </div>

                  {omMerchantCode ? (
                    <div className="p-4 rounded-xl bg-card border border-border flex flex-col gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Code Marchand Orange Money</span>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black font-mono text-foreground">
                          {omMerchantCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(omMerchantCode, "om_code")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                        >
                          {copiedItem === "om_code" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedItem === "om_code" ? "Copié !" : "Copier"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-card border border-border flex flex-col gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Référence à mentionner</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold font-mono text-foreground">
                          {invoice.number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(invoice.number, "om_ref")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                        >
                          {copiedItem === "om_ref" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedItem === "om_ref" ? "Copié !" : "Copier"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Après validation sur votre téléphone, informez l'entreprise pour validation de la facture.
                  </p>
                  <Button
                    onClick={() => handleOpenDeclareModal("orange_money")}
                    className="w-full sm:w-auto bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>J'ai effectué mon transfert OM</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 3. VIREMENT BANCAIRE (RIB) */}
            {selectedMethod === "bank" && (
              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">Virement Bancaire (RIB Sénégal)</h3>
                    <p className="text-xs text-muted-foreground">
                      Effectuez votre virement vers le compte bancaire officiel de l'entreprise.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Banque</span>
                    <span className="text-sm font-bold text-foreground">{bankName || "Banque au Sénégal"}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Bénéficiaire / Titulaire</span>
                    <span className="text-sm font-bold text-foreground">{bankAccountName}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border flex flex-col gap-2 sm:col-span-2">
                    <span className="text-xs font-semibold text-muted-foreground">Relevé d'Identité Bancaire (RIB)</span>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-bold font-mono text-foreground break-all select-all">
                        {bankRib || "SN08 SN012 01234 56789012345 67"}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankRib || "SN08 SN012 01234 56789012345 67", "rib")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all shrink-0 ml-2"
                      >
                        {copiedItem === "rib" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedItem === "rib" ? "Copié !" : "Copier"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Précisez impérativement <strong>{invoice.number}</strong> en libellé de votre virement bancaire.
                  </p>
                  <Button
                    onClick={() => handleOpenDeclareModal("bank_transfer")}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>J'ai émis le virement</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 4. PASSERELLE AUTOMATISÉE BICTORYS */}
            {selectedMethod === "gateway" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-foreground text-base">Guichet Bictorys (Validation Automatique)</h3>
                      <p className="text-xs text-muted-foreground">
                        Payez par <strong>Carte Bancaire (Visa/Mastercard)</strong> ou Mobile Money avec validation instantanée.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Standard afro.tools ATSS
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Button
                    size="lg"
                    disabled={isProcessing}
                    onClick={() => handlePayment("hosted")}
                    className="w-full sm:w-auto flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Redirection sécurisée...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Payer {formatFCFA(total)} en ligne</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Instructions personnalisées de l'entreprise */}
            {instructions && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-3 text-xs text-muted-foreground">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">Consignes de l'entreprise :</strong> {instructions}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Facture Document (Style Officiel OHADA) */}
        <div className="print-area bg-card rounded-2xl border border-border shadow-md overflow-hidden p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white">
          
          {/* Invoice Top */}
          <div className="flex flex-col md:flex-row print:flex-row justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                {hasPremiumFeatures && invoice.merchant?.logo_url ? (
                  <img src={invoice.merchant.logo_url} alt="Logo de l'entreprise" className="h-12 w-auto object-contain print:h-12" />
                ) : hasPremiumFeatures && invoice.merchant?.name ? (
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
                <p className="font-semibold text-foreground print:text-black">{invoice.merchant?.name}</p>
                <p>Dakar, Sénégal</p>
                <p>{invoice.merchant?.email}</p>
                <p>{invoice.merchant?.phone}</p>
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

          {/* Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 p-6 rounded-2xl bg-muted/40 border border-border print:border-gray-200 print:bg-gray-50">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 print:text-gray-500">Facturé à</h3>
              <p className="font-bold text-foreground text-base print:text-black">{invoice.client}</p>
              {invoice.clientEmail && <p className="text-sm text-muted-foreground print:text-gray-600">{invoice.clientEmail}</p>}
              {invoice.clientPhone && <p className="text-sm text-muted-foreground print:text-gray-600">{invoice.clientPhone}</p>}
            </div>
            <div className="flex flex-col md:items-end print:items-end justify-center">
              <span className="text-xs text-muted-foreground print:text-gray-500">Date d'échéance</span>
              <p className="font-semibold text-foreground text-sm print:text-black">{invoice.dueDate || "À réception"}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-border rounded-2xl overflow-hidden mb-8 print:border-gray-300">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 print:bg-gray-100">
                  <TableHead className="font-bold">Description</TableHead>
                  <TableHead className="text-center font-bold">Quantité</TableHead>
                  <TableHead className="text-right font-bold">Prix Unitaire</TableHead>
                  <TableHead className="text-right font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoice.items || []).map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-center font-mono">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">{formatFCFA(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {formatFCFA(item.quantity * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals & Mentions de Règlement */}
          <div className="flex flex-col md:flex-row justify-between gap-8 pt-4">
            <div className="flex-1 max-w-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 print:text-gray-500">
                Coordonnées de règlement direct
              </h4>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground flex flex-col gap-1.5 print:bg-white print:border-gray-300">
                {waveNumber && <p><strong>Wave Direct :</strong> {waveNumber}</p>}
                {omNumber && <p><strong>Orange Money :</strong> {omNumber} {omMerchantCode ? `(Code Marchand : ${omMerchantCode})` : ""}</p>}
                {bankRib && <p><strong>RIB Bancaire ({bankName}) :</strong> {bankRib}</p>}
                {instructions && <p className="italic mt-1 text-[11px]">{instructions}</p>}
              </div>
            </div>

            <div className="w-full md:w-[350px]">
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center text-muted-foreground print:text-gray-600">
                  <span>Total HT</span>
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

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border text-center text-xs text-muted-foreground flex flex-col gap-1">
            <p className="font-medium text-foreground">{invoice.merchant?.name} - Solution de facturation conforme OHADA</p>
            <p>
              {invoice.merchant?.ninea ? `NINEA: ${invoice.merchant.ninea}` : ""} 
              {invoice.merchant?.ninea && invoice.merchant?.rccm ? " - " : ""}
              {invoice.merchant?.rccm ? `RCCM: ${invoice.merchant.rccm}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Déclaration Directe de Règlement */}
      <Dialog open={showDeclareModal} onOpenChange={setShowDeclareModal}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmitDeclaration} className="flex flex-col py-3 gap-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Déclarer votre règlement</h3>
                <p className="text-xs text-muted-foreground">Facture {invoice.number} • {formatFCFA(total)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Votre nom complet</label>
                <input
                  type="text"
                  required
                  value={declareName}
                  onChange={(e) => setDeclareName(e.target.value)}
                  placeholder="Ex: Moussa Diop"
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Votre numéro de téléphone émetteur</label>
                <input
                  type="tel"
                  required
                  value={declarePhone}
                  onChange={(e) => setDeclarePhone(e.target.value)}
                  placeholder="Ex: 77 123 45 67"
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  ID / Référence de transaction (reçu Wave, OM ou banque)
                </label>
                <input
                  type="text"
                  value={declareRef}
                  onChange={(e) => setDeclareRef(e.target.value)}
                  placeholder="Ex: W241028-XXXX ou ID du SMS de confirmation"
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">Commentaire / Consignes (Optionnel)</label>
                <textarea
                  rows={2}
                  value={declareNotes}
                  onChange={(e) => setDeclareNotes(e.target.value)}
                  placeholder="Ex: Paiement effectué ce matin à 10h via Wave."
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowDeclareModal(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isDeclaring} className="font-bold">
                {isDeclaring ? "Transmission..." : "Confirmer ma déclaration"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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

      {/* Sandbox Simulation Modal */}
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
