"use client";

import { useState, useEffect } from "react";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  CheckCircle2, 
  BookOpen, 
  ExternalLink,
  Clock,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Copy,
  Check
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Comment recevoir des paiements par Wave ou Orange Money ?",
    answer: "Lors de la création ou l'envoi d'une facture ou ticket de caisse, votre client reçoit un lien de paiement avec un Code QR et des boutons pour régler en 1 clic via Wave ou Orange Money. Le solde est crédité automatiquement sur votre portefeuille.",
  },
  {
    question: "Quel est le délai pour recevoir l'argent sur mon compte ?",
    answer: "Les encaissements via Wave et Orange Money sont instantanés (moins de 1 minute). Les virements bancaires vers votre compte (RIB) prennent 24 à 48 heures ouvrables.",
  },
  {
    question: "Comment télécharger une facture ou un reçu au format PDF ?",
    answer: "Rendez-vous dans la section Factures ou Ventes, cliquez sur la facture ou le ticket souhaité puis sur le bouton 'Télécharger PDF' ou 'Imprimer' pour obtenir votre document conforme avec le cachet certifié.",
  },
  {
    question: "Les factures et bulletins sont-ils conformes à la réglementation au Sénégal et OHADA ?",
    answer: "Oui, toutes les factures incluent le NINEA, le RCCM, le calcul automatique de TVA (18%) et les mentions obligatoires. Les bulletins de paie intègrent le calcul des cotisations IPRES (5.6%) et de l'impôt TRIMF selon le Code du Travail du Sénégal.",
  },
  {
    question: "Comment passer d'un forfait Gratuit à Pro ou Business ?",
    answer: "Rendez-vous dans Paramètres > Abonnement & Forfaits. Vous pouvez régler votre abonnement en toute sécurité par Wave, Orange Money ou Carte Bancaire via Bictorys pour débloquer immédiatement les quotas illimités.",
  },
];

export default function SupportPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSent, setTicketSent] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form states
  const [senderName, setSenderName] = useState("");
  const [senderContact, setSenderContact] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setSenderName(user.name);
      if (user.email) setSenderContact(user.email);
    }
  }, [user]);

  const supportPhone = "+221 77 493 73 49";
  const supportPhoneClean = "221774937349";
  const supportEmail = "massalndiaye23@gmail.com";

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(supportPhoneClean);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendTicket = (channel: "whatsapp" | "email" = "whatsapp") => {
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const clientName = senderName.trim() || user?.name || "Utilisateur iziFlow";
    const contactInfo = senderContact.trim() || user?.email || "Non spécifié";

    if (channel === "whatsapp") {
      const whatsappText = 
`🆘 *DEMANDE D'ASSISTANCE IZIFLOW*
---------------------------------------
*Client / Société :* ${clientName}
*Contact :* ${contactInfo}
*Sujet :* ${subject.trim()}

*Message :*
${message.trim()}
---------------------------------------
_Envoyé depuis l'application iziFlow SaaS_`;

      const whatsappUrl = `https://wa.me/${supportPhoneClean}?text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappUrl, "_blank");
    } else {
      const emailSubject = `[Support iziFlow] ${subject.trim()}`;
      const emailBody = 
`Bonjour Massal,

Je vous contacte concernant iziFlow :

Nom / Entreprise : ${clientName}
Contact : ${contactInfo}
Sujet : ${subject.trim()}

Message :
${message.trim()}

---
Envoyé depuis l'application iziFlow`;

      const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoUrl, "_blank");
    }

    setTicketSent(true);
    setSubject("");
    setMessage("");
    setIsSubmitting(false);
    setTimeout(() => setTicketSent(false), 5000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Toast Notification */}
      {ticketSent && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Demande transmise avec succès !</p>
            <p className="opacity-90">Votre message a été transmis à notre support technique.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Aide & Support Client</h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Support Sénégal 7j/7
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Une question ou besoin d'accompagnement ? Notre équipe d'assistance est joignable directement par Téléphone, WhatsApp et Email.
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Téléphone */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/40 transition-all group">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Direct
            </span>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-base">Assistance Téléphonique</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Du Lundi au Samedi de 8h à 20h</p>
            <a 
              href={`tel:+${supportPhoneClean}`}
              className="text-base font-mono font-black text-primary hover:underline block mt-2"
            >
              {supportPhone}
            </a>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <a 
              href={`tel:+${supportPhoneClean}`}
              className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Appeler</span>
            </a>
            <button
              type="button"
              onClick={handleCopyPhone}
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all"
              title="Copier le numéro"
            >
              {copiedPhone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2. WhatsApp Direct */}
        <div className="rounded-3xl border border-[#25D366]/40 bg-[#25D366]/5 p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-[#25D366] transition-all group">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-[#25D366]/20 text-[#25D366] rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30">
              Recommandé
            </span>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-base">Support WhatsApp</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Réponse instantanée par message</p>
            <a 
              href={`https://wa.me/${supportPhoneClean}?text=Bonjour%20Massal,%20j'ai%20besoin%20d'aide%20sur%20iziFlow`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-mono font-black text-[#128C7E] dark:text-[#25D366] hover:underline block mt-2"
            >
              {supportPhone}
            </a>
          </div>

          <div className="pt-2 border-t border-[#25D366]/20">
            <a 
              href={`https://wa.me/${supportPhoneClean}?text=Bonjour%20Massal,%20j'ai%20besoin%20d'aide%20sur%20iziFlow`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Ouvrir WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 3. Email */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              24h/24
            </span>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-base">Support par Email</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Réponse garantie sous 2 heures</p>
            <a 
              href={`mailto:${supportEmail}?subject=Demande%20d'assistance%20iziFlow`}
              className="text-xs font-mono font-bold text-emerald-600 hover:underline block mt-2 break-all"
            >
              {supportEmail}
            </a>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <a 
              href={`mailto:${supportEmail}?subject=Demande%20d'assistance%20iziFlow`}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Envoyer un mail</span>
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all"
              title="Copier l'email"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: FAQ & Ticket Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* FAQ Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Questions Fréquentes (FAQ)</h3>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-foreground hover:bg-accent/50 transition-colors"
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Envoyer une demande d'aide</h3>
              <p className="text-xs text-muted-foreground">Nous traitons directement votre demande sur WhatsApp ou Email.</p>
            </div>
          </div>

          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              handleSendTicket("whatsapp"); 
            }} 
            className="flex flex-col gap-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Votre Nom ou Entreprise
                </label>
                <input
                  type="text"
                  placeholder="Ex: Boutique Keur Serigne"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Votre Contact (Téléphone / Email)
                </label>
                <input
                  type="text"
                  placeholder="+221 77... ou email@..."
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Sujet de la demande *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Question sur la facturation ou paiement Wave"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Message / Description du problème *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Expliquez-nous votre besoin ou l'erreur rencontrée..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !message.trim()}
                className="w-full bg-[#25D366] hover:bg-[#1ebe5b] text-slate-950 font-bold text-xs h-11 rounded-xl gap-2 shadow-md shadow-[#25D366]/20 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span className="truncate">Envoyer sur WhatsApp (+221 77 493 73 49)</span>
              </Button>

              <Button
                type="button"
                disabled={isSubmitting || !subject.trim() || !message.trim()}
                onClick={() => handleSendTicket("email")}
                variant="outline"
                className="w-full h-10 rounded-xl text-xs font-semibold gap-2 border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center"
                title="Envoyer par email à massalndiaye23@gmail.com"
              >
                <Mail className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="truncate">Ou envoyer par Email (massalndiaye23@gmail.com)</span>
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-1">
              Destinataire officiel : <strong>Massal Ndiaye</strong> • Réponse rapide assurée
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
