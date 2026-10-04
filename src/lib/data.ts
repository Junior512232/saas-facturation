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
