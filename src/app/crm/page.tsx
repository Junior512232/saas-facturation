"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  UserCheck, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  MessageCircle, 
  Filter, 
  Search, 
  Trash2, 
  FileText,
  X,
  Flame,
  Calendar
} from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { PlanGate } from "@/components/ui/plan-gate";
import { hasFeature } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Deal, DealStage } from "@/lib/data";

const STAGES: { id: DealStage; label: string; color: string; bgBadge: string }[] = [
  { id: "prospect", label: "1. Nouveaux Prospects", color: "border-sky-500", bgBadge: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { id: "contact", label: "2. Contact Pris", color: "border-indigo-500", bgBadge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { id: "proposal", label: "3. Devis Envoyé", color: "border-amber-500", bgBadge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { id: "negotiation", label: "4. Négociation", color: "border-purple-500", bgBadge: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { id: "won", label: "5. Gagné • Signé 🎉", color: "border-emerald-500", bgBadge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
];

export default function CrmPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { dealsList, addDeal, updateDealStage, deleteDeal, addClient, companySettings } = useAppData();

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [showNewDealModal, setShowNewDealModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newValue, setNewValue] = useState(1000000);
  const [newStage, setNewStage] = useState<DealStage>("prospect");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newDate, setNewDate] = useState("30/10/2026");
  const [newNotes, setNewNotes] = useState("");

  // KPIs
  const totalPipelineValue = dealsList.reduce((sum, d) => sum + (d.stage !== "lost" ? d.estimatedValue : 0), 0);
  const wonDealsValue = dealsList.filter((d) => d.stage === "won").reduce((sum, d) => sum + d.estimatedValue, 0);
  const activeDealsCount = dealsList.filter((d) => d.stage !== "won" && d.stage !== "lost").length;
  const wonDealsCount = dealsList.filter((d) => d.stage === "won").length;
  const conversionRate = dealsList.length > 0 ? Math.round((wonDealsCount / dealsList.length) * 100) : 0;

  const filteredDeals = dealsList.filter((d) => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || d.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    await addDeal({
      title: newTitle.trim(),
      companyName: newCompany.trim(),
      contactName: newContact.trim() || newCompany.trim(),
      phone: newPhone.trim() || "+221",
      email: newEmail.trim() || undefined,
      estimatedValue: Number(newValue),
      stage: newStage,
      priority: newPriority,
      expectedCloseDate: newDate,
      notes: newNotes.trim() || undefined,
    });

    setShowNewDealModal(false);
    setNewTitle("");
    setNewCompany("");
    setNewContact("");
    setNewPhone("");
    setNewEmail("");
    setNewNotes("");
  };

  const handleMoveStage = async (dealId: string, currentStage: DealStage, direction: "next" | "prev") => {
    const stageIds: DealStage[] = ["prospect", "contact", "proposal", "negotiation", "won"];
    const currentIndex = stageIds.indexOf(currentStage);
    if (direction === "next" && currentIndex < stageIds.length - 1) {
      await updateDealStage(dealId, stageIds[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      await updateDealStage(dealId, stageIds[currentIndex - 1]);
    }
  };

  const handleConvertWonDeal = async (deal: Deal) => {
    // Add client if not already added
    await addClient({
      name: deal.companyName,
      email: deal.email || `${deal.companyName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      phone: deal.phone,
      address: "Dakar, Sénégal",
      city: "Dakar",
      country: "Sénégal",
    });
    router.push("/invoices/new");
  };

  if (!hasFeature("hasCrm", user?.plan)) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <UserCheck className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              CRM & Pipeline Commercial
            </h1>
            <p className="text-xs text-muted-foreground">
              Suivi de prospects, opportunités de closing et intégration WhatsApp.
            </p>
          </div>
        </div>

        <PlanGate
          requiredPlan="business"
          currentPlan={user?.plan}
          title="Module CRM réservé au Forfait Business"
          description="Accélérez votre prospection commerciale avec le pipeline Kanban, le suivi de closing et la conversion directe en factures."
          features={[
            "Pipeline Kanban visuel (Prospects, Contact, Devis, Closing)",
            "Relances directes par WhatsApp en un clic",
            "Conversion automatique d'une signature en client et facture",
            "Suivi de la valeur totale du pipeline et taux de closing",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              CRM & Pipeline Commercial
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Vue Kanban
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Gérez vos opportunités, relancez vos prospects sur WhatsApp et convertissez vos signatures en factures.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowNewDealModal(true)}
            className="flex-1 sm:flex-none text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shadow-md shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Opportunité</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Valeur du Pipeline</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {totalPipelineValue.toLocaleString("fr-FR")} <span className="text-xs font-sans text-muted-foreground">FCFA</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {dealsList.length} opportunités suivies
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Affaires Gagnées (Ce mois)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {wonDealsValue.toLocaleString("fr-FR")} <span className="text-xs font-sans text-muted-foreground">FCFA</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {wonDealsCount} contrats signés
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>En Cours de Négociation</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {activeDealsCount} <span className="text-xs font-sans text-muted-foreground">deals actifs</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            À relancer cette semaine
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Taux de Conversion</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Prospect ➔ Client Facturé
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher prospect, entreprise..."
            className="pl-8 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Priorité :</span>
          {(["all", "high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                priorityFilter === p
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {p === "all" ? "Toutes" : p === "high" ? "🔥 Haute" : p === "medium" ? "Moyenne" : "Basse"}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((col) => {
          const colDeals = filteredDeals.filter((d) => d.stage === col.id);
          const colTotal = colDeals.reduce((sum, d) => sum + d.estimatedValue, 0);

          return (
            <div 
              key={col.id} 
              className="flex flex-col rounded-2xl bg-muted/30 border border-border/80 min-w-[270px] max-w-full overflow-hidden"
            >
              {/* Column Header */}
              <div className={`p-3 border-b border-border bg-card/80 flex items-center justify-between border-t-4 ${col.color}`}>
                <div>
                  <h3 className="font-bold text-xs text-foreground">{col.label}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {colTotal.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${col.bgBadge}`}>
                  {colDeals.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-2.5 space-y-3 flex-1 min-h-[350px]">
                {colDeals.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center text-muted-foreground/60 text-[11px] border border-dashed border-border/60 rounded-xl p-3">
                    <span>Aucun prospect ici</span>
                  </div>
                ) : (
                  colDeals.map((deal) => (
                    <div 
                      key={deal.id}
                      className="p-3.5 rounded-xl bg-card border border-border shadow-sm hover:border-amber-500/40 transition-all space-y-2.5 relative group"
                    >
                      {/* Priority & Delete */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          deal.priority === "high" 
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" 
                            : deal.priority === "medium"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-slate-500/10 text-slate-500"
                        }`}>
                          {deal.priority === "high" && "🔥 Forte"}
                          {deal.priority === "medium" && "Moyenne"}
                          {deal.priority === "low" && "Basse"}
                        </span>

                        <button
                          onClick={() => deleteDeal(deal.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-opacity p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Title & Company */}
                      <div>
                        <h4 className="font-bold text-xs text-foreground leading-snug line-clamp-2">
                          {deal.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-1">
                          <Building2 className="w-3 h-3 text-amber-500" />
                          <span className="truncate">{deal.companyName}</span>
                        </div>
                      </div>

                      {/* Value */}
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Valeur :</span>
                        <strong className="text-xs font-black font-mono text-amber-600 dark:text-amber-300">
                          {deal.estimatedValue.toLocaleString("fr-FR")} FCFA
                        </strong>
                      </div>

                      {/* Contact & WhatsApp */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                        <span className="truncate max-w-[120px] font-medium">{deal.contactName}</span>
                        {deal.phone && (
                          <a
                            href={`https://wa.me/${deal.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${deal.contactName}, je vous contacte depuis ${companySettings?.companyName || "iziFlow"} concernant votre projet : ${deal.title}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-500/10 px-2 py-0.5 rounded-full"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* If Won: Direct Invoice button */}
                      {deal.stage === "won" && (
                        <Button
                          size="sm"
                          onClick={() => handleConvertWonDeal(deal)}
                          className="w-full h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 mt-1 shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Générer Facture Client</span>
                        </Button>
                      )}

                      {/* Shift buttons (< >) */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <button
                          onClick={() => handleMoveStage(deal.id, deal.stage, "prev")}
                          disabled={deal.stage === "prospect"}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:pointer-events-none text-[10px] font-bold flex items-center gap-0.5"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Préc.</span>
                        </button>

                        <span className="text-[10px] text-muted-foreground font-mono">
                          {deal.expectedCloseDate}
                        </span>

                        <button
                          onClick={() => handleMoveStage(deal.id, deal.stage, "next")}
                          disabled={deal.stage === "won"}
                          className="p-1 rounded hover:bg-muted text-amber-500 font-bold disabled:opacity-30 disabled:pointer-events-none text-[10px] flex items-center gap-0.5"
                        >
                          <span>Suiv.</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Nouvelle Opportunité */}
      {showNewDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card text-foreground rounded-3xl p-6 sm:p-7 border border-border shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Créer une Opportunité Commerciale</span>
              </h3>
              <button onClick={() => setShowNewDealModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Titre de l'opportunité *</label>
                <Input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Équipement caisse 2 boutiques"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Entreprise / Commerce *</label>
                  <Input
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Ex: Boutique Al Madina"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Nom du Contact</label>
                  <Input
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="Ex: Cheikh Diop"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Téléphone WhatsApp *</label>
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+221 77..."
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Email</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="prospect@gmail.com"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Valeur Estimée (FCFA) *</label>
                  <Input
                    type="number"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Date Prévue</label>
                  <Input
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="30/10/2026"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Étape Initiale</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="prospect">1. Nouveaux Prospects</option>
                    <option value="contact">2. Contact Pris</option>
                    <option value="proposal">3. Devis Envoyé</option>
                    <option value="negotiation">4. Négociation</option>
                    <option value="won">5. Gagné (Signé)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Priorité</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="high">🔥 Forte</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Basse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Notes & Contexte</label>
                <Input
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Intéressé par la facturation Wave et le tampon officiel"
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 rounded-xl mt-2"
              >
                Ajouter au Pipeline Commercial
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
