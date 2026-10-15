"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MessageCircle, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  DollarSign, 
  FileText, 
  Phone, 
  Check, 
  Flame, 
  ArrowRight,
  ShieldAlert,
  Settings2,
  RefreshCw
} from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RelancesWhatsAppPage() {
  const { invoicesList, clientsList, companySettings } = useAppData();

  const [selectedTemplate, setSelectedTemplate] = useState<"friendly" | "due" | "urgent">("friendly");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentInvoices, setSentInvoices] = useState<Record<string, boolean>>({});

  // Filter pending or overdue invoices
  const unpaidInvoices = invoicesList.filter((inv) => inv.status === "sent" || inv.status === "overdue");
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const overdueInvoices = invoicesList.filter((inv) => inv.status === "overdue");

  // Format phone for WhatsApp
  const cleanPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/[^0-9]/g, "");
  };

  const getClientPhone = (clientId: string) => {
    const client = clientsList.find((c) => c.id === clientId);
    return client?.phone || "+221 77 123 45 67";
  };

  const generateWhatsAppMessage = (invoice: typeof invoicesList[0], type: "friendly" | "due" | "urgent") => {
    const compName = companySettings?.companyName || "iziFlow";
    const paymentLink = `https://iziflow.sn/pay/${invoice.id}`;

    if (type === "friendly") {
      return `Bonjour ${invoice.client} 👋,\n\nC'est un rappel amical de la part de *${compName}* concernant votre facture *N° ${invoice.number}* d'un montant de *${invoice.amount.toLocaleString("fr-FR")} FCFA*, arrivant à échéance le ${invoice.dueDate}.\n\nVous pouvez effectuer votre règlement instantanément par *Wave* ou *Orange Money* via ce lien sécurisé :\n👉 ${paymentLink}\n\nMerci pour votre confiance !`;
    }

    if (type === "due") {
      return `Bonjour ${invoice.client},\n\nVotre facture *N° ${invoice.number}* de *${compName}* d'un montant de *${invoice.amount.toLocaleString("fr-FR")} FCFA* arrive à échéance *aujourd'hui*.\n\nMerci de procéder au règlement en 1 clic par *Wave* ou *Orange Money* :\n👉 ${paymentLink}\n\nUne quittance vous sera délivrée automatiquement dès confirmation.`;
    }

    // urgent
    return `⚠️ *URGENT - RAPPEL DE PAIEMENT*\n\nBonjour ${invoice.client},\n\nSauf erreur de notre part, votre facture *N° ${invoice.number}* d'un montant de *${invoice.amount.toLocaleString("fr-FR")} FCFA* présente un *dépassement d'échéance*.\n\nNous vous prions de régulariser la situation immédiatement via le lien direct ci-dessous :\n👉 ${paymentLink}\n\nEn cas de question, contactez notre service comptabilité au ${companySettings?.phone || "+221 77 123 45 67"}.\nCordialement,\n*${compName}*`;
  };

  const handleSendWhatsApp = (invoice: typeof invoicesList[0], type: "friendly" | "due" | "urgent") => {
    const client = clientsList.find((c) => c.id === invoice.clientId);
    const phone = cleanPhone(client?.phone || "+221771234567");
    const message = generateWhatsAppMessage(invoice, type);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    setSentInvoices((prev) => ({ ...prev, [invoice.id]: true }));
    window.open(whatsappUrl, "_blank");
  };

  const handleCopyMessage = (invoice: typeof invoicesList[0], type: "friendly" | "due" | "urgent") => {
    const message = generateWhatsAppMessage(invoice, type);
    navigator.clipboard.writeText(message);
    setCopiedId(invoice.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const sampleInvoice = unpaidInvoices[0] || invoicesList[0] || {
    id: "sample-1",
    number: "FAC-2026-0042",
    client: "Cabinet Médical Les Almadies",
    amount: 350000,
    dueDate: "25/10/2026",
    status: "sent",
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Relances & Envois WhatsApp
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Envoi Direct 1-Clic
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Relancez vos créances impayées directement sur WhatsApp avec lien de paiement instantané Wave & Orange Money.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => {
              if (unpaidInvoices.length > 0) {
                handleSendWhatsApp(unpaidInvoices[0] as any, selectedTemplate);
              }
            }}
            className="flex-1 sm:flex-none text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Relancer les Impayés</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Créances à Recouvrer</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {totalUnpaidAmount.toLocaleString("fr-FR")} <span className="text-xs font-sans text-muted-foreground">FCFA</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {unpaidInvoices.length} factures en attente
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Factures en Retard</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-500 font-mono">
            {overdueInvoices.length} <span className="text-xs font-sans text-muted-foreground">dépassements</span>
          </div>
          <div className="text-[11px] text-rose-500/80 font-medium mt-1">
            Relance urgente recommandée
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Taux de Réponse WhatsApp</span>
            <MessageCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            98%
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Lu dans les 5 minutes
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Canaux de Paiement Intégrés</span>
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-sm font-black text-foreground flex items-center gap-1.5 mt-1">
            <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-500 font-bold text-xs">🌊 Wave</span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs">🟠 OM</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Lien direct dans le message
          </div>
        </div>
      </div>

      {/* Simulator & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Template Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-500" />
              <span>Niveaux de Relance Prédéfinis</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Choisissez le ton adapté à la situation de votre client pour maximiser vos encaissements.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate("friendly")}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  selectedTemplate === "friendly"
                    ? "border-emerald-500 bg-emerald-500/10 text-foreground font-bold"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>1. Rappel Courtois (J-3)</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-500/20 px-1.5 py-0.5 rounded">Préventif</span>
                </div>
                <p className="text-[11px] font-normal text-muted-foreground mt-1">
                  Rappel amical quelques jours avant l'échéance de la facture.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate("due")}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  selectedTemplate === "due"
                    ? "border-amber-500 bg-amber-500/10 text-foreground font-bold"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>2. Échéance Atteinte (Jour J)</span>
                  <span className="text-[10px] text-amber-600 bg-amber-500/20 px-1.5 py-0.5 rounded">Actuel</span>
                </div>
                <p className="text-[11px] font-normal text-muted-foreground mt-1">
                  Message le jour prévu du paiement avec le lien Wave direct.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate("urgent")}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  selectedTemplate === "urgent"
                    ? "border-rose-500 bg-rose-500/10 text-foreground font-bold"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>3. Relance Urgente (J+7)</span>
                  <span className="text-[10px] text-rose-600 bg-rose-500/20 px-1.5 py-0.5 rounded">Ferme</span>
                </div>
                <p className="text-[11px] font-normal text-muted-foreground mt-1">
                  Mise en demeure cordiale demandant régularisation sans délai.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right: WhatsApp Visual Phone Bubble Simulator */}
        <div className="lg:col-span-2">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Aperçu Réel dans WhatsApp</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Voici exactement ce que votre client lira sur son smartphone.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyMessage(sampleInvoice as any, selectedTemplate)}
                  className="text-xs font-semibold h-8 gap-1.5 border-border"
                >
                  {copiedId === sampleInvoice.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === sampleInvoice.id ? "Copié !" : "Copier le texte"}</span>
                </Button>
              </div>
            </div>

            {/* WhatsApp Mock Chat Screen */}
            <div className="rounded-2xl bg-[#0b141a] p-4 sm:p-6 border border-slate-800 relative overflow-hidden text-slate-100 shadow-inner">
              {/* Chat Top Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xs">
                    {companySettings?.companyName?.[0] || "iF"}
                  </div>
                  <div>
                    <strong className="block text-white text-xs">{companySettings?.companyName || "iziFlow Entreprise"}</strong>
                    <span className="text-[10px] text-emerald-400 font-semibold">En ligne • Compte Professionnel Certifié</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">
                  <Phone className="w-3 h-3 text-slate-300" />
                  <span>{companySettings?.phone || "+221 77 123 45 67"}</span>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="max-w-md ml-auto bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-4 shadow-lg space-y-2 text-xs relative">
                <p className="whitespace-pre-line leading-relaxed">
                  {generateWhatsAppMessage(sampleInvoice as any, selectedTemplate)}
                </p>

                {/* Wave / OM Card Preview inside WhatsApp */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-400/30 text-[11px] space-y-1 mt-2">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span>Paiement Direct iziFlow</span>
                    <span className="font-mono">{sampleInvoice.amount.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Facture {sampleInvoice.number} • Encaissement instantané Wave / Orange Money
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/70 pt-1">
                  <span>14:32</span>
                  <span className="text-sky-300 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List to Send */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm space-y-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground">
              Factures en Attente de Paiement ({unpaidInvoices.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Cliquez sur "Relancer sur WhatsApp" pour ouvrir directement l'application avec le texte et le lien de règlement.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
              <tr>
                <th className="p-3.5 pl-4">Facture</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Téléphone WhatsApp</th>
                <th className="p-3.5">Échéance</th>
                <th className="p-3.5 text-right">Montant Dû</th>
                <th className="p-3.5 text-center">Statut</th>
                <th className="p-3.5 pr-4 text-right">Action Immédiate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {unpaidInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-foreground">Toutes vos factures sont réglées !</p>
                    <p className="text-xs">Aucun impayé à relancer pour le moment.</p>
                  </td>
                </tr>
              ) : (
                unpaidInvoices.map((inv) => {
                  const isOverdue = inv.status === "overdue";
                  const phone = getClientPhone(inv.clientId);
                  const isSent = sentInvoices[inv.id];

                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 pl-4 font-bold text-foreground font-mono">
                        {inv.number}
                      </td>
                      <td className="p-3.5 font-medium text-foreground">
                        {inv.client}
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {phone}
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {inv.dueDate}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-foreground text-sm">
                        {inv.amount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="p-3.5 text-center">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>En retard</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            <span>En attente</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyMessage(inv, isOverdue ? "urgent" : selectedTemplate)}
                            className="h-8 px-2.5 text-[11px] gap-1 font-semibold border-border"
                          >
                            {copiedId === inv.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === inv.id ? "Copié" : "Copier"}</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleSendWhatsApp(inv, isOverdue ? "urgent" : selectedTemplate)}
                            className="h-8 px-3 text-[11px] bg-[#25D366] hover:bg-[#1ebe5b] text-slate-950 font-bold gap-1.5 shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>{isSent ? "Renvoyer WhatsApp" : "Relancer WhatsApp"}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
