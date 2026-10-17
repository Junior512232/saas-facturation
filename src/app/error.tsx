"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for diagnostics
    console.error("App Render Error [Digest]:", error.digest, error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-sm border border-destructive/20">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        Une erreur inattendue est survenue
      </h2>
      
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        L&apos;application a rencontré une interruption lors du chargement. Si le problème persiste, vérifiez les variables de configuration ou rechargez la page.
        {error.digest && (
          <span className="block mt-2 font-mono text-xs text-muted-foreground/80 bg-muted px-2 py-1 rounded inline-block">
            Code d&apos;erreur (digest) : {error.digest}
          </span>
        )}
      </p>

      <div className="flex items-center gap-3">
        <Button 
          onClick={() => reset()} 
          className="gap-2 bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow"
        >
          <RotateCcw className="w-4 h-4" />
          Réessayer
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  );
}
