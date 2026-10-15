// ─── Types ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = "paid" | "sent" | "draft" | "overdue";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  ninea?: string;
  rccm?: string;
  taxId?: string;
  totalInvoices: number;
  totalPaid: number;
  createdAt: string;
  initials: string;
  color: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: string;
  clientEmail: string;
  clientNinea?: string;
  clientRccm?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxRate: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
}

export type PaymentStatus = "completed" | "pending" | "failed";

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string; // resolved from relation
  clientId: string; // resolved from relation
  clientName: string; // resolved from relation
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  status: PaymentStatus;
}

// ─── Products & Stocks ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  trackStock: boolean;
  unit: string;
  imageUrl?: string;
  createdAt: string;
}

export type StockMovementType = "in" | "out" | "adjustment" | "return";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType?: "sale" | "invoice" | "manual_adjustment";
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

// ─── Sales (Ventes Directes) ──────────────────────────────────────────────────

export interface SaleItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  clientId?: string;
  customerName: string;
  paymentMethod: "cash" | "wave" | "om" | "card" | "bank_transfer";
  subtotal: number;
  taxAmount: number;
  total: number;
  totalCost: number;
  margin: number;
  items: SaleItem[];
  notes?: string;
  createdAt: string;
}

// ─── Company Stamp & Signature Settings ───────────────────────────────────────

export interface CompanySettings {
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  ninea?: string;
  rccm?: string;
  currency: string;
  defaultTaxRate: number;
  companyLogoUrl?: string;
  companyStampUrl?: string;
  companySignatureUrl?: string;
  companySignatoryName?: string;
  useStampOnDocuments: boolean;
  useSignatureOnDocuments: boolean;
}

// ─── Extension Paie & RH ──────────────────────────────────────────────────────

export interface Employee {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  position: string;
  department: string;
  baseSalary: number;
  contractType: "CDI" | "CDD" | "Stage" | "Prestation";
  hireDate: string;
  paymentMethod: "wave" | "om" | "bank_transfer" | "cash";
  accountNumber?: string;
  status: "active" | "on_leave" | "terminated";
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  position?: string;
  department?: string;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  transportAllowance?: number;
  bonus: number;
  ipresDeduction?: number;
  cssDeduction?: number;
  taxDeduction?: number;
  deductions: number;
  netSalary: number;
  status: "draft" | "pending" | "paid";
  paymentMethod?: "wave" | "om" | "bank_transfer" | "cash";
  paymentDate?: string;
  notes?: string;
}

// ─── CRM & Pipeline ──────────────────────────────────────────────────────────

export type DealStage = "prospect" | "contact" | "proposal" | "negotiation" | "won" | "lost";

export interface Deal {
  id: string;
  title: string;
  companyName: string;
  contactName: string;
  email?: string;
  phone: string;
  estimatedValue: number;
  stage: DealStage;
  priority: "low" | "medium" | "high";
  expectedCloseDate: string;
  notes?: string;
  createdAt: string;
  convertedInvoiceId?: string;
}

// ─── WhatsApp Relances ───────────────────────────────────────────────────────

export interface WhatsAppReminderTemplate {
  id: string;
  name: string;
  level: "friendly" | "due" | "urgent";
  subject: string;
  template: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const statusStyles: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-700 border-transparent",
  sent: "bg-orange-100 text-orange-700 border-transparent",
  draft: "bg-gray-100 text-gray-700 border-transparent",
  overdue: "bg-red-100 text-red-700 border-transparent",
};

export const statusLabels: Record<InvoiceStatus, string> = {
  paid: "Payée",
  sent: "Envoyée",
  draft: "Brouillon",
  overdue: "En retard",
};
