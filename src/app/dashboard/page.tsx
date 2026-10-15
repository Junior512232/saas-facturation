"use client";

import Link from "next/link";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  Plus,
  AlertTriangle,
  Zap,
  Briefcase,
  UserCheck,
  MessageCircle,
  Package,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function DashboardPage() {
  const { invoicesList, clientsList } = useAppData();
  const { user } = useAuth();

  // --- Stats calculées à partir des vraies données ---
  const totalAmount = invoicesList.reduce((acc, inv) => acc + inv.amount, 0);
  const paidAmount = invoicesList
    .filter((i) => i.status === "paid")
    .reduce((acc, inv) => acc + inv.amount, 0);
  const pendingAmount = invoicesList
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((acc, inv) => acc + inv.amount, 0);
  const overdueCount = invoicesList.filter((i) => i.status === "overdue").length;
  const tauxRecouvrement =
    totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  // Top 4 clients par CA
  const topClients = [...clientsList]
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 4);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Upgrade Banner for Free Users */}
      {(user?.plan === "gratuit" || !user?.plan) && (
        <div className="bg-gradient-to-r from-brand-blue to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Passez à la vitesse supérieure !</h3>
              <p className="text-white/90 text-sm mt-1">
                Passez au forfait Pro (5 000 FCFA) pour débloquer 150 factures, tickets de caisse illimités, bulletins de paie et relances WhatsApp en 1 clic.
              </p>
            </div>
          </div>
          <Link href="/settings/billing" className="shrink-0 bg-white text-brand-blue font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-sm active:scale-[0.98]">
            Voir les offres (Dès 5 000 F)
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {user?.name?.split(" ")[0] || "là"} 👋
          </h2>
          <p className="text-muted-foreground">
            Voici le résumé de votre activité de facturation.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="xl:col-span-2">
          <StatCard
            title="Total des factures"
            value={String(invoicesList.length)}
            variation={{ value: String(clientsList.length) + " clients", isPositive: true }}
            icon={FileText}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
        </div>
        <div className="xl:col-span-2">
          <StatCard
            title="Chiffre d'affaires"
            value={formatFCFA(totalAmount)}
            variation={{ value: `${tauxRecouvrement}% recouvré`, isPositive: tauxRecouvrement >= 50 }}
            icon={CreditCard}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </div>
        <div className="xl:col-span-2">
          <StatCard
            title="Montant encaissé"
            value={formatFCFA(paidAmount)}
            variation={{ value: `${invoicesList.filter(i => i.status === "paid").length} payées`, isPositive: true }}
            icon={CheckCircle2}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
          />
        </div>
        <div className="xl:col-span-2">
          <StatCard
            title="En attente de paiement"
            value={formatFCFA(pendingAmount)}
            variation={{ value: `${invoicesList.filter(i => i.status === "sent").length} envoyées`, isPositive: false }}
            icon={Clock}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
          />
        </div>
        <div className="xl:col-span-2">
          <StatCard
            title="Clients actifs"
            value={String(clientsList.length)}
            variation={{ value: "portefeuille", isPositive: true }}
            icon={Users}
            iconBgColor="bg-teal-100 dark:bg-teal-900/30"
            iconColor="text-teal-600 dark:text-teal-400"
          />
        </div>
        <div className="xl:col-span-2">
          <StatCard
            title="Factures en retard"
            value={String(overdueCount)}
            variation={{ value: overdueCount > 0 ? "à relancer" : "Tout est à jour", isPositive: overdueCount === 0 }}
            icon={AlertTriangle}
            iconBgColor="bg-red-100 dark:bg-red-900/30"
            iconColor="text-red-600 dark:text-red-400"
          />
        </div>
      </div>

      {/* Modules de Gestion Rapide */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Modules Commerciaux & Opérations</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Nouveau
            </span>
          </h3>
          <Link href="/extensions" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
            <span>Tous les modules</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link
            href="/crm"
            className="p-4 rounded-2xl bg-card border border-border hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground group-hover:text-amber-500 transition-colors">
                Pipeline CRM
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Kanban prospects & opportunités
              </p>
            </div>
          </Link>

          <Link
            href="/relances"
            className="p-4 rounded-2xl bg-card border border-border hover:border-emerald-500/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground group-hover:text-emerald-500 transition-colors">
                Relances WhatsApp
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Lien Wave & impayés en 1 clic
              </p>
            </div>
          </Link>

          <Link
            href="/payroll"
            className="p-4 rounded-2xl bg-card border border-border hover:border-purple-500/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground group-hover:text-purple-500 transition-colors">
                Paie & RH
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Fiches de paie OHADA & IPRES
              </p>
            </div>
          </Link>

          <Link
            href="/sales"
            className="p-4 rounded-2xl bg-card border border-border hover:border-teal-500/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground group-hover:text-teal-500 transition-colors">
                Ventes & Caisse
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Terminal POS & reçus thermiques
              </p>
            </div>
          </Link>

          <Link
            href="/inventory"
            className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground group-hover:text-blue-500 transition-colors">
                Stocks & Inventaire
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Articles & alertes rupture
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Invoices */}
        <div className="xl:col-span-2">
          <RecentInvoices />
        </div>

        {/* Top Clients */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Top Clients</h3>
              </div>
              <Link
                href="/clients"
                className="text-xs font-medium text-primary hover:underline underline-offset-4"
              >
                Voir tout
              </Link>
            </div>

            {topClients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun client encore.{" "}
                  <Link href="/clients" className="text-primary font-medium hover:underline">
                    Ajouter un client
                  </Link>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {topClients.map((client, idx) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors group"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                      #{idx + 1}
                    </span>
                    <Avatar className="w-9 h-9 border border-border flex-shrink-0">
                      <AvatarFallback className={`${client.color} text-xs font-bold`}>
                        {client.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {client.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatFCFA(client.totalPaid)}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0"
                    >
                      {client.totalInvoices} fact.
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Barre de progression taux recouvrement */}
            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Taux de recouvrement
                </span>
                <span className="text-xs font-bold text-foreground">
                  {tauxRecouvrement}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${tauxRecouvrement}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
