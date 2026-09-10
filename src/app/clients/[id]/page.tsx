"use client";

import { useAppData } from "@/context/AppDataContext";
import { formatFCFA } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { statusStyles, statusLabels } from "@/lib/data";
import { ArrowLeft, Mail, Phone, MapPin, Building, FileText } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { use } from "react";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getClientById, getInvoicesByClientId } = useAppData();
  
  const client = getClientById(id);
  
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10">
        <h2 className="text-2xl font-bold mb-4">Client introuvable</h2>
        <Link href="/clients">
          <Button variant="outline">Retour aux clients</Button>
        </Link>
      </div>
    );
  }

  const clientInvoices = getInvoicesByClientId(id);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Header Actions */}
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Détail du Client</h2>
          <p className="text-muted-foreground">Consultez les informations et l'historique du client.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Client Infos */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4 border-2 border-background shadow-sm">
              <AvatarFallback className={`text-3xl font-bold ${client.color}`}>
                {client.initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold mb-1">{client.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">Client depuis {client.createdAt}</p>
            <div className="w-full flex justify-between px-4 py-2 bg-muted/50 rounded-xl mb-2 text-sm">
              <span className="text-muted-foreground">Chiffre d'affaires</span>
              <span className="font-semibold font-mono">{formatFCFA(client.totalPaid)}</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h4 className="font-semibold mb-4 uppercase text-xs tracking-wider text-muted-foreground">Contact & Info</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Email</span>
                  <a href={`mailto:${client.email}`} className="text-sm text-primary hover:underline">{client.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Téléphone</span>
                  <a href={`tel:${client.phone}`} className="text-sm text-foreground">{client.phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Adresse</span>
                  <span className="text-sm text-foreground">{client.address}</span>
                  <span className="text-sm text-foreground">{client.city}, {client.country}</span>
                </div>
              </div>
              {client.taxId && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">NINEA / RCCM</span>
                    <span className="text-sm text-foreground">{client.taxId}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Invoices */}
        <div className="md:col-span-2">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Historique des factures</h3>
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                {clientInvoices.length} {clientInvoices.length > 1 ? "factures" : "facture"}
              </Badge>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientInvoices.length > 0 ? (
                    clientInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-accent/50 group">
                        <TableCell>
                          <Link href={`/invoices/${invoice.id}`} className="font-mono text-muted-foreground group-hover:text-primary transition-colors">
                            {invoice.number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{invoice.issueDate}</TableCell>
                        <TableCell>
                          <Badge className={`${statusStyles[invoice.status]} shadow-none`}>
                            {statusLabels[invoice.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatFCFA(invoice.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        Aucune facture pour ce client.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
