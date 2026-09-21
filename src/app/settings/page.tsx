"use client";

import { useState } from "react";
import { 
  Building, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Key, 
  Save, 
  CheckCircle2, 
  Globe, 
  Mail, 
  Phone, 
  Smartphone 
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"company" | "payment" | "notifications" | "api">("company");
  const [saved, setSaved] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("SeneSaaS SARL");
  const [ninea, setNinea] = useState("00892341-2G3");
  const [rccm, setRccm] = useState("SN-DKR-2023-B-1234");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [email, setEmail] = useState("contact@senesaas.sn");
  const [phone, setPhone] = useState("+221 33 824 00 00");
  const [address, setAddress] = useState("Almadies, Dakar, Sénégal");
  const [currency, setCurrency] = useState("FCFA");
  const [tvaRate, setTvaRate] = useState("18");

  // Toggle states
  const [autoReminder, setAutoReminder] = useState(true);
  const [smsNotify, setSmsNotify] = useState(true);
  const [waveWebhook, setWaveWebhook] = useState(true);
  const [omWebhook, setOmWebhook] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Toast Notification */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Paramètres mis à jour avec succès !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Paramètres</h2>
        <p className="text-muted-foreground">Configurez votre entreprise, vos intégrations Wave & Orange Money et vos préférences.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto text-sm">
        <button
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "company" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Building className="w-4 h-4" />
          Entreprise
        </button>

        <button
          onClick={() => setActiveTab("payment")}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "payment" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Facturation & Devises
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "api" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Key className="w-4 h-4" />
          Clés API Wave / OM
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "notifications" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications & Relances
        </button>
      </div>

      {/* Settings Forms */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Company Settings */}
        {activeTab === "company" && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-foreground">Profil de l'Entreprise</h3>
              <p className="text-xs text-muted-foreground">Ces informations apparaîtront sur vos factures imprimées et téléchargeables en PDF.</p>
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Logo de l'entreprise (Optionnel)</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-border bg-white" />
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 text-muted-foreground text-xs font-medium">Logo</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-xl bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Nom de l'entreprise</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">NINEA</label>
                <input
                  type="text"
                  required
                  value={ninea}
                  onChange={(e) => setNinea(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Registre du Commerce (RCCM)</label>
                <input
                  type="text"
                  required
                  value={rccm}
                  onChange={(e) => setRccm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Email Professionnel</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Adresse du Siège Social</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment & Currency Settings */}
        {activeTab === "payment" && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-foreground">Préférences de Facturation & TVA</h3>
              <p className="text-xs text-muted-foreground">Définissez la monnaie et le taux de taxe par défaut pour vos factures.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Devise Principale</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="FCFA">FCFA (Franc CFA - XOF)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Taux de TVA (%)</label>
                <input
                  type="number"
                  value={tvaRate}
                  onChange={(e) => setTvaRate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* API & Webhooks Settings */}
        {activeTab === "api" && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-foreground">Intégrations API Mobile Money</h3>
              <p className="text-xs text-muted-foreground">Gérez vos identifiants marchands et webhooks pour la réception automatique des paies Wave & Orange Money.</p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Wave API */}
              <div className="p-5 border border-[#1dc3f7]/30 bg-[#1dc3f7]/5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/Wave.webp" alt="Wave" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-foreground">Clé API Wave Senegal</h4>
                      <p className="text-xs text-muted-foreground">Paiement instantané par QR Code / Lien</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full">Active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">Marchand ID</label>
                    <input type="text" readOnly value="WAVE-SENE-9842" className="w-full px-3 py-2 border border-border rounded-xl bg-background font-mono text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">Clé Secrète (API Key)</label>
                    <input type="password" readOnly value="wv_live_892348923498239" className="w-full px-3 py-2 border border-border rounded-xl bg-background font-mono text-xs" />
                  </div>
                </div>
              </div>

              {/* Orange Money API */}
              <div className="p-5 border border-[#ff6600]/30 bg-[#ff6600]/5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/om.webp" alt="Orange Money" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-foreground">Clé API Orange Money</h4>
                      <p className="text-xs text-muted-foreground">Paiement Web / USSD Pass</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full">Active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">Client ID</label>
                    <input type="text" readOnly value="OM-SN-PRO-4412" className="w-full px-3 py-2 border border-border rounded-xl bg-background font-mono text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">Token Webhook</label>
                    <input type="password" readOnly value="om_wh_secret_772183921" className="w-full px-3 py-2 border border-border rounded-xl bg-background font-mono text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-foreground">Relances & Notifications</h3>
              <p className="text-xs text-muted-foreground">Paramétrez l'envoi automatique des SMS et emails de rappel pour les factures impayées.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Relances automatiques des factures en retard</h4>
                  <p className="text-xs text-muted-foreground">Envoyer un rappel après 3 jours d'échéance dépassée.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoReminder(!autoReminder)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${autoReminder ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${autoReminder ? "left-6" : "left-0.5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Notification SMS lors du paiement client</h4>
                  <p className="text-xs text-muted-foreground">Recevez un SMS instantané lorsque Wave ou OM valide un règlement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsNotify(!smsNotify)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${smsNotify ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${smsNotify ? "left-6" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
