"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  FileText,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegisterContent() {
  const router = useRouter();
  const { register, resendConfirmationEmail } = useAuth();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "gratuit";
  
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ninea, setNinea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Veuillez saisir une adresse email valide (ex: contact@societe.com).");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await register(companyName, email, phone, password, ninea, plan);
    if (result.error) {
      setError(result.error);
    } else if (result.needsEmailConfirmation) {
      setNeedsConfirmation(true);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    const res = await resendConfirmationEmail(email);
    if (res.error) {
      setResendStatus("⚠️ Erreur : " + res.error);
    } else {
      setResendStatus("✅ Un nouvel email de confirmation a été envoyé !");
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-indigo-600 selection:text-white">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-violet-600/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à l'accueil</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-white">
            izi<span className="text-indigo-400">Flow</span>
          </span>
        </Link>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-lg mx-auto my-auto z-10 py-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl relative">
          {needsConfirmation ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
                <Mail className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Compte créé avec succès !</span>
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Vérifiez votre boîte email
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Un email contenant un lien de validation a été envoyé à :<br />
                  <strong className="text-white font-mono bg-slate-800/80 px-2 py-0.5 rounded text-xs mt-1 inline-block">{email}</strong>
                </p>
              </div>

              {/* Spam Warning Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span>⚠️ Vous ne le trouvez pas ?</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed text-[11px]">
                  Pensez à vérifier votre dossier <strong>Spams / Courriers indésirables</strong>. L'expéditeur est généralement <code className="bg-amber-950/40 px-1 py-0.5 rounded">noreply@mail.app.supabase.io</code>.
                </p>
              </div>

              {resendStatus && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${resendStatus.includes("✅") ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300" : "bg-rose-500/15 border border-rose-500/30 text-rose-300"}`}>
                  {resendStatus}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Ouvrir Gmail</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {resending ? "Envoi..." : "Renvoyer l'email"}
                  </Button>

                  <Link
                    href="/login"
                    className="py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <span>Se connecter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setNeedsConfirmation(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 underline pt-2 block mx-auto transition-colors"
                >
                  Revenir au formulaire ou corriger l'email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Création de Compte Entreprise Gratuit</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Démarrez avec iziFlow 🚀
                </h1>
                <p className="text-xs text-slate-400">
                  Automatisez vos ventes, factures et gestion de stock en quelques clics.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Nom de l'Entreprise ou du Commerce *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Cansaas Agency SARL"
                      className="pl-10 text-xs sm:text-sm bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Adresse Email Professionnelle *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@votre-entreprise.com"
                      className="pl-10 text-xs sm:text-sm bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Téléphone Mobile *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <Input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+221 77 123 45 67"
                        className="pl-10 text-xs sm:text-sm bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      NINEA / RCCM (Optionnel)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <Input
                        type="text"
                        value={ninea}
                        onChange={(e) => setNinea(e.target.value)}
                        placeholder="001234567 2V3"
                        className="pl-10 text-xs sm:text-sm bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Mot de Passe (6 caractères min) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pl-10 pr-10 text-xs sm:text-sm bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Création de votre espace en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Créer mon compte entreprise</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {error && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center font-medium">
                    {error}
                  </p>
                )}
              </form>

              <div className="text-center pt-6 mt-6 border-t border-slate-800 text-xs text-slate-400">
                Vous avez déjà un compte ?{" "}
                <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 underline">
                  Se connecter
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Security Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[10px] text-slate-500 z-10 flex items-center justify-center gap-2 py-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Chiffrement SSL 256-bit • Données conformes Système Comptable OHADA</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Chargement...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
