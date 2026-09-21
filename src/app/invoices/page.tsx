"use client";

import { useAppData } from "@/context/AppDataContext";
import { statusStyles, statusLabels } from "@/lib/data";
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
import { FileText, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function InvoicesPage() {
  const { invoicesList, clientsList } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const filteredInvoices = invoicesList
    .filter((invoice) => 
      (statusFilter === "all" || invoice.status === statusFilter) &&
      (invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
       invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
       invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "amount") return b.amount - a.amount;
      const dateA = a.issueDate.split("/").reverse().join("");
      const dateB = b.issueDate.split("/").reverse().join("");
      return dateB.localeCompare(dateA);
    });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Factures</h2>
          <p className="text-muted-foreground">Gérez et suivez toutes vos factures émises.</p>
        </div>
        <Link href="/invoices/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une facture, un client..." 
            className="pl-9 w-full bg-background border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border bg-background hover:bg-muted hover:text-foreground h-10 px-4 rounded-xl text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filtres
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
              <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="all">Tous</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="paid">Payée</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="sent">Envoyée</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="draft">Brouillon</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="overdue">En retard</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <DropdownMenuLabel>Trier par</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="date">Date d'émission</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="amount">Montant (Décroissant)</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-border bg-muted/50">
              <TableHead className="pl-6 font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Numéro</TableHead>
              <TableHead className="font-semibold">Date d'émission</TableHead>
              <TableHead className="font-semibold">Échéance</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="text-right pr-6 font-semibold">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => {
                const client = clientsList.find(c => c.id === invoice.clientId);
                const color = client ? client.color : "bg-primary/10 text-primary";
                const initials = client ? client.initials : invoice.client.substring(0, 2).toUpperCase();

                return (
                  <TableRow key={invoice.id} className="hover:bg-accent/50 transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <Link href={`/invoices/${invoice.id}`} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarFallback className={`${color} font-semibold text-sm`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">{invoice.client}</span>
                          <span className="text-xs text-muted-foreground">{invoice.clientEmail}</span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/invoices/${invoice.id}`} className="font-mono text-muted-foreground text-sm group-hover:text-primary transition-colors">
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.issueDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.dueDate}</TableCell>
                    <TableCell>
                      <Badge className={`${statusStyles[invoice.status]} shadow-none`}>
                        {statusLabels[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-mono font-medium text-foreground">
                      {formatFCFA(invoice.amount)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p>Aucune facture trouvée.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filteredInvoices.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>Affichage de 1 à {filteredInvoices.length} sur {filteredInvoices.length} factures</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Précédent</Button>
              <Button variant="outline" size="sm" disabled>Suivant</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
