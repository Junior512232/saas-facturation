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

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        className="print-area bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-8 sm:p-12 mt-4"
      >
        
        {/* Invoice Top */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <div className="w-4 h-4 border-2 border-white rounded-sm" />
              </div>
              iziFacture
            </div>
            <div className="text-sm text-muted-foreground flex flex-col gap-1">
              <p>123 Rue de la République</p>
              <p>Dakar, Sénégal</p>
              <p>contact@izifacture.com</p>
              <p>+221 77 000 00 00</p>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end">
            <h1 className="text-4xl font-black text-muted-foreground/30 uppercase tracking-widest mb-4">Facture</h1>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <span className="text-muted-foreground md:text-right">Numéro:</span>
              <span className="font-semibold">{invoice.number}</span>
              
              <span className="text-muted-foreground md:text-right">Date d'émission:</span>
              <span className="font-semibold">{invoice.issueDate}</span>
              
              <span className="text-muted-foreground md:text-right">Date d'échéance:</span>
              <span className="font-semibold">{invoice.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-12 p-6 bg-muted/30 rounded-xl border border-border/50">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Facturé à</p>
          <div className="text-foreground">
            <p className="text-xl font-bold mb-1">{invoice.client}</p>
            <p className="text-muted-foreground">{invoice.clientEmail}</p>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <Table>
            <TableHeader className="bg-muted/50 rounded-t-xl">
              <TableRow className="border-b-border hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Description</TableHead>
                <TableHead className="text-center font-semibold text-foreground w-24">Qté</TableHead>
                <TableHead className="text-right font-semibold text-foreground w-40">Prix unitaire</TableHead>
                <TableHead className="text-right font-semibold text-foreground w-40">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id} className="border-b-border/50 hover:bg-transparent">
                  <TableCell className="py-4 font-medium">{item.description}</TableCell>
                  <TableCell className="py-4 text-center">{item.quantity}</TableCell>
                  <TableCell className="py-4 text-right font-mono">{formatFCFA(item.unitPrice)}</TableCell>
                  <TableCell className="py-4 text-right font-mono font-semibold">
                    {formatFCFA(item.quantity * item.unitPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="w-full md:w-1/2">
            {invoice.notes && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Notes</p>
                <p className="text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border/50">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-[350px]">
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Sous-total</span>
                <span className="font-mono text-foreground">{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>TVA ({invoice.taxRate}%)</span>
                <span className="font-mono text-foreground">{formatFCFA(taxAmount)}</span>
              </div>
              <div className="border-t border-border pt-3 mt-1 flex justify-between items-center">
                <span className="text-lg font-bold">Total TTC</span>
                <span className="text-2xl font-black font-mono text-primary">{formatFCFA(total)}</span>
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
