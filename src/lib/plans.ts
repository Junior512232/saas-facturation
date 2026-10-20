/**
 * Système centralisé de gestion des forfaits et barrières de fonctionnalités (Feature Gating)
 * Tarification & Quotas conformes à la grille iziFacture
 */

export type PlanType = "gratuit" | "pro" | "business";

export interface PlanLimits {
  name: string;
  priceFCFA: number;
  maxInvoicesPerMonth: number;
  maxTicketsPerMonth: number;
  maxProducts: number;
  maxPayrollsPerMonth: number;
  hasCrm: boolean;
  hasAdvancedReports: boolean;
  hasCustomBranding: boolean;
  hasSignature: boolean;
  hasWhatsappReminders: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  gratuit: {
    name: "Gratuit",
    priceFCFA: 0,
    maxInvoicesPerMonth: 5,
    maxTicketsPerMonth: 15,
    maxProducts: 10,
    maxPayrollsPerMonth: 1,
    hasCrm: false,
    hasAdvancedReports: false,
    hasCustomBranding: false,
    hasSignature: false,
    hasWhatsappReminders: false,
  },
  pro: {
    name: "Pro",
    priceFCFA: 10000,
    maxInvoicesPerMonth: 150,
    maxTicketsPerMonth: Infinity,
    maxProducts: Infinity,
    maxPayrollsPerMonth: 5,
    hasCrm: false,
    hasAdvancedReports: false,
    hasCustomBranding: true,
    hasSignature: true,
    hasWhatsappReminders: true,
  },
  business: {
    name: "Business",
    priceFCFA: 25000,
    maxInvoicesPerMonth: Infinity,
    maxTicketsPerMonth: Infinity,
    maxProducts: Infinity,
    maxPayrollsPerMonth: 25,
    hasCrm: true,
    hasAdvancedReports: true,
    hasCustomBranding: true,
    hasSignature: true,
    hasWhatsappReminders: true,
  },
};

/**
 * Normalise le plan de l'utilisateur (fallback sur 'gratuit' si null/invalide)
 */
export function normalizePlan(plan?: string | null): PlanType {
  const p = (plan || "").toLowerCase().trim();
  if (p === "business") return "business";
  if (p === "pro") return "pro";
  return "gratuit";
}

/**
 * Récupère les limites et fonctionnalités associées au plan
 */
export function getPlanLimits(plan?: string | null): PlanLimits {
  return PLAN_LIMITS[normalizePlan(plan)];
}

/**
 * Vérifie si l'utilisateur peut créer une nouvelle facture
 */
export function canCreateInvoice(
  countThisMonth: number,
  plan?: string | null
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getPlanLimits(plan);
  const remaining = Math.max(0, limits.maxInvoicesPerMonth - countThisMonth);
  return {
    allowed: countThisMonth < limits.maxInvoicesPerMonth,
    limit: limits.maxInvoicesPerMonth,
    remaining,
  };
}

/**
 * Vérifie si l'utilisateur peut émettre un ticket de caisse POS
 */
export function canCreateTicket(
  countThisMonth: number,
  plan?: string | null
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getPlanLimits(plan);
  const remaining = Math.max(0, limits.maxTicketsPerMonth - countThisMonth);
  return {
    allowed: countThisMonth < limits.maxTicketsPerMonth,
    limit: limits.maxTicketsPerMonth,
    remaining,
  };
}

/**
 * Vérifie si l'utilisateur peut ajouter un article en stock
 */
export function canAddProduct(
  currentProductCount: number,
  plan?: string | null
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getPlanLimits(plan);
  const remaining = Math.max(0, limits.maxProducts - currentProductCount);
  return {
    allowed: currentProductCount < limits.maxProducts,
    limit: limits.maxProducts,
    remaining,
  };
}

/**
 * Vérifie si l'utilisateur peut générer un bulletin de paie ce mois-ci
 */
export function canAddPayroll(
  countThisMonth: number,
  plan?: string | null
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getPlanLimits(plan);
  const remaining = Math.max(0, limits.maxPayrollsPerMonth - countThisMonth);
  return {
    allowed: countThisMonth < limits.maxPayrollsPerMonth,
    limit: limits.maxPayrollsPerMonth,
    remaining,
  };
}

/**
 * Vérifie si une fonctionnalité spécifique est débloquée
 */
export function hasFeature(
  feature: "hasCrm" | "hasAdvancedReports" | "hasCustomBranding" | "hasSignature" | "hasWhatsappReminders",
  plan?: string | null
): boolean {
  const limits = getPlanLimits(plan);
  return Boolean(limits[feature]);
}
