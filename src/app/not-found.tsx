import Link from "next/link";
import { ArrowLeft, Home, FileText, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-600 selection:text-white p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30">
            iF
          </div>
          <span className="text-base font-black tracking-tight text-white">
            izi<span className="text-indigo-400">Flow</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Accueil</span>
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="max-w-md w-full mx-auto my-auto text-center space-y-6 z-10 py-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Search className="w-3.5 h-3.5" />
            <span>Erreur 404 • Page introuvable</span>
          </div>

          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 tracking-tight">
            404
          </h1>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Oups ! Cette page n'existe pas
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            La page que vous recherchez a peut-être été déplacée, renommée ou n'a jamais existé.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Tableau de bord</span>
            </Button>
          </Link>

          <Link href="/invoices/new" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-slate-800 hover:bg-slate-900 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Créer une facture</span>
            </Button>
          </Link>
        </div>

        {/* Support Link */}
        <div className="pt-4 border-t border-slate-900 text-xs text-slate-500">
          Un problème persistant ?{" "}
          <a
            href="https://wa.me/221774937349?text=Bonjour%20iziFlow,%20je%20rencontre%20une%20erreur%20404%20sur%20le%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Contactez notre assistance WhatsApp</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-600 z-10 py-3">
        © 2026 iziFlow Technologies. Tous droits réservés.
      </footer>
    </div>
  );
}
