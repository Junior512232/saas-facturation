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
import { ArrowLeft, Download, Printer, Send, CreditCard } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { getInvoiceById, updateInvoiceStatus } = useAppData();
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const invoice = getInvoiceById(id);

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10">
        <h2 className="text-2xl font-bold mb-4">Facture introuvable</h2>
        <Link href="/invoices">
          <Button variant="outline">Retour aux factures</Button>
        </Link>
      </div>
    );
  }

  // Calculate totals
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleMarkPaid = () => {
    updateInvoiceStatus(id, "paid");
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const paymentLink = `${baseUrl}/pay/${id}`;
    
    const message = `Bonjour ${invoice.client},\n\nVoici votre facture ${invoice.number} d'un montant de ${formatFCFA(total)}.\n\nVous pouvez la consulter et la régler en toute sécurité via Wave ou Orange Money en cliquant sur le lien ci-dessous :\n\n${paymentLink}\n\nMerci de votre confiance !`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6 print:p-0 print:m-0 print:block">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Facture {invoice.number}</h2>
              <Badge className={`${statusStyles[invoice.status]} shadow-none`}>
                {statusLabels[invoice.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Créée le {invoice.issueDate}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2 bg-card">
            <Printer className="w-4 h-4" />
            Imprimer
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-card"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent hover:text-white"
            onClick={handleWhatsAppShare}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </Button>
          {invoice.status !== 'paid' && (
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={handleMarkPaid}>
              <CreditCard className="w-4 h-4" />
              Marquer payée
            </Button>
          )}
          <Button className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Envoyer
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div 
        className="print-area bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-8 sm:p-12 mt-4 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white"
      >
        
        {/* Invoice Top */}
        <div className="flex flex-col md:flex-row print:flex-row justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-red flex items-center justify-center text-white print:bg-brand-red">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 5h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7zm9 3a1 1 0 000 2h3a1 1 0 100-2h-3z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight flex items-center">
                  izi<span className="text-brand-red">Facture</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold -mt-1">Zone OHADA • UEMOA</span>
              </div>
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
              
              {invoice.dueDate && (
                <>
                  <span className="text-muted-foreground md:text-right print:text-right print:text-gray-600">Date d'échéance:</span>
                  <span className="font-semibold">{invoice.dueDate}</span>
                </>
              )}
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
          <div className="w-full md:w-1/2 print:w-1/2 flex flex-col justify-between">
            <div>
              {invoice.notes && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-muted-foreground mb-2 print:text-gray-500">Notes</p>
                  <p className="text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border/50 print:bg-gray-50 print:border-gray-200 print:text-black">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-auto">
              <div className="bg-white p-2 rounded-lg border border-border/50 shadow-sm print:border-gray-300">
                <QRCode value={typeof window !== 'undefined' ? `${window.location.origin}/pay/${id}` : `https://saas-facturation.vercel.app/pay/${id}`} size={70} />
              </div>
              <div className="text-xs text-muted-foreground print:text-gray-500 max-w-[200px]">
                Scannez ce code QR pour vérifier l'authenticité de cette facture ou la régler en ligne.
              </div>
            </div>
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
  );
}
