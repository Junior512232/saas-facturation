import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, Scale, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation (CGU) - iziFlow",
  description: "Conditions Générales d'Utilisation et de Vente de la plateforme SaaS iziFlow, conforme au droit commercial OHADA et à la législation sénégalaise.",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30">
              iF
            </div>
            <span className="text-base font-black tracking-tight text-white">
              izi<span className="text-indigo-400">Flow</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-5 py-12 w-full space-y-10">
        {/* Page Title */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cadre Juridique & Commercial Conforme OHADA</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Conditions Générales d'Utilisation (CGU)
          </h1>
          <p className="text-sm text-slate-400">
            Dernière mise à jour : <strong>22 Octobre 2026</strong> • Applicable à l'ensemble des utilisateurs de la plateforme <strong>iziFlow</strong>.
          </p>
        </div>

        {/* Introduction Alert */}
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-slate-300 text-sm leading-relaxed space-y-2">
          <p>
            Bienvenue sur <strong>iziFlow</strong>, la suite logicielle tout-en-un de gestion commerciale, facturation conforme OHADA, gestion des stocks, caisse point de vente (POS) et paie, éditée à destination des entreprises, indépendants et commerçants d'Afrique francophone (UEMOA / CEMAC).
          </p>
          <p>
            L'accès et l'utilisation de nos services sont subordonnés à l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation. En créant un compte ou en utilisant le service, vous acceptez d'être lié par ces dispositions.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">1</span>
            Mentions Légales & Éditeur de la Plateforme
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              La plateforme <strong>iziFlow</strong> (accessible via le site web et ses sous-domaines) est éditée et exploitée par l'équipe <strong>iziFlow Technologies</strong>, basée à Dakar, Sénégal.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Contact officiel :</strong> contact@iziflow.sn</li>
              <li><strong>Support client & WhatsApp :</strong> +221 77 493 73 49 (7j/7)</li>
              <li><strong>Hébergement applicatif sécurisé :</strong> Vercel Inc. et Supabase Inc. (infrastructures cloud certifiées ISO 27001 et SOC 2 Type II avec chiffrement SSL/TLS).</li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">2</span>
            Description des Services
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              iziFlow met à la disposition des professionnels un environnement applicatif en mode SaaS (Software as a Service) comprenant notamment :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>L'édition, la personnalisation et l'émission de factures, devis, avoirs et reçus fiscaux intégrant le NINEA, le RCCM et le calcul de la TVA.</li>
              <li>L'apposition de signatures électroniques et de cachets commerciaux d'entreprise certifiés.</li>
              <li>Un terminal de caisse rapide (POS) avec impression de tickets thermiques et gestion des règlements en espèces et mobile money.</li>
              <li>La gestion des stocks en temps réel avec suivi des mouvements, alertes de seuil critique et valorisation marchande.</li>
              <li>La génération de fiches de paie conformes au Système Comptable OHADA et au Code du Travail (cotisations IPRES, CSS, retenue d'impôt).</li>
              <li>L'intégration de liens et boutons de paiement instantané via Wave, Orange Money et Mobile Money via des passerelles agréées (Bictorys).</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">3</span>
            Inscription, Compte & Sécurité des Accès
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Pour accéder aux fonctionnalités du service, l'utilisateur doit créer un compte entreprise en fournissant des informations exactes, sincères et à jour (dénomination sociale, adresse email professionnelle, numéro de téléphone joignable).
            </p>
            <p>
              L'utilisateur est seul responsable de la préservation de la confidentialité de son mot de passe et de tous les actes accomplis depuis son espace de gestion. Toute utilisation frauduleuse constatée doit être signalée sans délai à l'adresse <strong>contact@iziflow.sn</strong>.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">4</span>
            Abonnements, Tarifs & Modalités de Paiement
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              iziFlow propose une formule d'accès gratuite ainsi que des formules payantes avec souscription mensuelle ou annuelle (forfaits Pro et Business).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Tarification :</strong> Les tarifs en vigueur sont affichés sur la page officielle en Francs CFA (FCFA) toutes taxes applicables comprises.</li>
              <li><strong>Règlement :</strong> Les paiements d'abonnement s'effectuent en ligne via Mobile Money (Wave, Orange Money, Free Money) ou Carte Bancaire sécurisée via notre partenaire de paiement agréé Bictorys.</li>
              <li><strong>Activation immédiate :</strong> Le surclassement vers les quotas illimités est déclenché instantanément dès confirmation automatique de la transaction par le webhook de paiement.</li>
              <li><strong>Résiliation :</strong> L'utilisateur peut résilier son abonnement payant à tout moment depuis son tableau de bord Paramètres &gt; Abonnement sans frais cachés.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">5</span>
            Conformité Fiscale et Responsabilité OHADA
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              iziFlow fournit des outils conformes aux standards de facturation et de comptabilité de l'espace OHADA. Toutefois :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>L'utilisateur est personnellement responsable de l'exactitude des informations fiscales saisies (numéro NINEA, RCCM, assujettissement à la TVA).</li>
              <li>iziFlow n'intervient pas en qualité d'expert-comptable ou de conseiller fiscal assermenté. L'utilisateur demeure garant de ses déclarations officielles auprès de la Direction Générale des Impôts et Domaines (DGID) ou de l'administration fiscale compétente de son pays.</li>
              <li>Toute utilisation de la plateforme à des fins de fraude fiscale, émission de fausses factures ou blanchiment d'argent est formellement interdite et donnera lieu à la clôture immédiate du compte.</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">6</span>
            Disponibilité du Service & Sauvegarde des Données
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              iziFlow met en œuvre tous les moyens raisonnables pour assurer une disponibilité de la plateforme 24h/24 et 7j/7 avec un objectif de taux de disponibilité supérieur à 99,5 %.
            </p>
            <p>
              Des opérations de maintenance technique peuvent intervenir exceptionnellement afin d'améliorer les performances ou la sécurité. Les données des utilisateurs font l'objet de sauvegardes quotidiennes chiffrées et redondantes.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">7</span>
            Droit Applicable & Juridiction Compétente
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Les présentes Conditions Générales d'Utilisation sont régies et interprétées conformément au <strong>droit de la République du Sénégal</strong> ainsi qu'aux <strong>Actes Uniformes de l'OHADA</strong> applicables au commerce et aux sociétés commerciales.
            </p>
            <p>
              En cas de litige relatif à l'interprétation, la validité ou l'exécution des présentes et à défaut d'accord amiable entre les parties, compétence expresse et exclusive est attribuée aux tribunaux compétents du ressort du <strong>Tribunal de Commerce de Dakar</strong>.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 border-t border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">8</span>
            Contact & Assistance
          </h2>
          <p className="text-sm text-slate-300">
            Pour toute question concernant les présentes conditions ou pour solliciter notre équipe juridique, contactez-nous :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href="mailto:contact@iziflow.sn"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-colors flex items-center gap-3 text-sm text-slate-200"
            >
              <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="font-bold text-xs text-white">Par Email</p>
                <p className="text-slate-400 text-xs">contact@iziflow.sn</p>
              </div>
            </a>
            <a
              href="https://wa.me/221774937349"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors flex items-center gap-3 text-sm text-slate-200"
            >
              <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-xs text-white">Par WhatsApp</p>
                <p className="text-slate-400 text-xs">+221 77 493 73 49 (7j/7)</p>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 iziFlow Technologies. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/cgu" className="text-indigo-400 hover:underline">CGU</Link>
            <Link href="/privacy" className="text-slate-400 hover:text-white">Confidentialité</Link>
            <Link href="/" className="text-slate-400 hover:text-white">Accueil</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
