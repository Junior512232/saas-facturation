"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Search, Filter, CreditCard } from "lucide-react";
import { formatFCFA } from "@/lib/utils";
import { useAppData } from "@/context/AppDataContext";
import { Payment } from "@/lib/data";

type PaymentMethod = "all" | "wave" | "orange-money" | "bank" | string;

function MethodBadge({ method }: { method: string }) {
  const m = method.toLowerCase();
  if (m === "wave") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#1dc3f7]/15 text-[#008db9] dark:text-[#38bdf8] border border-[#1dc3f7]/30">
        <img src="/Wave.webp" alt="Wave" className="w-4 h-4 rounded-full object-cover" />
        Wave
      </span>
    );
  }
  if (m === "orange-money" || m === "om") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ff6600]/15 text-[#d95700] dark:text-[#ff8533] border border-[#ff6600]/30">
        <img src="/om.webp" alt="Orange Money" className="w-4 h-4 rounded-full object-cover" />
        Orange Money
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
      <CreditCard className="w-3.5 h-3.5" />
      Virement Bancaire
    </span>
  );
}

export default function TransactionsPage() {
  const { transactionsList } = useAppData();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactionsList.filter((tx) => {
    const m = tx.paymentMethod.toLowerCase();
    const matchesMethod = selectedMethod === "all" || m === selectedMethod || (selectedMethod === "orange-money" && m === "om");
    const matchesSearch = tx.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h2>
            <p className="text-muted-foreground">Historique de vos paiements encaissés via Wave, Orange Money et Virement.</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border text-sm">
          <button
            onClick={() => setSelectedMethod("all")}
            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedMethod === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            Toutes les transactions
          </button>
          <button
            onClick={() => setSelectedMethod("wave")}
            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              selectedMethod === "wave" ? "bg-[#1dc3f7] text-white" : "text-muted-foreground hover:bg-[#1dc3f7]/10 hover:text-[#008db9] dark:hover:text-[#38bdf8]"
            }`}
          >
            <img src="/Wave.webp" alt="Wave" className="w-3.5 h-3.5 rounded-full object-cover" />
            Wave Mobile
          </button>
          <button
            onClick={() => setSelectedMethod("orange-money")}
            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              selectedMethod === "orange-money" ? "bg-[#ff6600] text-white" : "text-muted-foreground hover:bg-[#ff6600]/10 hover:text-[#ff6600] dark:hover:text-[#ff8533]"
            }`}
          >
            <img src="/om.webp" alt="Orange Money" className="w-3.5 h-3.5 rounded-full object-cover" />
            Orange Money
          </button>
          <button
            onClick={() => setSelectedMethod("bank")}
            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedMethod === "bank" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            Virements Bancaires
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left pl-6 pr-3 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="text-left px-3 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Moyen de Paiement</th>
                <th className="text-left px-3 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-3 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="text-right pr-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-accent/40 transition-colors">
                    <td className="pl-6 pr-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Paiement Facture #{tx.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{tx.clientName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      <MethodBadge method={tx.paymentMethod} />
                    </td>
                    <td className="px-3 py-4 text-sm text-muted-foreground whitespace-nowrap">{tx.paymentDate}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'}`}>
                        {tx.status === 'completed' ? 'Terminé' : 'En attente'}
                      </span>
                    </td>
                    <td className="pr-6 py-4 text-right font-mono font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                      +{formatFCFA(tx.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                    Aucune transaction trouvée pour cette catégorie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

