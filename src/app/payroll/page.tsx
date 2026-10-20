"use client";

import { useState } from "react";
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Download, 
  ShieldCheck, 
  Search, 
  Filter, 
  Building2, 
  ChevronRight, 
  Sparkles,
  UserPlus,
  CreditCard,
  X,
  Eye,
  AlertCircle,
  MessageCircle,
  Send,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { canAddPayroll, getPlanLimits, normalizePlan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Employee, Payroll } from "@/lib/data";
import { WaveLogo, OrangeMoneyLogo, PaymentMethodBadge } from "@/components/ui/payment-logos";

export default function PayrollPage() {
  const { user } = useAuth();
  const { 
    employeesList, 
    payrollsList, 
    addEmployee, 
    addPayroll, 
    updatePayrollStatus, 
    companySettings 
  } = useAppData();

  const [activeTab, setActiveTab] = useState<"payrolls" | "employees" | "guide">("payrolls");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(2026);

  // Quota bulletins de paie mensuels
  const thisMonthPayrollCount = payrollsList.filter(
    (p) => p.periodMonth === selectedMonth && p.periodYear === selectedYear
  ).length;
  const payrollQuota = canAddPayroll(thisMonthPayrollCount, user?.plan);
  const planLimits = getPlanLimits(user?.plan);

  // Modals
  const [showPayslipModal, setShowPayslipModal] = useState<Payroll | null>(null);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [showNewPayrollModal, setShowNewPayrollModal] = useState(false);

  // New Employee form state
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpPhone, setNewEmpPhone] = useState("");
  const [newEmpPosition, setNewEmpPosition] = useState("");
  const [newEmpDepartment, setNewEmpDepartment] = useState("Ventes");
  const [newEmpSalary, setNewEmpSalary] = useState(350000);
  const [newEmpContract, setNewEmpContract] = useState<"CDI" | "CDD" | "Stage">("CDI");
  const [newEmpPayment, setNewEmpPayment] = useState<"wave" | "om" | "bank_transfer" | "cash">("wave");

  // New Payroll form state
  const [selectedEmpId, setSelectedEmpId] = useState(employeesList[0]?.id || "");
  const [payrollBonus, setPayrollBonus] = useState(0);
  const [payrollTransport, setPayrollTransport] = useState(35000);
  const [payrollNotes, setPayrollNotes] = useState("");

  // KPIs
  const totalGrossSalaries = payrollsList.reduce((sum, p) => sum + p.baseSalary + (p.bonus || 0) + (p.transportAllowance || 0), 0);
  const totalNetSalaries = payrollsList.reduce((sum, p) => sum + p.netSalary, 0);
  const totalSocialDeductions = payrollsList.reduce((sum, p) => sum + (p.ipresDeduction || 0) + (p.taxDeduction || 0), 0);
  const paidCount = payrollsList.filter((p) => p.status === "paid").length;
  const pendingCount = payrollsList.filter((p) => p.status !== "paid").length;

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    await addEmployee({
      fullName: newEmpName.trim(),
      email: newEmpEmail.trim() || undefined,
      phone: newEmpPhone.trim() || undefined,
      position: newEmpPosition.trim() || "Employé",
      department: newEmpDepartment,
      baseSalary: Number(newEmpSalary),
      contractType: newEmpContract,
      hireDate: new Date().toLocaleDateString("fr-FR"),
      paymentMethod: newEmpPayment,
      status: "active",
    });

    setShowNewEmployeeModal(false);
    setNewEmpName("");
    setNewEmpEmail("");
    setNewEmpPhone("");
    setNewEmpPosition("");
  };

  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollQuota.allowed) {
      alert(`Limite de ${payrollQuota.limit} bulletin(s) de paie par mois atteinte sur votre forfait ${planLimits.name}. Passez au forfait supérieur pour continuer.`);
      return;
    }
    const emp = employeesList.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    const base = emp.baseSalary;
    const bonus = Number(payrollBonus);
    const transport = Number(payrollTransport);
    const gross = base + bonus;

    // Simulation OHADA Sénégal : IPRES salarial 5.6%
    const ipres = Math.round(gross * 0.056);
    // TRIMF / Impôt sur le revenu indicatif ~8%
    const tax = Math.round(gross * 0.08);
    const totalDeductions = ipres + tax;
    const net = gross + transport - totalDeductions;

    await addPayroll({
      employeeId: emp.id,
      employeeName: emp.fullName,
      position: emp.position,
      department: emp.department,
      periodMonth: selectedMonth,
      periodYear: selectedYear,
      baseSalary: base,
      transportAllowance: transport,
      bonus,
      ipresDeduction: ipres,
      taxDeduction: tax,
      deductions: totalDeductions,
      netSalary: net,
      status: "pending",
      paymentMethod: emp.paymentMethod,
      notes: payrollNotes.trim() || undefined,
    });

    setShowNewPayrollModal(false);
    setPayrollBonus(0);
    setPayrollNotes("");
  };

  const handlePayViaWave = async (payrollId: string) => {
    await updatePayrollStatus(payrollId, "paid");
  };

  const handleSendPayrollWhatsApp = (payrollToSend?: Payroll) => {
    const p = payrollToSend || showPayslipModal;
    if (!p) return;
    const emp = employeesList.find((e) => e.id === p.employeeId);
    const phone = emp?.phone ? emp.phone.replace(/[^0-9]/g, "") : "";
    const comp = companySettings?.companyName || "iziFlow SARL";
    const ref = `BUL-${p.periodYear}-${String(p.periodMonth).padStart(2, "0")}-${p.id.slice(-4)}`;

    const message = 
`📄 *BULLETIN DE PAIE DÉMATÉRIALISÉ*
*${comp}* • Direction des Ressources Humaines
---------------------------------------
*Salarié :* ${p.employeeName}
*Poste :* ${p.position || "Non spécifié"}
*Département :* ${p.department || "Général"}
*Période :* Mois de ${String(p.periodMonth).padStart(2, "0")}/${p.periodYear}
*Réf. Document :* ${ref}

*Détails des Rubriques :*
• Salaire de Base : ${p.baseSalary.toLocaleString("fr-FR")} FCFA
${(p.transportAllowance || 0) > 0 ? `• Indemnité Transport : ${(p.transportAllowance || 0).toLocaleString("fr-FR")} FCFA\n` : ""}${(p.bonus || 0) > 0 ? `• Prime & Bonus : ${(p.bonus || 0).toLocaleString("fr-FR")} FCFA\n` : ""}• Cotisation Retraite IPRES : -${(p.ipresDeduction || Math.round(p.baseSalary * 0.056)).toLocaleString("fr-FR")} FCFA
• Retenue Fiscale TRIMF : -${(p.taxDeduction || Math.round(p.baseSalary * 0.08)).toLocaleString("fr-FR")} FCFA

---------------------------------------
💰 *NET À PAYER AU SALARIÉ :* *${p.netSalary.toLocaleString("fr-FR")} FCFA*
*Mode de règlement :* ${(p.paymentMethod || "wave").toUpperCase()}
*Statut :* ${p.status === "paid" ? `✅ Réglé le ${p.paymentDate || "10/10"}` : "⏳ En attente de virement"}
---------------------------------------
_Certifié conforme aux règles du Code du Travail du Sénégal et du Système Comptable OHADA._`;

    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0">
      {/* Main Payroll Dashboard (Hidden during print when payslip is displayed) */}
      <div className={`space-y-6 ${showPayslipModal ? "print:hidden" : ""}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Paie & Ressources Humaines
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
              OHADA • UEMOA
            </span>
            <Badge 
              variant="outline" 
              className={`${!payrollQuota.allowed ? "bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold" : "bg-muted text-muted-foreground border-border"} text-xs py-0.5`}
            >
              Bulletins : {thisMonthPayrollCount} / {planLimits.maxPayrollsPerMonth} ({planLimits.name})
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Édition des fiches de paie conformes, gestion du personnel et déclarations sociales (IPRES & CSS).
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!payrollQuota.allowed ? (
            <Link href="/settings/billing">
              <Button 
                className="flex-1 sm:flex-none text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shadow-md"
              >
                <Lock className="w-4 h-4" />
                <span>Passer {user?.plan === "pro" ? "Business" : "Pro"} (Limite atteinte)</span>
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={() => setShowNewPayrollModal(true)}
              className="flex-1 sm:flex-none text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Bulletin</span>
            </Button>
          )}
          <Button 
            onClick={() => setShowNewEmployeeModal(true)}
            variant="outline"
            className="text-xs font-semibold gap-1.5 border-border"
          >
            <UserPlus className="w-4 h-4 text-purple-500" />
            <span>+ Employé</span>
          </Button>
        </div>
      </div>

      {/* Quota limit warning banner for Payroll */}
      {!payrollQuota.allowed && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-700 dark:text-amber-400">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Plafond de paie atteint ({thisMonthPayrollCount}/{planLimits.maxPayrollsPerMonth} bulletins ce mois) : </span>
              Le forfait {planLimits.name} est limité à {planLimits.maxPayrollsPerMonth} bulletin(s) par mois. Passez au forfait supérieur pour rémunérer l'ensemble de votre personnel.
            </div>
          </div>
          <Link href="/settings/billing">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 rounded-xl">
              Augmenter la limite
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Masse Salariale Nette</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {totalNetSalaries.toLocaleString("fr-FR")} <span className="text-xs font-sans text-muted-foreground">FCFA</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Brut total : {totalGrossSalaries.toLocaleString("fr-FR")} FCFA
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Cotisations Sociales (IPRES/CSS)</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {totalSocialDeductions.toLocaleString("fr-FR")} <span className="text-xs font-sans text-muted-foreground">FCFA</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Déclaration mensuelle réglementaire
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Effectif du Personnel</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {employeesList.length} <span className="text-xs font-sans text-muted-foreground">collaborateurs</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            100% actifs ce mois
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Statut des Versements</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-foreground font-mono flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">{paidCount} Payés</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-amber-500">{pendingCount} En cours</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Virements Wave & Banques
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("payrolls")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "payrolls" 
              ? "bg-purple-600 text-white shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Bulletins de Paie ({payrollsList.length})
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "employees" 
              ? "bg-purple-600 text-white shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Registre du Personnel ({employeesList.length})
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "guide" 
              ? "bg-purple-600 text-white shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Barème Social & Fiscal OHADA
        </button>
      </div>

      {/* TAB 1: Bulletins de Paie */}
      {activeTab === "payrolls" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="p-3.5 pl-4">Employé</th>
                    <th className="p-3.5">Poste / Dép.</th>
                    <th className="p-3.5">Période</th>
                    <th className="p-3.5 text-right">Salaire Base</th>
                    <th className="p-3.5 text-right">Retenues IPRES/Impôt</th>
                    <th className="p-3.5 text-right">Net à Payer</th>
                    <th className="p-3.5 text-center">Règlement</th>
                    <th className="p-3.5 text-center">Statut</th>
                    <th className="p-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payrollsList.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 pl-4 font-bold text-foreground">
                        {p.employeeName}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        <div>{p.position || "Non spécifié"}</div>
                        <div className="text-[10px] text-muted-foreground/70">{p.department}</div>
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {String(p.periodMonth).padStart(2, "0")}/{p.periodYear}
                      </td>
                      <td className="p-3.5 text-right font-mono font-medium text-foreground">
                        {p.baseSalary.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="p-3.5 text-right font-mono text-rose-500 font-medium">
                        -{p.deductions.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                        {p.netSalary.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="p-3.5 text-center">
                        <PaymentMethodBadge method={p.paymentMethod} />
                      </td>
                      <td className="p-3.5 text-center">
                        {p.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Payé le {p.paymentDate || "10/10"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            <span>En attente</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleSendPayrollWhatsApp(p)}
                            className="h-7 px-2 text-[11px] bg-[#25D366] hover:bg-[#1ebe5b] text-slate-950 font-bold gap-1 shadow-xs"
                            title="Envoyer le bulletin par WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 fill-current" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPayslipModal(p)}
                            className="h-7 px-2.5 text-[11px] gap-1 font-semibold border-border hover:bg-purple-500/10 hover:text-purple-600"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Bulletin</span>
                          </Button>

                          {p.status !== "paid" && (
                            <Button
                              size="sm"
                              onClick={() => handlePayViaWave(p.id)}
                              className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 shadow-sm"
                            >
                              <span>Régler</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Registre du Personnel */}
      {activeTab === "employees" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employeesList.map((emp) => (
            <div key={emp.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-black flex items-center justify-center text-sm">
                    {emp.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{emp.fullName}</h3>
                    <p className="text-xs text-muted-foreground">{emp.position}</p>
                    <span className="text-[10px] text-purple-600 font-semibold">{emp.department}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                  {emp.contractType}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
                <div className="flex justify-between">
                  <span>Salaire de base :</span>
                  <strong className="text-foreground font-mono">{emp.baseSalary.toLocaleString("fr-FR")} FCFA</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mode de paiement :</span>
                  <PaymentMethodBadge method={emp.paymentMethod} />
                </div>
                <div className="flex justify-between">
                  <span>Téléphone :</span>
                  <span className="font-mono text-foreground">{emp.phone || "Non renseigné"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date d'embauche :</span>
                  <span>{emp.hireDate}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedEmpId(emp.id);
                  setShowNewPayrollModal(true);
                }}
                className="w-full text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-500/10 border-purple-500/30"
              >
                Générer bulletin pour {emp.fullName.split(" ")[0]}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Guide Réglementaire OHADA */}
      {activeTab === "guide" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground">
              Barème Social & Fiscal des Salaires (Sénégal & Zone UEMOA)
            </h3>
            <p className="text-xs text-muted-foreground">
              Conformité avec le Code du Travail sénégalais et le Règlement Général de l'IPRES / CSS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <h4 className="font-bold text-xs text-purple-500 uppercase tracking-wider">
                1. Retenues Sociales Salariales (À la charge de l'employé)
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex justify-between pb-1 border-b border-border/50">
                  <span>IPRES Régime Général :</span>
                  <strong className="text-foreground font-mono">5.6% du salaire brut</strong>
                </li>
                <li className="flex justify-between pb-1 border-b border-border/50">
                  <span>IPRES Régime Cadre (Tranche B) :</span>
                  <strong className="text-foreground font-mono">2.4% (Plafond 3x)</strong>
                </li>
                <li className="flex justify-between">
                  <span>Retenue Fiscale TRIMF / VRS :</span>
                  <strong className="text-foreground font-mono">Selon barème progressif</strong>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <h4 className="font-bold text-xs text-blue-500 uppercase tracking-wider">
                2. Cotisations Patronales (À la charge de l'employeur)
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex justify-between pb-1 border-b border-border/50">
                  <span>IPRES Part Patronale :</span>
                  <strong className="text-foreground font-mono">8.4% du salaire brut</strong>
                </li>
                <li className="flex justify-between pb-1 border-b border-border/50">
                  <span>Caisse Sécurité Sociale (CSS) Prestations :</span>
                  <strong className="text-foreground font-mono">7.0%</strong>
                </li>
                <li className="flex justify-between pb-1 border-b border-border/50">
                  <span>CSS Accidents du Travail :</span>
                  <strong className="text-foreground font-mono">1.0% à 5.0% selon risque</strong>
                </li>
                <li className="flex justify-between">
                  <span>CFCE (Contribution Forfaitaire) :</span>
                  <strong className="text-foreground font-mono">3.0%</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* MODAL 1: Bulletin de Paie Imprimable Officiel avec Cachet & Signature */}
      {showPayslipModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-full">
          {/* Floating Action Bar above the A4 sheet */}
          <div className="w-full max-w-3xl flex items-center justify-between pb-3 text-white print:hidden">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300 font-black text-xs uppercase tracking-wider border border-purple-500/30">
                Document RH Officiel • Format A4
              </span>
              <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                Réf: BUL-{showPayslipModal.periodYear}-{String(showPayslipModal.periodMonth).padStart(2, "0")}-{showPayslipModal.id.slice(-4)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleSendPayrollWhatsApp()}
                className="h-8 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-slate-950 font-bold text-xs gap-1.5 shadow-lg active:scale-95 transition-all"
                title="Envoyer le bulletin au salarié par WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 shadow-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </Button>
              <button
                onClick={() => setShowPayslipModal(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Authentic Physical A4 Payslip Sheet */}
          <div 
            id="payslip-document"
            className="w-full max-w-3xl bg-white text-slate-950 p-8 sm:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-slate-300 rounded-sm sm:rounded-md relative select-text my-2 print:border-none print:shadow-none print:p-6 print:m-0 print:max-w-full print:w-full"
            style={{ backgroundColor: "#ffffff", color: "#020617" }}
          >
            {/* Senegal Republic Tricolor Accent Stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-[#00853f] via-[#fdef42] to-[#e31b23] rounded-t-sm mb-6 print:block" />
              {/* Header Company & Payslip Title */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight">
                    {companySettings?.companyName || "iziFlow SARL"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    NINEA : {companySettings?.ninea || "001234567 2V3"} • RCCM : {companySettings?.rccm || "SN-DKR-2024-B-12345"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Dakar, Sénégal • Email : {companySettings?.email || "contact@iziflow.sn"}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-2.5 py-0.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider rounded">
                    RÉPUBLIQUE DU SÉNÉGAL
                  </div>
                  <div className="text-base font-black text-purple-900 uppercase tracking-tight">
                    BULLETIN DE SALAIRE
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Mois de : <span className="font-mono text-purple-800">{String(showPayslipModal.periodMonth).padStart(2, "0")} / {showPayslipModal.periodYear}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Paiement :</span>
                    {showPayslipModal.paymentMethod === "wave" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1dc3f7]/15 text-[#0284c7] border border-[#1dc3f7]/40 text-[11px] font-extrabold">
                        <WaveLogo className="w-3.5 h-3.5" />
                        <span>Wave</span>
                      </span>
                    ) : showPayslipModal.paymentMethod === "om" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ff7900]/15 text-[#ea580c] border border-[#ff7900]/40 text-[11px] font-extrabold">
                        <OrangeMoneyLogo className="w-3.5 h-3.5" />
                        <span>Orange Money</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-bold">
                        🏦 Virement
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Employee Block */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Salarié</span>
                  <strong className="text-sm font-bold text-slate-900">{showPayslipModal.employeeName}</strong>
                  <p className="text-slate-600">{showPayslipModal.position || "Responsable"}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Département & Statut</span>
                  <strong className="text-slate-900">{showPayslipModal.department || "Général"}</strong>
                  <p className="text-emerald-700 font-bold text-[11px]">Régime Général IPRES</p>
                </div>
              </div>

              {/* Detailed Salary Table */}
              <table className="w-full text-xs border border-slate-200">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
                  <tr>
                    <th className="p-2.5 text-left">Rubriques de Paie</th>
                    <th className="p-2.5 text-right">Base</th>
                    <th className="p-2.5 text-right">Taux / Réf</th>
                    <th className="p-2.5 text-right">Gains (+)</th>
                    <th className="p-2.5 text-right">Retenues (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Salaire de Base Conventionnel</td>
                    <td className="p-2.5 text-right font-mono">{showPayslipModal.baseSalary.toLocaleString("fr-FR")}</td>
                    <td className="p-2.5 text-right text-slate-400">100%</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {showPayslipModal.baseSalary.toLocaleString("fr-FR")}
                    </td>
                    <td className="p-2.5 text-right">-</td>
                  </tr>
                  {(showPayslipModal.transportAllowance || 0) > 0 && (
                    <tr>
                      <td className="p-2.5 font-medium">Indemnité de Transport Réglementaire</td>
                      <td className="p-2.5 text-right font-mono">-</td>
                      <td className="p-2.5 text-right text-slate-400">Forfait</td>
                      <td className="p-2.5 text-right font-mono text-slate-900">
                        {showPayslipModal.transportAllowance?.toLocaleString("fr-FR")}
                      </td>
                      <td className="p-2.5 text-right">-</td>
                    </tr>
                  )}
                  {(showPayslipModal.bonus || 0) > 0 && (
                    <tr>
                      <td className="p-2.5 font-medium">Prime d'Assiduité / Performance</td>
                      <td className="p-2.5 text-right font-mono">-</td>
                      <td className="p-2.5 text-right text-slate-400">Prime</td>
                      <td className="p-2.5 text-right font-mono text-slate-900">
                        {showPayslipModal.bonus.toLocaleString("fr-FR")}
                      </td>
                      <td className="p-2.5 text-right">-</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-rose-700">Cotisation IPRES Salariale (Retraite)</td>
                    <td className="p-2.5 text-right font-mono">{showPayslipModal.baseSalary.toLocaleString("fr-FR")}</td>
                    <td className="p-2.5 text-right text-rose-600">5.6%</td>
                    <td className="p-2.5 text-right">-</td>
                    <td className="p-2.5 text-right font-mono text-rose-700 font-bold">
                      {(showPayslipModal.ipresDeduction || Math.round(showPayslipModal.baseSalary * 0.056)).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-rose-700">Retenue Fiscale Revenu (TRIMF/VRS)</td>
                    <td className="p-2.5 text-right font-mono">{showPayslipModal.baseSalary.toLocaleString("fr-FR")}</td>
                    <td className="p-2.5 text-right text-rose-600">Barème</td>
                    <td className="p-2.5 text-right">-</td>
                    <td className="p-2.5 text-right font-mono text-rose-700 font-bold">
                      {(showPayslipModal.taxDeduction || Math.round(showPayslipModal.baseSalary * 0.08)).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                  <tr>
                    <td colSpan={3} className="p-2.5 text-right uppercase text-[11px]">Totaux :</td>
                    <td className="p-2.5 text-right font-mono text-emerald-700">
                      {(showPayslipModal.baseSalary + (showPayslipModal.bonus || 0) + (showPayslipModal.transportAllowance || 0)).toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="p-2.5 text-right font-mono text-rose-700">
                      -{showPayslipModal.deductions.toLocaleString("fr-FR")} FCFA
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Net to Pay Box */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-purple-700 block">
                    NET À PAYER AU SALARIÉ
                  </span>
                  <span className="text-[10px] text-slate-500">Virement certifié conforme</span>
                </div>
                <div className="text-2xl font-black text-purple-900 font-mono">
                  {showPayslipModal.netSalary.toLocaleString("fr-FR")} <span className="text-xs font-sans">FCFA</span>
                </div>
              </div>

              {/* Legal Stamp & Signature */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="p-3 border border-dashed border-slate-300 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Signature du Salarié
                  </span>
                  <div className="h-16 flex items-end justify-center text-[10px] text-slate-400 italic">
                    Pour acquit et acceptation
                  </div>
                </div>

                <div className="p-3 border border-slate-300 rounded-xl text-center relative overflow-hidden bg-slate-50/50">
                  <span className="text-[10px] uppercase font-bold text-purple-700 block mb-1">
                    Pour l'Employeur • Cachet Officiel
                  </span>

                  {companySettings?.companyStampUrl ? (
                    <img 
                      src={companySettings.companyStampUrl} 
                      alt="Cachet Entreprise" 
                      className="w-20 h-20 mx-auto object-contain my-1 opacity-90"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-700 flex flex-col items-center justify-center mx-auto my-1 text-[8px] text-indigo-700 font-bold uppercase rotate-[-8deg] opacity-85">
                      <span>{companySettings?.companyName || "iziFlow"}</span>
                      <span className="text-[6px]">SÉNÉGAL</span>
                      <span>CERTIFIÉ</span>
                    </div>
                  )}

                  <div className="text-[10px] font-bold text-slate-700 mt-1">
                    {companySettings?.companySignatoryName || "La Direction Générale"}
                  </div>
                </div>
              </div>

              {/* Legal Notice Footer */}
              <div className="text-center pt-6 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-200 mt-6">
                <p className="font-semibold text-slate-700">
                  Conservez ce bulletin de paie sans limitation de durée (Article L.116 du Code du Travail du Sénégal).
                </p>
                <p className="text-[9px] text-slate-400">
                  Généré et certifié électroniquement par iziFlow Paie &amp; RH • Solution de Gestion Commerciale
                </p>
              </div>
            </div>

            {/* Prominent Action Dock Below the Payslip */}
            <div className="w-full max-w-3xl mt-4 flex flex-col gap-2.5 print:hidden">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => window.print()}
                  className="h-11 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm gap-2 shadow-xl active:scale-[0.98] transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Bulletin (A4)</span>
                </Button>

                <Button
                  onClick={() => handleSendPayrollWhatsApp()}
                  className="h-11 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5b] text-slate-950 font-black text-xs sm:text-sm gap-2 shadow-xl shadow-[#25D366]/20 active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Envoyer sur WhatsApp</span>
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowPayslipModal(null)}
                className="w-full h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-2"
              >
                <X className="w-4 h-4" />
                <span>Fermer le document</span>
              </Button>
            </div>
          </div>
        )}

      {/* MODAL 2: Nouvel Employé */}
      {showNewEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="w-full max-w-md bg-card text-foreground rounded-3xl p-6 sm:p-7 border border-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-500" />
                <span>Enregistrer un Nouvel Employé</span>
              </h3>
              <button onClick={() => setShowNewEmployeeModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Nom et Prénom *</label>
                <Input
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="Ex: Modou Sarr"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Téléphone *</label>
                  <Input
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="+221 77..."
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Email</label>
                  <Input
                    type="email"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    placeholder="employe@gmail.com"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Poste *</label>
                  <Input
                    value={newEmpPosition}
                    onChange={(e) => setNewEmpPosition(e.target.value)}
                    placeholder="Ex: Commercial"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Département</label>
                  <select
                    value={newEmpDepartment}
                    onChange={(e) => setNewEmpDepartment(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="Ventes">Ventes</option>
                    <option value="Finance">Finance</option>
                    <option value="Technologie">Technologie</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Salaire de Base (FCFA) *</label>
                  <Input
                    type="number"
                    required
                    value={newEmpSalary}
                    onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                    className="text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Type Contrat</label>
                  <select
                    value={newEmpContract}
                    onChange={(e) => setNewEmpContract(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Mode de Virement Préféré</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewEmpPayment("wave")}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      newEmpPayment === "wave" ? "border-[#1dc3f7] bg-[#1dc3f7]/15 text-[#0284c7] ring-1 ring-[#1dc3f7]" : "border-border text-muted-foreground"
                    }`}
                  >
                    <WaveLogo className="w-4 h-4" />
                    <span>Wave</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEmpPayment("om")}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      newEmpPayment === "om" ? "border-[#ff7900] bg-[#ff7900]/15 text-[#ea580c] ring-1 ring-[#ff7900]" : "border-border text-muted-foreground"
                    }`}
                  >
                    <OrangeMoneyLogo className="w-4 h-4" />
                    <span>Orange M.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEmpPayment("bank_transfer")}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      newEmpPayment === "bank_transfer" ? "border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500" : "border-border text-muted-foreground"
                    }`}
                  >
                    <span>🏦</span>
                    <span>Banque</span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 rounded-xl mt-2"
              >
                Enregistrer l'employé
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Nouveau Bulletin de Paie */}
      {showNewPayrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="w-full max-w-md bg-card text-foreground rounded-3xl p-6 sm:p-7 border border-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Émettre un Bulletin de Salaire</span>
              </h3>
              <button onClick={() => setShowNewPayrollModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayroll} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Sélectionner l'Employé *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 py-1 text-xs font-semibold"
                >
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} - {emp.position} ({emp.baseSalary.toLocaleString("fr-FR")} FCFA)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Mois</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value={10}>Octobre 2026</option>
                    <option value={11}>Novembre 2026</option>
                    <option value={12}>Décembre 2026</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Prime / Bonus (FCFA)</label>
                  <Input
                    type="number"
                    value={payrollBonus}
                    onChange={(e) => setPayrollBonus(Number(e.target.value))}
                    placeholder="0"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Indemnité de Transport (FCFA)</label>
                <Input
                  type="number"
                  value={payrollTransport}
                  onChange={(e) => setPayrollTransport(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Commentaires / Notes</label>
                <Input
                  value={payrollNotes}
                  onChange={(e) => setPayrollNotes(e.target.value)}
                  placeholder="Ex: Paiement fin de mois Wave"
                  className="text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-600 dark:text-purple-300">
                💡 Les cotisations sociales IPRES (5.6%) et l'impôt seront automatiquement calculés sur le bulletin final.
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 rounded-xl"
              >
                Générer le bulletin de salaire
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
