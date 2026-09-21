"use client";

import { useAppData } from "@/context/AppDataContext";
import { formatFCFA } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, Filter, MoreHorizontal, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateClientDialog } from "@/components/clients/create-client-dialog";
import Link from "next/link";
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

export default function ClientsPage() {
  const { clientsList } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const filteredClients = clientsList
    .filter((client) => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "revenue") return b.totalPaid - a.totalPaid;
      const dateA = a.createdAt.split("/").reverse().join("");
      const dateB = b.createdAt.split("/").reverse().join("");
      return dateB.localeCompare(dateA);
    });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clients</h2>
          <p className="text-muted-foreground">Gérez votre portefeuille client et suivez leur activité.</p>
        </div>
        <CreateClientDialog />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un client, un email..." 
            className="pl-9 w-full bg-background border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border bg-background hover:bg-muted hover:text-foreground h-10 px-4 rounded-xl text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Trier
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Trier par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <DropdownMenuRadioItem value="date">Plus récents</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="revenue">Chiffre d'affaires</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clients Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-border bg-muted/50">
              <TableHead className="pl-6 font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold text-center">Factures</TableHead>
              <TableHead className="text-right font-semibold">Chiffre d'affaires</TableHead>
              <TableHead className="text-right pr-6 font-semibold"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-accent/50 transition-colors group">
                  <TableCell className="pl-6 py-4">
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarFallback className={`font-semibold text-sm ${client.color}`}>
                          {client.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer">{client.name}</span>
                        <span className="text-xs text-muted-foreground">Client depuis {client.createdAt}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center bg-muted w-8 h-8 rounded-full text-sm font-medium text-foreground">
                      {client.totalInvoices}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-foreground">
                    {formatFCFA(client.totalPaid)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="w-12 h-12 mb-4 opacity-20" />
                    <p>Aucun client trouvé.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filteredClients.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>Affichage de 1 à {filteredClients.length} sur {filteredClients.length} clients</span>
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
