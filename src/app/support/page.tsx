"use client";

import { useState } from "react";
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
  Smartphone, 
  ShieldAlert 
} from "lucide-react";

const faqs = [
  {
    question: "Comment recevoir des paiements par Wave ou Orange Money ?",
    answer: "Lors de la création ou l'envoi d'une facture, le client reçoit un lien de paiement contenant un Code QR et des boutons d'action directs pour régler immédiatement via l'application Wave ou Orange Money. Le solde est crédité automatiquement sur votre portefeuille.",
  },
  {
    question: "Quel est le délai pour retirer l'argent vers mon compte bancaire ?",
    answer: "Les retraits vers Wave et Orange Money sont instantanés (moins de 1 minute). Les virements bancaires vers votre compte (RIB) prennent 24 à 48 heures ouvrables.",
  },
  {
    question: "Comment télécharger une facture ou un reçu au format PDF ?",
    answer: "Rendez-vous dans la section Factures, cliquez sur la facture souhaitée puis sur le bouton 'Télécharger PDF' ou 'Imprimer' en haut à droite.",
  },
  {
    question: "Les factures sont-elles conformes à la réglementation fiscale au Sénégal ?",
    answer: "Oui, toutes les factures incluent la mention du NINEA, du Registre du Commerce (RCCM), le détail de la TVA (18%) et le montant total en FCFA.",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSent, setTicketSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && message) {
      setTicketSent(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setTicketSent(false), 4000);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Toast Notification */}
      {ticketSent && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Votre demande d'assistance a été envoyée. Un conseiller vous répondra sous 2h !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Aide & Support</h2>
        <p className="text-muted-foreground">Besoin d'aide ? Consultez notre FAQ ou contactez notre équipe d'assistance dédiée au Sénégal.</p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Assistance Téléphonique</h4>
            <p className="text-xs text-muted-foreground">Du Lundi au Samedi de 8h à 20h</p>
            <p className="text-sm font-mono font-bold text-primary mt-2">+221 33 824 00 00</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1dc3f7]/30 bg-[#1dc3f7]/5 p-6 shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 bg-[#1dc3f7]/20 text-[#008db9] rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Support WhatsApp Direct</h4>
            <p className="text-xs text-muted-foreground">Réponse rapide via WhatsApp</p>
            <p className="text-sm font-mono font-bold text-[#008db9] mt-2">+221 77 123 45 67</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Support par Email</h4>
            <p className="text-xs text-muted-foreground">Traitement sous 2 heures</p>
            <p className="text-sm font-mono font-bold text-emerald-600 mt-2">support@senesaas.sn</p>
          </div>
        </div>
      </div>

      {/* Grid: FAQ & Ticket Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-foreground hover:bg-accent/50 transition-colors"
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Envoyer un message</h3>
              <p className="text-xs text-muted-foreground">Une question spécifique ? Laissez-nous un message.</p>
            </div>
          </div>

          <form onSubmit={handleSendTicket} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Sujet de la demande</label>
              <input
                type="text"
                required
                placeholder="Ex: Question sur l'intégration Wave"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Message / Détails</label>
              <textarea
                required
                rows={4}
                placeholder="Décrivez votre demande en détail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] mt-2"
            >
              <Send className="w-4 h-4" />
              Envoyer la demande
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
