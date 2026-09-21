"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Building2, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  FileText
} from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [ninea, setNinea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("L'adresse email doit être une adresse @gmail.com.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await register(companyName, email, phone, password, ninea);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left Banner */}
      <div className="md:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        {/* Brand */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 group w-fit">
          <div className="w-10 h-10 rounded-2xl bg-brand-red flex items-center justify-center text-white shadow-red-glow/40 transition-transform group-hover:scale-95 duration-200">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 5h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7zm9 3a1 1 0 000 2h3a1 1 0 100-2h-3z"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
              izi<span className="text-brand-red">Facture</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/70 font-bold -mt-1">Zone OHADA • UEMOA</span>
          </div>
        </Link>

        {/* Hero Info */}
        <div className="relative z-10 my-auto py-12 flex flex-col gap-6 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            Création de compte entreprise gratuit
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Commencez à facturer vos clients en 2 minutes.
          </h1>

          <p className="text-primary-foreground/80 text-base leading-relaxed">
            Rejoignez les centaines d'entreprises qui utilisent iziFacture pour automatiser leur facturation et leurs encaissements Mobile Money.
          </p>

          <div className="flex flex-col gap-3 pt-4 border-t border-white/10 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Génération instantanée de factures PDF</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Module d'encaissement Wave & Orange Money inclus</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/70 flex items-center justify-between">
          <span>© 2026 iziFacture Inc.</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Données chiffrées</span>
        </div>
      </div>

      {/* Right Register Form */}
      <div className="md:w-1/2 p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Créer un compte</h2>
            <p className="text-sm text-muted-foreground mt-1">Configurez votre compte professionnel iziFacture.</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Nom de l'entreprise / Commerce</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Ex: SeneSaaS SARL"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Email (@gmail.com)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="votre.nom@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Téléphone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="+221 77..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">NINEA (Optionnel)</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="0089234..."
                    value={ninea}
                    onChange={(e) => setNinea(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-center font-medium mt-2">
                {error}
              </p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] mt-2"
            >
              {loading ? "Création du compte..." : "Créer mon compte entreprise"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-2">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
