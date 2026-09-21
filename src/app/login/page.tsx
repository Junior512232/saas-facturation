"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    // Demo: try to login with demo credentials or show a message
    const result = await login("demo@izifacture.sn", "Demo1234!");
    if (result.error) {
      setError("Le compte démo n'est pas disponible. Créez votre propre compte.");
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
            Solution SaaS de facturation pour l'Afrique de l'Ouest
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Gérez vos factures et encaissez par Wave & OM.
          </h1>

          <p className="text-primary-foreground/80 text-base leading-relaxed">
            Créez des factures professionnelles, suivez vos clients et recevez des paiements automatiques en FCFA sans effort.
          </p>

          <div className="flex flex-col gap-3 pt-4 border-t border-white/10 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Conforme NINEA & TVA 18% au Sénégal</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Retraits instantanés vers Wave et Orange Money</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-primary-foreground/70 flex items-center justify-between">
          <span>© 2026 iziFacture Inc.</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Sécurisé SSL 256-bit</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="md:w-1/2 p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Connexion</h2>
            <p className="text-sm text-muted-foreground mt-1">Accédez à votre espace entreprise iziFacture.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.sn"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mot de passe</label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connexion...</>
              ) : (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-center font-medium">
                {error}
              </p>
            )}
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Connexion rapide en Mode Démo (1-Clic)
            </button>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Créer un compte entreprise
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
