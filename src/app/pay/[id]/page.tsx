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
import { CreditCard, Download, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";

// Wave Brand Logo Component
function WaveLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img src="/Wave.webp" alt="Wave" className={`rounded-full object-cover ${className}`} />
  );
}

export default function PublicInvoicePayPage() {
  const params = useParams();
  const id = params.id as string;
  const { getInvoiceById, updateInvoiceStatus } = useAppData();
  
  const [isMounted, setIsMounted] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"wave" | "om" | "card">("wave");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const invoice = getInvoiceById(id);

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h2 className="text-2xl font-bold mb-4">Facture introuvable</h2>
        <p className="text-muted-foreground">Le lien de cette facture est invalide ou a expiré.</p>
      </div>
    );
  }

  // Calculate totals
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Simulate API call to aggregator
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      updateInvoiceStatus(id, "paid");
      setTimeout(() => {
        setPaymentModalOpen(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-secondary/30 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Top bar for Client */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-xl font-bold">Bonjour {invoice.client},</h1>
            <p className="text-muted-foreground text-sm">
              {invoice.status === 'paid' 
                ? "Merci ! Cette facture a été réglée." 
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
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={() => setPaymentModalOpen(true)}
              >
                Payer maintenant
              </Button>
            )}
          </div>
        </div>

        {/* Invoice Document */}
        <div className="print-area bg-card rounded-2xl border border-border shadow-md overflow-hidden p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white">
          
          {/* Invoice Top */}
          <div className="flex flex-col md:flex-row print:flex-row justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white print:bg-blue-600">
                  <div className="w-4 h-4 border-2 border-white rounded-sm" />
                </div>
                <span className="print:text-blue-600">iziFacture</span>
              </div>
              <div className="text-sm text-muted-foreground flex flex-col gap-1 print:text-gray-600">
                <p>123 Rue de la République</p>
                <p>Dakar, Sénégal</p>
                <p>contact@izifacture.com</p>
                <p>+221 77 000 00 00</p>
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
                <Badge className={`${statusStyles[invoice.status]} shadow-none w-max md:ml-auto`}>
                  {statusLabels[invoice.status]}
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
                {invoice.items.map((item) => (
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

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border text-center text-xs text-muted-foreground flex flex-col gap-1">
            <p>iziFacture SARL - Capital de 1.000.000 FCFA</p>
            <p>NINEA: 123456789 - RCCM: SN-DKR-2023-B-1234</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Procéder au paiement</DialogTitle>
            <DialogDescription>
              Choisissez votre méthode de paiement pour la facture {invoice.number}.
            </DialogDescription>
          </DialogHeader>
          
          {!isSuccess ? (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl border border-border/50 mb-2">
                <p className="text-sm text-muted-foreground mb-1">Montant à payer</p>
                <p className="text-3xl font-black font-mono text-foreground">{formatFCFA(total)}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'wave' ? 'border-[#1dc3f7] bg-[#1dc3f7]/5 shadow-sm' : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMethod('wave')}
                >
                  <WaveLogo className="w-10 h-10" />
                  <span className="font-semibold text-sm">Wave</span>
                </button>
                
                <button 
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'om' ? 'border-[#f27405] bg-[#f27405]/5 shadow-sm' : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMethod('om')}
                >
                  <div className="w-10 h-10 bg-[#000000] flex items-center justify-center rounded-xl">
                    <span className="text-[#f27405] font-black text-xl">O</span>
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap">Orange Money</span>
                </button>
                
                <button 
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'card' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMethod('card')}
                >
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl text-primary">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-sm">Carte Bancaire</span>
                </button>
              </div>
              
              <Button 
                className={`w-full h-12 text-lg font-semibold mt-2 text-white ${
                  selectedMethod === 'wave' ? 'bg-[#1dc3f7] hover:bg-[#008db9]' :
                  selectedMethod === 'om' ? 'bg-[#f27405] hover:bg-[#cc6000]' :
                  'bg-primary hover:bg-primary/90'
                }`}
                onClick={handleSimulatePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement en cours...
                  </div>
                ) : (
                  `Payer avec ${selectedMethod === 'wave' ? 'Wave' : selectedMethod === 'om' ? 'Orange Money' : 'Carte Bancaire'}`
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Paiement sécurisé par nos partenaires locaux.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">Paiement réussi !</h3>
              <p className="text-muted-foreground">La facture a bien été réglée. Merci de votre confiance.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
