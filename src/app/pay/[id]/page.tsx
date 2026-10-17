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
import { CreditCard, Download, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { initiateBictorysPayment, getPublicInvoiceDetails } from "@/app/actions/payment";

// Wave Brand Logo Component
function WaveLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img src="/Wave.webp" alt="Wave" className={`rounded-full object-cover ${className}`} />
  );
}

// Orange Money Logo Component
function OrangeMoneyLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img src="/om.webp" alt="Orange Money" className={`rounded-full object-cover ${className}`} />
  );
}

export default function PublicInvoicePayPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Si l'utilisateur revient depuis la page de paiement Bictorys
    if (typeof window !== "undefined") {
      if (window.location.search.includes("success=true")) {
        setIsSuccess(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (window.location.search.includes("error=true")) {
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
  }, [id]);

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
  const subtotal = invoice.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleDownloadPDF = () => {
    window.print();
  };

  const handlePayment = async () => {
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
      });

      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        setErrorMessage(res.error || "Erreur lors de l'initialisation du paiement Bictorys.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur inattendue est survenue.");
      setIsProcessing(false);
    }
  };

  const hasPremiumFeatures = invoice.merchant.plan === "pro" || invoice.merchant.plan === "business";

  return (
    <div className="min-h-screen bg-secondary/30 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Top bar for Client */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-xl font-bold">Bonjour {invoice.client},</h1>
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
                onClick={handlePayment}
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
                <span className="font-semibold">{invoice.number}</span>
                
                <span className="text-muted-foreground md:text-right print:text-right print:text-gray-600">Date d'émission:</span>
                <span className="font-semibold">{invoice.issueDate}</span>
                
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
              <p className="text-muted-foreground print:text-gray-600">{invoice.clientEmail}</p>
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
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-foreground text-base">Règlement en ligne sécurisé</h3>
                </div>
                <p className="text-xs text-muted-foreground max-w-md">
                  Réglez instantanément avec <strong>Wave</strong>, <strong>Orange Money</strong>, <strong>Free Money</strong> ou <strong>Carte Bancaire</strong> via la passerelle certifiée <strong>Bictorys</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border shadow-xs">
                    <WaveLogo className="w-4 h-4" />
                    <span className="text-[11px] font-semibold text-foreground">Wave</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border shadow-xs">
                    <OrangeMoneyLogo className="w-4 h-4" />
                    <span className="text-[11px] font-semibold text-foreground">Orange Money</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border shadow-xs">
                    <span className="text-[10px] font-black text-rose-600 bg-rose-500/10 px-1 rounded">FM</span>
                    <span className="text-[11px] font-semibold text-foreground">Free Money</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border shadow-xs">
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">Carte Bancaire</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 shrink-0 min-w-[220px]"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Redirection Bictorys...</span>
                  </>
                ) : (
                  <>
                    <span>Payer la facture</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border text-center text-xs text-muted-foreground flex flex-col gap-1">
            {hasPremiumFeatures ? (
              <>
                <p>{invoice.merchant.name} - Solution de facturation conforme</p>
                <p>
                  {invoice.merchant.ninea ? `NINEA: ${invoice.merchant.ninea}` : ""} 
                  {invoice.merchant.ninea && invoice.merchant.rccm ? " - " : ""}
                  {invoice.merchant.rccm ? `RCCM: ${invoice.merchant.rccm}` : ""}
                </p>
              </>
            ) : (
              <>
                <p>iziFacture SARL - Capital de 1.000.000 FCFA</p>
                <p>NINEA: 123456789 - RCCM: SN-DKR-2023-B-1234</p>
              </>
            )}
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
              La facture <strong>{invoice.number}</strong> a bien été enregistrée comme réglée. Merci pour votre règlement !
            </p>
            <div className="flex items-center gap-3 w-full mt-2">
              <Button 
                onClick={handleDownloadPDF} 
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Download className="w-4 h-4" />
                Télécharger le reçu (PDF)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
