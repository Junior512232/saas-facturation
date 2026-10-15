"use client";

import { useState, useRef, useEffect } from "react";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { 
  FileCheck2, 
  PenTool, 
  Upload, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Stamp, 
  Eye, 
  Palette, 
  RotateCcw,
  Save,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SignatureSettingsPage() {
  const { companySettings, updateCompanySettings } = useAppData();
  const { user } = useAuth();

  const [signatoryName, setSignatoryName] = useState(
    companySettings?.companySignatoryName || user?.name || "La Direction Générale"
  );
  const [signatoryRole, setSignatoryRole] = useState("Directeur Général");
  const [legalMention, setLegalMention] = useState("Bon pour accord et certification conforme");
  const [useStamp, setUseStamp] = useState(companySettings?.useStampOnDocuments ?? true);
  const [useSignature, setUseSignature] = useState(companySettings?.useSignatureOnDocuments ?? true);

  // Signature image & stamp image
  const [stampUrl, setStampUrl] = useState<string | null>(companySettings?.companyStampUrl || null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(companySettings?.companySignatureUrl || null);

  // Stamp generator options
  const [stampColor, setStampColor] = useState<string>("#1e3a8a"); // bleu encre
  const [stampShape, setStampShape] = useState<"round" | "rect">("round");

  // Canvas drawing ref for interactive signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [activeSignMode, setActiveSignMode] = useState<"draw" | "upload">("draw");

  const [savedToast, setSavedToast] = useState(false);

  // Setup drawing canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high DPI resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
  }, [activeSignMode]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureUrl(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSignatureUrl(null);
  };

  // Upload handlers
  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSignatureUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadStamp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setStampUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Automatic Stamp SVG
  const generateOfficialStamp = () => {
    const company = companySettings?.companyName || user?.name || "iziFlow SARL";
    const ninea = companySettings?.ninea || user?.ninea || "RC/SN-DKR-2024";

    let svgDataUrl = "";
    if (stampShape === "round") {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
          <circle cx="100" cy="100" r="92" fill="none" stroke="${stampColor}" stroke-width="4" stroke-dasharray="8 3" opacity="0.85"/>
          <circle cx="100" cy="100" r="84" fill="none" stroke="${stampColor}" stroke-width="2"/>
          <circle cx="100" cy="100" r="54" fill="none" stroke="${stampColor}" stroke-width="1.5"/>
          
          <!-- Curved text path -->
          <path id="circlePathTop" d="M 25,100 A 75,75 0 0,1 175,100" fill="none" />
          <path id="circlePathBottom" d="M 175,100 A 75,75 0 0,1 25,100" fill="none" />

          <text fill="${stampColor}" font-family="sans-serif" font-weight="900" font-size="11" letter-spacing="2">
            <textPath href="#circlePathTop" startOffset="50%" text-anchor="middle">
              ${company.toUpperCase().slice(0, 28)}
            </textPath>
          </text>

          <text fill="${stampColor}" font-family="sans-serif" font-weight="bold" font-size="9" letter-spacing="1">
            <textPath href="#circlePathBottom" startOffset="50%" text-anchor="middle">
              ★ DAKAR - SÉNÉGAL ★
            </textPath>
          </text>

          <!-- Center Text -->
          <text x="100" y="88" fill="${stampColor}" font-family="sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="1">
            DIRECTION
          </text>
          <text x="100" y="103" fill="${stampColor}" font-family="sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="1">
            GÉNÉRALE
          </text>
          <text x="100" y="118" fill="${stampColor}" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle">
            ${ninea.slice(0, 15)}
          </text>
        </svg>
      `;
      svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } else {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" width="240" height="120">
          <rect x="5" y="5" width="230" height="110" rx="8" fill="none" stroke="${stampColor}" stroke-width="3" stroke-dasharray="6 2" opacity="0.9"/>
          <rect x="12" y="12" width="216" height="96" rx="4" fill="none" stroke="${stampColor}" stroke-width="1.5"/>
          <text x="120" y="42" fill="${stampColor}" font-family="sans-serif" font-weight="900" font-size="13" text-anchor="middle" letter-spacing="1.5">
            ${company.toUpperCase().slice(0, 24)}
          </text>
          <line x1="30" y1="52" x2="210" y2="52" stroke="${stampColor}" stroke-width="1"/>
          <text x="120" y="70" fill="${stampColor}" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">
            DIRECTION GÉNÉRALE
          </text>
          <text x="120" y="88" fill="${stampColor}" font-family="monospace" font-size="9" text-anchor="middle">
            NINEA : ${ninea}
          </text>
        </svg>
      `;
      svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    setStampUrl(svgDataUrl);
  };

  // Save all settings
  const handleSave = async () => {
    await updateCompanySettings({
      companySignatoryName: signatoryName,
      companyStampUrl: stampUrl || undefined,
      companySignatureUrl: signatureUrl || undefined,
      useStampOnDocuments: useStamp,
      useSignatureOnDocuments: useSignature,
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Signature et cachet enregistrés avec succès !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Signature & Cachet d'Entreprise
            </h1>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs py-0.5">
              Certifié OHADA
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Personnalisez le tampon officiel et la signature numérique apposés en bas de vos factures et devis.
          </p>
        </div>

        <Button
          onClick={handleSave}
          className="rounded-xl flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          Enregistrer les modifications
        </Button>
      </div>

      {/* Main Grid : Left Config, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Section 1: Cachet Officiel */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">1. Cachet / Tampon Officiel</h3>
                  <p className="text-xs text-muted-foreground">Apposé pour sceller juridiquement les documents.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">Activer</label>
                <input
                  type="checkbox"
                  checked={useStamp}
                  onChange={(e) => setUseStamp(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Stamp preview & generator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Box 1: Generate Automatic Stamp */}
              <div className="p-4 rounded-2xl border border-dashed border-border bg-muted/30 flex flex-col justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full mb-2">
                    <Sparkles className="w-3 h-3" /> Recommandé
                  </span>
                  <h4 className="text-xs font-bold text-foreground">Générateur de Tampon Officiel</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Générez un cachet officiel conforme avec vos mentions légales (NINEA, Ville, Direction).
                  </p>
                </div>

                {/* Color & Shape Selectors */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Couleur encre :</span>
                    {[
                      { color: "#1e3a8a", label: "Bleu classique" },
                      { color: "#4338ca", label: "Indigo" },
                      { color: "#065f46", label: "Vert" },
                      { color: "#111827", label: "Noir" },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setStampColor(c.color)}
                        style={{ backgroundColor: c.color }}
                        className={`w-5 h-5 rounded-full transition-transform ${stampColor === c.color ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"}`}
                        title={c.label}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Forme :</span>
                    <button
                      type="button"
                      onClick={() => setStampShape("round")}
                      className={`px-2 py-0.5 rounded-lg font-semibold ${stampShape === "round" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      Circulaire
                    </button>
                    <button
                      type="button"
                      onClick={() => setStampShape("rect")}
                      className={`px-2 py-0.5 rounded-lg font-semibold ${stampShape === "rect" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      Rectangulaire
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={generateOfficialStamp}
                  className="rounded-xl text-xs font-bold w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Stamp className="w-3.5 h-3.5 mr-1.5" />
                  Générer le cachet officiel
                </Button>
              </div>

              {/* Box 2: Current Stamp or Upload */}
              <div className="p-4 rounded-2xl border border-border bg-card flex flex-col items-center justify-center text-center relative group min-h-[160px]">
                {stampUrl ? (
                  <>
                    <img
                      src={stampUrl}
                      alt="Tampon d'entreprise"
                      className="max-h-28 object-contain transition-transform group-hover:scale-105"
                    />
                    <button
                      onClick={() => setStampUrl(null)}
                      title="Supprimer ce cachet"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-2">
                    <Upload className="w-6 h-6 text-muted-foreground mb-1.5" />
                    <span className="text-xs font-bold text-foreground">Téléverser votre tampon scanné</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">PNG transparent recommandé</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleUploadStamp}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Signature Numérique */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">2. Signature Numérique</h3>
                  <p className="text-xs text-muted-foreground">Tracez votre signature au doigt ou à la souris.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">Activer</label>
                <input
                  type="checkbox"
                  checked={useSignature}
                  onChange={(e) => setUseSignature(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-bold w-fit">
              <button
                type="button"
                onClick={() => setActiveSignMode("draw")}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeSignMode === "draw" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Tracer à l'écran
              </button>
              <button
                type="button"
                onClick={() => setActiveSignMode("upload")}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeSignMode === "upload" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Importer une image
              </button>
            </div>

            {/* Draw mode */}
            {activeSignMode === "draw" ? (
              <div className="flex flex-col gap-2">
                <div className="relative border-2 border-dashed border-border rounded-2xl bg-white dark:bg-card overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 cursor-crosshair touch-none"
                  />
                  {!hasDrawn && !signatureUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/60 text-xs">
                      Signez ici avec votre souris ou votre doigt...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    Astuce : tracez une signature fluide et nette.
                  </span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-muted-foreground hover:text-rose-600 transition-colors font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Effacer
                  </button>
                </div>
              </div>
            ) : (
              /* Upload mode */
              <div className="p-6 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center text-center">
                {signatureUrl ? (
                  <div className="relative group">
                    <img src={signatureUrl} alt="Signature" className="max-h-24 object-contain" />
                    <button
                      onClick={() => setSignatureUrl(null)}
                      className="absolute -top-2 -right-2 p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-6 h-6 text-muted-foreground mb-1.5" />
                    <span className="text-xs font-bold text-foreground">Importer une signature scannée</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Format PNG transparent idéal</span>
                    <input type="file" accept="image/*" onChange={handleUploadSignature} className="hidden" />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Signatory Details */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">3. Informations du Signataire Légal</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Nom du Signataire *
                </label>
                <Input
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="Ex: Moustapha Faye"
                  className="rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Titre / Fonction *
                </label>
                <Input
                  value={signatoryRole}
                  onChange={(e) => setSignatoryRole(e.target.value)}
                  placeholder="Ex: Gérant & Directeur Général"
                  className="rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Mention de validation (au-dessus de la signature)
              </label>
              <Input
                value={legalMention}
                onChange={(e) => setLegalMention(e.target.value)}
                placeholder="Ex: Bon pour accord et certification conforme"
                className="rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Preview Card: 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="sticky top-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-lg flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Aperçu en direct sur document</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Rendu Facture & PDF
              </span>
            </div>

            {/* Mini invoice representation */}
            <div className="rounded-2xl border border-border/80 bg-background p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              <div>
                {/* Header preview */}
                <div className="flex items-start justify-between border-b border-border/60 pb-3 mb-4">
                  <div>
                    <p className="text-xs font-extrabold text-foreground">{companySettings?.companyName || user?.name || "iziFlow SARL"}</p>
                    <p className="text-[10px] text-muted-foreground">NINEA : {companySettings?.ninea || user?.ninea || "001234567 2V3"}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono">FACTURE #2026-042</Badge>
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground mb-6">
                  <p>Client : <strong>CANSAAS AGENCY</strong></p>
                  <p>Montant Net : <span className="font-mono font-bold text-foreground">1 500 000 FCFA</span></p>
                </div>
              </div>

              {/* Endorsement stamp & signature block */}
              <div className="pt-4 border-t-2 border-border/70 mt-auto">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                  <span className="font-semibold uppercase tracking-wider">{legalMention}</span>
                  <span className="font-mono text-[9px] text-muted-foreground/80">Dakar, le 15/10/2026</span>
                </div>

                {/* Stamp + Signature Overlay Container */}
                <div className="relative h-28 rounded-xl bg-muted/20 border border-border/40 p-2 flex items-center justify-between overflow-hidden">
                  {/* Left Signatory text */}
                  <div className="z-10 flex flex-col justify-end h-full">
                    <p className="text-[10px] font-bold text-foreground">Pour l'entreprise :</p>
                    <p className="text-xs font-black text-foreground">{signatoryName}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{signatoryRole}</p>
                  </div>

                  {/* Stamp placement (behind or overlapping) */}
                  {useStamp && stampUrl && (
                    <div className="absolute right-24 top-1/2 -translate-y-1/2 z-0 opacity-85 rotate-[-8deg] pointer-events-none">
                      <img
                        src={stampUrl}
                        alt="Cachet"
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  )}

                  {/* Signature placement */}
                  {useSignature && signatureUrl && (
                    <div className="z-10 absolute right-4 bottom-2 pointer-events-none">
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="h-16 max-w-[140px] object-contain drop-shadow-sm"
                      />
                    </div>
                  )}

                  {!useStamp && !useSignature && (
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground italic">
                      Signature et cachet désactivés sur les documents.
                    </div>
                  )}
                </div>

                {/* Legal compliance watermark */}
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] text-muted-foreground font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Document certifié conforme • Signature électronique iziFlow</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full rounded-xl text-xs font-bold py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Appliquer à toutes les factures
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
