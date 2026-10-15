"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ExtensionItem {
  id: string;
  name: string;
  description: string;
  category: "commerce" | "finance" | "hr" | "communication" | "legal";
  categoryLabel: string;
  iconName: string;
  route: string;
  badge?: string;
  defaultEnabled: boolean;
  enabled: boolean;
  stats?: string;
}

const DEFAULT_EXTENSIONS: ExtensionItem[] = [
  {
    id: "stocks",
    name: "Stocks & Inventaire",
    description: "Gestion des articles, mouvements d'entrées/sorties, alertes rupture de stock et valorisation du stock en temps réel.",
    category: "commerce",
    categoryLabel: "Commerce & Logistique",
    iconName: "Package",
    route: "/inventory",
    badge: "Indispensable",
    defaultEnabled: true,
    enabled: true,
    stats: "Suivi en temps réel",
  },
  {
    id: "sales",
    name: "Ventes & Caisse Rapide",
    description: "Prise de commande comptoir, encaissement direct (Cash, Wave, OM) et déstockage instantané.",
    category: "commerce",
    categoryLabel: "Commerce & Logistique",
    iconName: "ShoppingBag",
    route: "/sales",
    badge: "Nouveau",
    defaultEnabled: true,
    enabled: true,
    stats: "Encaissement 1-clic",
  },
  {
    id: "stamp_signature",
    name: "Signature & Cachet d'Entreprise",
    description: "Incrustation du cachet officiel et signature électronique certifiée sur les factures, devis et reçus.",
    category: "legal",
    categoryLabel: "Juridique & Conformité",
    iconName: "FileCheck2",
    route: "/settings/signature",
    badge: "OHADA Conforme",
    defaultEnabled: true,
    enabled: true,
    stats: "Sécurisation légale",
  },
  {
    id: "payroll",
    name: "Paie & Ressources Humaines",
    description: "Édition des fiches de paie conformes, gestion des employés, acomptes sur salaires et suivi de la masse salariale.",
    category: "hr",
    categoryLabel: "Ressources Humaines",
    iconName: "Briefcase",
    route: "/payroll",
    badge: "Pro",
    defaultEnabled: true,
    enabled: true,
    stats: "Bulletins conformes",
  },
  {
    id: "crm",
    name: "CRM & Pipeline Commercial",
    description: "Suivi des opportunités et prospects en vue Kanban, historique des échanges et conversion directe en clients facturés.",
    category: "commerce",
    categoryLabel: "Commerce & Logistique",
    iconName: "UserCheck",
    route: "/crm",
    badge: "Business",
    defaultEnabled: true,
    enabled: true,
    stats: "Vue Kanban",
  },
  {
    id: "whatsapp",
    name: "Relances & Envois WhatsApp",
    description: "Envoi en 1 clic des factures PDF et liens de paiement Wave/OM directement sur le WhatsApp de vos clients.",
    category: "communication",
    categoryLabel: "Communication",
    iconName: "MessageCircle",
    route: "/settings/whatsapp",
    badge: "Gain de temps",
    defaultEnabled: true,
    enabled: true,
    stats: "Taux d'ouverture 98%",
  },
  {
    id: "financial_reports",
    name: "Rapports Financiers & P&L",
    description: "Compte de résultat synthétique, marges commerciales, TVA collectée et export prêt pour l'expert-comptable.",
    category: "finance",
    categoryLabel: "Finance & Pilotage",
    iconName: "TrendingUp",
    route: "/reports",
    badge: "Stratégique",
    defaultEnabled: true,
    enabled: true,
    stats: "Export comptable",
  },
];

const STORAGE_KEY = "iziflow_extensions_state_v1";

interface ExtensionsContextType {
  extensions: ExtensionItem[];
  isExtensionEnabled: (id: string) => boolean;
  toggleExtension: (id: string) => void;
  enableExtension: (id: string) => void;
  disableExtension: (id: string) => void;
  activeCount: number;
  resetExtensions: () => void;
}

const ExtensionsContext = createContext<ExtensionsContextType | undefined>(undefined);

export function ExtensionsProvider({ children }: { children: React.ReactNode }) {
  const [extensions, setExtensions] = useState<ExtensionItem[]>(DEFAULT_EXTENSIONS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Record<string, boolean> = JSON.parse(stored);
        setExtensions((prev) =>
          prev.map((ext) => ({
            ...ext,
            enabled: parsed[ext.id] !== undefined ? parsed[ext.id] : ext.defaultEnabled,
          }))
        );
      }
    } catch (e) {
      console.error("Error loading extensions state:", e);
    }
    setMounted(true);
  }, []);

  const saveToStorage = (updated: ExtensionItem[]) => {
    const map = updated.reduce<Record<string, boolean>>((acc, curr) => {
      acc[curr.id] = curr.enabled;
      return acc;
    }, {});
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      console.error("Error saving extensions state:", e);
    }
  };

  const toggleExtension = (id: string) => {
    setExtensions((prev) => {
      const updated = prev.map((ext) => (ext.id === id ? { ...ext, enabled: !ext.enabled } : ext));
      saveToStorage(updated);
      return updated;
    });
  };

  const enableExtension = (id: string) => {
    setExtensions((prev) => {
      const updated = prev.map((ext) => (ext.id === id ? { ...ext, enabled: true } : ext));
      saveToStorage(updated);
      return updated;
    });
  };

  const disableExtension = (id: string) => {
    setExtensions((prev) => {
      const updated = prev.map((ext) => (ext.id === id ? { ...ext, enabled: false } : ext));
      saveToStorage(updated);
      return updated;
    });
  };

  const resetExtensions = () => {
    setExtensions(DEFAULT_EXTENSIONS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const isExtensionEnabled = (id: string): boolean => {
    const ext = extensions.find((e) => e.id === id);
    return ext ? ext.enabled : false;
  };

  const activeCount = extensions.filter((e) => e.enabled).length;

  return (
    <ExtensionsContext.Provider
      value={{
        extensions,
        isExtensionEnabled,
        toggleExtension,
        enableExtension,
        disableExtension,
        activeCount,
        resetExtensions,
      }}
    >
      {children}
    </ExtensionsContext.Provider>
  );
}

export function useExtensions() {
  const context = useContext(ExtensionsContext);
  if (!context) {
    throw new Error("useExtensions must be used within an ExtensionsProvider");
  }
  return context;
}
