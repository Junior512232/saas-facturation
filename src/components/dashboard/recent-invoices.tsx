"use client";

import Link from "next/link";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatFCFA } from "@/lib/utils";
import { statusStyles, statusLabels, InvoiceStatus } from "@/lib/data";
import { useAppData } from "@/context/AppDataContext";
import { FileText } from "lucide-react";

export function RecentInvoices() {
  const { invoicesList } = useAppData();
  const recent = [...invoicesList].slice(0, 5);

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Dernières Factures</CardTitle>
          <Link href="/invoices" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Voir tout
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Aucune facture</p>
            <p className="text-xs text-muted-foreground mb-4">
              Créez votre première facture pour la voir apparaître ici.
            </p>
            <Link
              href="/invoices/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Créer une facture
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-border">
                <TableHead className="pl-6">Client</TableHead>
                <TableHead>Numéro</TableHead>
                <TableHead>Date d&apos;émission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right pr-6">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => window.location.href = `/invoices/${invoice.id}`}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {invoice.client.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {invoice.client}
                        </span>
                        <span className="text-xs text-muted-foreground">{invoice.clientEmail}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm">#{invoice.number}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{invoice.issueDate}</TableCell>
                  <TableCell>
                    <Badge className={`${statusStyles[invoice.status as InvoiceStatus]} shadow-none`}>
                      {statusLabels[invoice.status as InvoiceStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 font-mono font-medium text-foreground">
                    {formatFCFA(invoice.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
