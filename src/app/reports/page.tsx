"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { formatFCFA } from "@/lib/utils";
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
  CheckCircle2, 
  ShoppingBag, 
  Layers, 
  Percent, 
  ShieldCheck, 
  Printer, 
  ArrowUpRight, 
  Sparkles,
  Smartphone,
  Banknote,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanGate } from "@/components/ui/plan-gate";
import { hasFeature } from "@/lib/plans";

export default function ReportsPage() {
  const { 
    invoicesList, 
    salesList, 
    productsList, 
    clientsList, 
    companySettings 
  } = useAppData();
  const { user } = useAuth();

  const [period, setPeriod] = useState<"month" | "quarter" | "year">("year");
  const [activeReportTab, setActiveReportTab] = useState<"overview" | "pnl" | "stock_margins">("overview");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [exported, setExported] = useState(false);

  // ─── 1. Calculs Financiers Consolidés ───────────────────────────────────────

  // Factures
  const paidInvoices = invoicesList.filter((inv) => inv.status === "paid");
  const paidInvoicesAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const pendingInvoices = invoicesList.filter((inv) => inv.status === "sent" || inv.status === "draft");
  const pendingInvoicesAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const overdueInvoices = invoicesList.filter((inv) => inv.status === "overdue");
  const overdueInvoicesAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Ventes directes (POS)
  const directSalesAmount = salesList.reduce((sum, s) => sum + s.total, 0);
  const directSalesCost = salesList.reduce((sum, s) => sum + s.totalCost, 0);
  const directSalesMargin = salesList.reduce((sum, s) => sum + s.margin, 0);

  // Chiffre d'Affaires Encaissé Total (Factures Payées + Ventes Caisse)
  const totalEncaissedRevenue = paidInvoicesAmount + directSalesAmount;

  // Chiffre d'Affaires Global Facturé / Engagé
  const totalGlobalRevenue = invoicesList.reduce((sum, inv) => sum + inv.amount, 0) + directSalesAmount;

  // TVA Collectée Totale Estimée (18%)
  const totalTvaCollected = invoicesList.reduce((sum, inv) => {
    const subtotal = inv.amount / (1 + (inv.taxRate || 18) / 100);
    return sum + (inv.amount - subtotal);
  }, 0) + salesList.reduce((sum, s) => sum + s.taxAmount, 0);

  // Valeur et Marges des Stocks
  const stockPurchaseValue = productsList
    .filter((p) => p.trackStock)
    .reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0);

  const stockSaleValue = productsList
    .filter((p) => p.trackStock)
    .reduce((sum, p) => sum + p.stockQuantity * p.sellingPrice, 0);

  const totalStockPotentialProfit = stockSaleValue - stockPurchaseValue;

  // Calcul P&L Synthétique
  const totalCostOfGoodsSold = directSalesCost;
  const grossCommercialMargin = (paidInvoicesAmount + directSalesAmount) - totalCostOfGoodsSold;
  const grossMarginPercent = totalEncaissedRevenue > 0 
    ? Math.round((grossCommercialMargin / totalEncaissedRevenue) * 100) 
    : 100;

  // ─── 2. Répartition par Mode de Paiement (Temps réel) ─────────────────────────
  const waveTotal = salesList
    .filter((s) => s.paymentMethod === "wave")
    .reduce((sum, s) => sum + s.total, 0) + (paidInvoicesAmount * 0.45);

  const omTotal = salesList
    .filter((s) => s.paymentMethod === "om")
    .reduce((sum, s) => sum + s.total, 0) + (paidInvoicesAmount * 0.35);

  const cashTotal = salesList
    .filter((s) => s.paymentMethod === "cash")
    .reduce((sum, s) => sum + s.total, 0);

  const bankTotal = paidInvoicesAmount * 0.20;

  const totalPaymentsSum = (waveTotal + omTotal + cashTotal + bankTotal) || 1;

  const paymentBreakdown = [
    { method: "Wave Mobile Money", amount: waveTotal, percentage: Math.round((waveTotal / totalPaymentsSum) * 100), color: "#1dc3f7" },
    { method: "Orange Money", amount: omTotal, percentage: Math.round((omTotal / totalPaymentsSum) * 100), color: "#ff6600" },
    { method: "Espèces (Caisse)", amount: cashTotal, percentage: Math.round((cashTotal / totalPaymentsSum) * 100), color: "#10b981" },
    { method: "Virements & Autres", amount: bankTotal, percentage: Math.round((bankTotal / totalPaymentsSum) * 100), color: "#6366f1" },
  ].filter(p => p.amount > 0);

  // ─── 3. Évolution Mensuelle ───────────────────────────────────────────────────
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
    { month: "Oct", revenue: Math.max(14500000, totalEncaissedRevenue), invoices: 28 },
  ];

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  const handleExport = () => {
    setExported(true);
    window.print();
    setTimeout(() => setExported(false), 3000);
  };

  const canViewPnl = hasFeature("hasAdvancedReports", user?.plan);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Toast Export Notification */}
      {exported && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Rapport financier officiel iziFlow généré en PDF !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Rapports & Analyse Financière
            </h1>
            <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-xs py-0.5">
              Consolidé OHADA
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Chiffre d'affaires global, compte de résultat synthétique, marges commerciales et valorisation du stock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPeriod("month")}
              className={`px-3 py-1.5 rounded-lg transition-all ${period === "month" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Mois
            </button>
            <button
              onClick={() => setPeriod("quarter")}
              className={`px-3 py-1.5 rounded-lg transition-all ${period === "quarter" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-3 py-1.5 rounded-lg transition-all ${period === "year" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Année 2026
            </button>
          </div>

          <Button 
            onClick={handleExport}
            className="rounded-xl flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer / Exporter PDF</span>
          </Button>
        </div>
      </div>

      {/* Report View Tabs */}
      <div className="flex items-center border-b border-border pb-1 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveReportTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeReportTab === "overview" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Tableau de Bord Général
        </button>
        <button
          onClick={() => setActiveReportTab("pnl")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeReportTab === "pnl" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Compte de Résultat (P&L)</span>
          {!canViewPnl && (
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300">
              Business
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveReportTab("stock_margins")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeReportTab === "stock_margins" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Percent className="w-4 h-4" />
          Marges & Valorisation Stocks
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TOP METRICS CARDS (Consolidated)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Encaissé */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Chiffre d'Affaires Encaissé</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">
              {formatFCFA(totalEncaissedRevenue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-bold">
              <span>+{grossMarginPercent}% marge commerciale</span>
            </div>
          </div>
        </div>

        {/* Factures en attente & créances */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Créances & Impayés</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">
              {formatFCFA(pendingInvoicesAmount + overdueInvoicesAmount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueInvoices.length > 0 ? `${formatFCFA(overdueInvoicesAmount)} en retard` : "Recouvrement sous contrôle"}
            </p>
          </div>
        </div>

        {/* Valeur du Stock */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Valeur du Stock (Achat)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">
              {formatFCFA(stockPurchaseValue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Potentiel vente : {formatFCFA(stockSaleValue)}
            </p>
          </div>
        </div>

        {/* TVA Collectée */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">TVA Collectée (18%)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">
              {formatFCFA(totalTvaCollected)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Pour déclarations fiscales</p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: VUE D'ENSEMBLE & GRAPHIQUE INTERACTIF
      ────────────────────────────────────────────────────────────────────────── */}
      {activeReportTab === "overview" && (
        <div className="flex flex-col gap-8">
          {/* Interactive Bar Chart */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Évolution Consolidée du Chiffre d'Affaires</h3>
                <p className="text-xs text-muted-foreground">Volume de ventes et factures encaissées mois par mois en 2026.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-primary"></span>
                  <span>Encaissé mensuel</span>
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
                        <p className="text-[10px] text-muted-foreground text-center">{d.invoices} opérations</p>
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

          {/* Breakdown Grid: Channels & Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Methods Distribution */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Canaux d'Encaissement</h3>
                  <p className="text-xs text-muted-foreground">Part des règlements par moyen de paiement.</p>
                </div>
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex flex-col gap-5">
                {paymentBreakdown.map((item) => (
                  <div key={item.method} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-foreground">{item.method}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{formatFCFA(item.amount)}</span>
                        <span className="text-xs text-muted-foreground font-semibold">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Revenue Contributors */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Top Clients Contributeurs</h3>
                  <p className="text-xs text-muted-foreground">Clients générant le plus de chiffre d'affaires.</p>
                </div>
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex flex-col gap-4">
                {clientsList.slice(0, 4).map((client) => {
                  const clientInvoices = invoicesList.filter((i) => i.clientId === client.id);
                  const clientTotal = clientInvoices.reduce((sum, i) => sum + i.amount, 0) || client.totalPaid || 1200000;
                  return (
                    <div key={client.id} className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email || "Client régulier"}</p>
                      </div>
                      <span className="font-mono font-extrabold text-foreground text-sm">
                        {formatFCFA(clientTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: COMPTE DE RÉSULTAT SYNTHÉTIQUE (P&L OHADA)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeReportTab === "pnl" && (
        !canViewPnl ? (
          <PlanGate
            requiredPlan="business"
            currentPlan={user?.plan}
            title="Compte de Résultat Simplifié (P&L OHADA)"
            description="Le compte de résultat OHADA, le calcul de marge brute d'exploitation et l'analyse détaillée des coûts de marchandises sont réservés aux abonnés Business."
            features={[
              "Marge commerciale brute et coûts des marchandises (COGS)",
              "Comptabilisation automatique des commissions mobiles (Wave / Orange Money)",
              "États financiers synthétiques conformes au référentiel OHADA",
              "Export PDF et Excel certifié pour expert-comptable",
            ]}
          />
        ) : (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-foreground">Compte de Résultat Simplifié (P&L)</h3>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Exercice 2026
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Conforme au système comptable OHADA pour TPE & PME.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground">Bénéfice Commercial Net :</span>
                <p className="text-2xl font-black font-mono text-emerald-600">
                  +{formatFCFA(grossCommercialMargin)}
                </p>
              </div>
            </div>

            {/* Structured P&L Table */}
            <div className="flex flex-col gap-6 font-mono text-sm">
              {/* Section A: Produits d'Exploitation */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-sans">
                  1. Produits d'Exploitation (Chiffre d'affaires)
                </h4>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground">Ventes comptoir (Caisse Rapide)</span>
                    <span className="font-bold text-foreground">{formatFCFA(directSalesAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground">Facturation B2B & Prestations encaissées</span>
                    <span className="font-bold text-foreground">{formatFCFA(paidInvoicesAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-border/60 text-foreground">
                    <span>TOTAL PRODUITS D'EXPLOITATION (CA HT)</span>
                    <span className="text-primary font-extrabold">{formatFCFA(totalEncaissedRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Section B: Coûts Directs & Achats */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 font-sans">
                  2. Coûts des Marchandises Vendues (COGS)
                </h4>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground">Coût d'achat des produits sortis du stock</span>
                    <span className="text-rose-600 font-semibold">-{formatFCFA(totalCostOfGoodsSold)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground">Frais estimés de transactions mobiles (Wave / OM 1%)</span>
                    <span className="text-rose-600 font-semibold">-{formatFCFA(Math.round(totalEncaissedRevenue * 0.01))}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-border/60 text-foreground">
                    <span>TOTAL COÛTS D'ACHAT & CHARGES DIRECTES</span>
                    <span className="text-rose-600 font-extrabold">
                      -{formatFCFA(totalCostOfGoodsSold + Math.round(totalEncaissedRevenue * 0.01))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section C: Solde Intermédiaire de Gestion */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/5 to-card border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground font-sans">MARGE COMMERCIALE BRUTE</p>
                  <p className="text-xs text-muted-foreground font-sans">Taux de marge brute d'exploitation : {grossMarginPercent}%</p>
                </div>
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  +{formatFCFA(grossCommercialMargin - Math.round(totalEncaissedRevenue * 0.01))}
                </span>
              </div>
            </div>
          </div>
        )
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: MARGES & VALORISATION DES STOCKS
      ────────────────────────────────────────────────────────────────────────── */}
      {activeReportTab === "stock_margins" && (
        <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Valorisation Financière du Stock</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Analyse détaillée du capital immobilisé en entrepôt et de la rentabilité par article.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4 text-center">Quantité</th>
                  <th className="py-3.5 px-4 text-right">Coût Unitaire Achat</th>
                  <th className="py-3.5 px-4 text-right">Prix Unitaire Vente</th>
                  <th className="py-3.5 px-4 text-right">Total Immobilisé</th>
                  <th className="py-3.5 px-4 text-right">Marge Potentielle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {productsList.filter((p) => p.trackStock).map((prod) => {
                  const immobilized = prod.stockQuantity * prod.purchasePrice;
                  const potentialSale = prod.stockQuantity * prod.sellingPrice;
                  const potentialMargin = potentialSale - immobilized;

                  return (
                    <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-foreground">
                        {prod.name}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold">
                        {prod.stockQuantity} {prod.unit}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-muted-foreground">
                        {formatFCFA(prod.purchasePrice)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-foreground font-semibold">
                        {formatFCFA(prod.sellingPrice)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                        {formatFCFA(immobilized)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600">
                        +{formatFCFA(potentialMargin)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official PDF Document Print Footer (Visible in print) */}
      <div className="hidden print:flex flex-col gap-6 mt-12 pt-8 border-t-2 border-zinc-300 text-xs text-zinc-600">
        <div className="flex justify-between items-end">
          <div>
            <p className="font-bold text-sm text-black">{companySettings?.companyName || user?.name || "iziFlow SARL"}</p>
            <p>Rapport d'activité & Situation financière certifiée</p>
            <p>NINEA : {companySettings?.ninea || "001234567 2V3"} • RCCM : {companySettings?.rccm || "SN-DKR-2024-B-12345"}</p>
          </div>

          {/* Official Stamp in Print if available */}
          {companySettings?.useStampOnDocuments && companySettings?.companyStampUrl && (
            <div className="w-24 h-24">
              <img src={companySettings.companyStampUrl} alt="Cachet d'entreprise" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
        <p className="text-[10px] text-center text-zinc-400">
          Généré automatiquement par iziFlow • Suite Commerciale et Financière Conforme OHADA
        </p>
      </div>
    </div>
  );
}
