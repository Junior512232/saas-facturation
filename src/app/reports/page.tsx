"use client";

import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  CreditCard, 
  PieChart, 
  CheckCircle2 
} from "lucide-react";
import { formatFCFA } from "@/lib/utils";

// Mock data for monthly revenue
const monthlyData = [
  { month: "Jan", revenue: 4200000, invoices: 8 },
  { month: "Fév", revenue: 5800000, invoices: 11 },
  { month: "Mar", revenue: 7100000, invoices: 14 },
  { month: "Avr", revenue: 6300000, invoices: 12 },
  { month: "Mai", revenue: 8900000, invoices: 16 },
  { month: "Juin", revenue: 9500000, invoices: 18 },
  { month: "Juil", revenue: 11200000, invoices: 21 },
  { month: "Août", revenue: 10400000, invoices: 19 },
  { month: "Sept", revenue: 12450000, invoices: 23 },
];

const topClients = [
  { name: "Cansaas Agency", amount: 14200000, percentage: 40, color: "bg-primary" },
  { name: "Africorp Solutions", amount: 9800000, percentage: 28, color: "bg-sky-500" },
  { name: "SeneService SARL", amount: 6500000, percentage: 18, color: "bg-amber-500" },
  { name: "Sonatel Multimedia", amount: 4950000, percentage: 14, color: "bg-purple-500" },
];

const paymentDistribution = [
  { method: "Wave Mobile", amount: 16800000, percentage: 47, color: "#1dc3f7", icon: "/Wave.webp" },
  { method: "Orange Money", amount: 12400000, percentage: 35, color: "#ff6600", icon: "/om.webp" },
  { method: "Virement Bancaire", amount: 6250000, percentage: 18, color: "#3b82f6", icon: null },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("year");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [exported, setExported] = useState(false);

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full flex flex-col gap-8">
      {/* Toast Export Notification */}
      {exported && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Rapport financier exporté en PDF avec succès !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Rapports & Statistiques</h2>
          <p className="text-muted-foreground">Analysez la croissance de vos revenus par client et par moyen de paiement.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPeriod("month")}
              className={`px-3 py-1.5 rounded-lg transition-all ${period === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Mois
            </button>
            <button
              onClick={() => setPeriod("quarter")}
              className={`px-3 py-1.5 rounded-lg transition-all ${period === "quarter" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-3 py-1.5 rounded-lg transition-all ${period === "year" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Année 2026
            </button>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Chiffre d'affaires total</h3>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-foreground">{formatFCFA(35450000)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +18.4%
              </span>
              <span className="text-xs text-muted-foreground">vs année précédente</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Factures impayées</h3>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-foreground">{formatFCFA(3200000)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3 h-3 mr-1" /> -5.2%
              </span>
              <span className="text-xs text-muted-foreground">recouvrement en cours</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Encaissements Mobile Money</h3>
            <PieChart className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-foreground">82%</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Wave & OM
              </span>
              <span className="text-xs text-muted-foreground">des règlements clients</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Bar Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Évolution des revenus mensuels</h3>
            <p className="text-xs text-muted-foreground">Volume de chiffre d'affaires encaissé mois par mois en 2026.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-primary"></span>
              <span>Revenu mensualisé</span>
            </div>
          </div>
        </div>

        {/* Custom Responsive Interactive Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-10 px-2 border-b border-border relative">
          {monthlyData.map((d, index) => {
            const heightPercent = (d.revenue / maxRevenue) * 100;
            const isHovered = hoveredBar === index;

            return (
              <div
                key={d.month}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-foreground text-background text-[11px] font-mono px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap animate-in fade-in duration-150">
                    <p className="font-bold">{d.month} 2026 : {formatFCFA(d.revenue)}</p>
                    <p className="text-[10px] text-muted-foreground text-center">{d.invoices} factures</p>
                  </div>
                )}

                {/* Bar Element */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                    isHovered ? "bg-primary shadow-lg ring-2 ring-primary/30 scale-105" : "bg-primary/85 hover:bg-primary"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between px-2 text-xs font-semibold text-muted-foreground">
          {monthlyData.map((d) => (
            <span key={d.month} className="flex-1 text-center">{d.month}</span>
          ))}
        </div>
      </div>

      {/* Breakdown Grid: Top Clients & Payment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Clients Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Répartition par Client</h3>
              <p className="text-xs text-muted-foreground">Vos plus grands comptes contributeurs.</p>
            </div>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex flex-col gap-5">
            {topClients.map((client) => (
              <div key={client.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground">{client.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{formatFCFA(client.amount)}</span>
                    <span className="text-xs text-muted-foreground font-semibold">({client.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${client.percentage}%` }} 
                    className={`h-full rounded-full ${client.color} transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Modes de Paiement</h3>
              <p className="text-xs text-muted-foreground">Part des encaissements par canal.</p>
            </div>
            <CreditCard className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex flex-col gap-5">
            {paymentDistribution.map((item) => (
              <div key={item.method} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.icon ? (
                      <img src={item.icon} alt={item.method} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-primary" />
                    )}
                    <span className="font-bold text-foreground">{item.method}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{formatFCFA(item.amount)}</span>
                    <span className="text-xs text-muted-foreground font-semibold">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

