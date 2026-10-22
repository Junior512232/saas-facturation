import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, CheckCircle2, Mail, Phone, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité & Protection des Données - iziFlow",
  description: "Politique de confidentialité et de protection des données à caractère personnel de la plateforme iziFlow, conforme à la loi sénégalaise CDP et aux standards de sécurité bancaire.",
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protection des Données • Conforme CDP Sénégal & UEMOA</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-slate-400">
            Dernière mise à jour : <strong>22 Octobre 2026</strong> • Applicable à l'ensemble des données traitées par <strong>iziFlow</strong>.
          </p>
        </div>

        {/* Introduction Alert */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-slate-300 text-sm leading-relaxed space-y-2">
          <p>
            Chez <strong>iziFlow</strong>, la confidentialité et la sécurité des données financières et commerciales de votre entreprise sont notre priorité absolue. Nous nous engageons à protéger vos informations conformément aux dispositions de la <strong>Loi n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel</strong> (CDP - Sénégal) ainsi qu'aux normes internationales de cybersécurité.
          </p>
          <p>
            Cette politique détaille la nature des informations collectées, la manière dont elles sont traitées en toute sécurité et les droits dont vous disposez.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
            Responsable du Traitement des Données
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Le responsable du traitement des données à caractère personnel est la structure <strong>iziFlow Technologies</strong>, domiciliée à Dakar, République du Sénégal.
            </p>
            <p>
              Pour toute demande concernant la gestion de vos données ou pour contacter notre délégué à la protection des données, vous pouvez nous écrire à l'adresse électronique dédiée : <strong>contact@iziflow.sn</strong>.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
            Données Collectées et Nature des Informations
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-3">
            <p>Dans le cadre de l'exécution de nos services SaaS, nous collectons strictement les données nécessaires au bon fonctionnement de votre outil de gestion :</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <p className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Données d'identification de l'entreprise
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dénomination sociale, nom du dirigeant, adresse email de connexion, numéro de téléphone, NINEA, RCCM, adresse physique et pays.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <p className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Données commerciales & de facturation
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Factures émises, devis, tickets de caisse, catalogue d'articles en stock, prix, coordonnées des clients finaux et fiches de paie.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <p className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Actifs graphiques & certifications
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Logo de votre entreprise, signature numérique et image du cachet commercial déposés pour certification sur vos documents PDF.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <p className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Données techniques & de sécurité
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Adresse IP de connexion, type de navigateur, horodatage des opérations et journaux d'audit pour prévenir les fraudes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
            Sécurité des Paiements Bancaires & Mobile Money
          </h2>
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-sm text-slate-300 leading-relaxed space-y-2">
            <p className="font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              Zéro stockage de coordonnées bancaires sur nos serveurs
            </p>
            <p>
              Les règlements en ligne (abonnements iziFlow ou règlements de vos factures clients via Wave, Orange Money et Cartes Bancaires) sont traités de façon entièrement externalisée et sécurisée par des opérateurs de paiement certifiés et agréés par la Banque Centrale (BCEAO) :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li><strong>Bictorys Technologies & Wave Digital Finance :</strong> processeurs certifiés PCI-DSS Niveau 1 assurant le chiffrement de bout en bout des transactions.</li>
              <li>À aucun moment iziFlow n'a accès à votre code secret Wave, code PIN Orange Money ou aux 16 chiffres de votre carte bancaire.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
            Finalités du Traitement des Données
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>Vos données sont collectées exclusivement afin de :</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Permettre l'exécution du contrat de service (génération de factures conformes, gestion du stock, calcul des marges).</li>
              <li>Transmettre à vos clients les liens de paiement sécurisés et factures PDF par WhatsApp ou email à votre demande.</li>
              <li>Fournir l'assistance technique et le support client réactif 7j/7.</li>
              <li>Assurer la sécurité de l'infrastructure et la détection d'éventuelles activités frauduleuses.</li>
            </ul>
            <p className="text-emerald-400 font-medium pt-1">
              👉 En aucun cas vos données commerciales ou listes de clients ne sont vendues, louées ou cédées à des régies publicitaires tierces.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">5</span>
            Mesures de Sécurité & Hébergement Cloud
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Nous appliquons des standards de sécurité de niveau bancaire :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Chiffrement en transit et au repos :</strong> Toutes les communications sont chiffrées en TLS 1.3 (HTTPS 256-bit). Les bases de données sont chiffrées au repos (AES-256).</li>
              <li><strong>Isolation Row Level Security (RLS) :</strong> Chaque entreprise dispose d'un espace hermétiquement isolé au niveau de la base de données PostgreSQL de Supabase. Aucun utilisateur ne peut accéder aux données comptables d'une autre entité.</li>
              <li><strong>Sauvegardes redondantes :</strong> Sauvegardes automatisées quotidiennes sur des serveurs hautement sécurisés.</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">6</span>
            Vos Droits d'Accès, de Rectification et de Suppression
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Conformément à la législation applicable sur les données personnelles, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Droit d'accès et d'export :</strong> Vous pouvez consulter et exporter l'intégralité de vos factures et clients à tout moment.</li>
              <li><strong>Droit de rectification :</strong> Vous pouvez corriger vos informations d'entreprise directement dans la rubrique Paramètres.</li>
              <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression définitive de votre compte et de toutes les données associées en envoyant un email à <strong>contact@iziflow.sn</strong>.</li>
            </ul>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 border-t border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">7</span>
            Contact & Exercice de vos Droits
          </h2>
          <p className="text-sm text-slate-300">
            Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits légaux :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href="mailto:contact@iziflow.sn"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors flex items-center gap-3 text-sm text-slate-200"
            >
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-xs text-white">Écrire au DPO</p>
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
                <p className="font-bold text-xs text-white">Assistance WhatsApp</p>
                <p className="text-slate-400 text-xs">+221 77 493 73 49</p>
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
            <Link href="/cgu" className="text-slate-400 hover:text-white">CGU</Link>
            <Link href="/privacy" className="text-emerald-400 hover:underline">Confidentialité</Link>
            <Link href="/" className="text-slate-400 hover:text-white">Accueil</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
