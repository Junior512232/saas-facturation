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

// ─── Mock Clients ────────────────────────────────────────────────────────────

export const clients: Client[] = [
  {
    id: "c1",
    name: "Cansaas Agency",
    email: "contact@cansaas.com",
    phone: "+221 77 123 45 67",
    address: "123 Rue de Dakar",
    city: "Dakar",
    country: "Sénégal",
    taxId: "SN-TAX-20230001",
    totalInvoices: 8,
    totalPaid: 12500000,
    createdAt: "15/01/2025",
    initials: "CA",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "c2",
    name: "Tech Africa",
    email: "hello@techafrica.sn",
    phone: "+221 78 987 65 43",
    address: "45 Avenue Bourguiba",
    city: "Dakar",
    country: "Sénégal",
    taxId: "SN-TAX-20230042",
    totalInvoices: 5,
    totalPaid: 7800000,
    createdAt: "03/03/2025",
    initials: "TA",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "c3",
    name: "Mamadou Sy",
    email: "m.sy@gmail.com",
    phone: "+221 76 555 44 33",
    address: "Liberté 6, Villa 12",
    city: "Dakar",
    country: "Sénégal",
    totalInvoices: 3,
    totalPaid: 950000,
    createdAt: "22/05/2025",
    initials: "MS",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "c4",
    name: "Dakar Innovate",
    email: "contact@dakar-innovate.com",
    phone: "+221 77 222 11 00",
    address: "Route de Ngor, Imm. Horizon",
    city: "Dakar",
    country: "Sénégal",
    taxId: "SN-TAX-20240015",
    totalInvoices: 6,
    totalPaid: 4300000,
    createdAt: "10/07/2025",
    initials: "DI",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "c5",
    name: "Africorp Solutions",
    email: "finance@africorp.ci",
    phone: "+225 07 123 456 78",
    address: "Plateau, Imm. Trade Center",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    taxId: "CI-TAX-20230099",
    totalInvoices: 12,
    totalPaid: 24600000,
    createdAt: "05/11/2024",
    initials: "AS",
    color: "bg-red-100 text-red-700",
  },
  {
    id: "c6",
    name: "Groupe Ndiaye",
    email: "direction@ndiaye-groupe.sn",
    phone: "+221 77 888 99 00",
    address: "Point E, Rue 12",
    city: "Dakar",
    country: "Sénégal",
    taxId: "SN-TAX-20221107",
    totalInvoices: 4,
    totalPaid: 6200000,
    createdAt: "12/08/2024",
    initials: "GN",
    color: "bg-teal-100 text-teal-700",
  },
];

// ─── Mock Invoices ───────────────────────────────────────────────────────────

export const invoices: Invoice[] = [
  {
    id: "inv1",
    number: "INV-2026-001",
    clientId: "c1",
    client: "Cansaas Agency",
    clientEmail: "contact@cansaas.com",
    issueDate: "02/09/2026",
    dueDate: "17/09/2026",
    amount: 2500000,
    taxRate: 18,
    status: "paid",
    items: [
      { id: "i1", description: "Développement site web vitrine", quantity: 1, unitPrice: 1500000 },
      { id: "i2", description: "Maintenance mensuelle (3 mois)", quantity: 3, unitPrice: 250000 },
      { id: "i3", description: "Formation équipe (2 jours)", quantity: 2, unitPrice: 125000 },
    ],
    notes: "Merci pour votre confiance. Paiement reçu.",
  },
  {
    id: "inv2",
    number: "INV-2026-002",
    clientId: "c2",
    client: "Tech Africa",
    clientEmail: "hello@techafrica.sn",
    issueDate: "01/09/2026",
    dueDate: "16/09/2026",
    amount: 1500000,
    taxRate: 18,
    status: "sent",
    items: [
      { id: "i4", description: "Audit système informatique", quantity: 1, unitPrice: 800000 },
      { id: "i5", description: "Rapport d'analyse et recommandations", quantity: 1, unitPrice: 700000 },
    ],
    notes: "Paiement sous 15 jours.",
  },
  {
    id: "inv3",
    number: "INV-2026-003",
    clientId: "c3",
    client: "Mamadou Sy",
    clientEmail: "m.sy@gmail.com",
    issueDate: "28/08/2026",
    dueDate: "12/09/2026",
    amount: 450000,
    taxRate: 18,
    status: "overdue",
    items: [
      { id: "i6", description: "Conception logo & identité visuelle", quantity: 1, unitPrice: 300000 },
      { id: "i7", description: "Cartes de visite (500 ex.)", quantity: 1, unitPrice: 150000 },
    ],
  },
  {
    id: "inv4",
    number: "INV-2026-004",
    clientId: "c4",
    client: "Dakar Innovate",
    clientEmail: "contact@dakar-innovate.com",
    issueDate: "25/08/2026",
    dueDate: "09/09/2026",
    amount: 800000,
    taxRate: 18,
    status: "draft",
    items: [
      { id: "i8", description: "Stratégie digitale Q4 2026", quantity: 1, unitPrice: 500000 },
      { id: "i9", description: "Gestion réseaux sociaux (1 mois)", quantity: 1, unitPrice: 300000 },
    ],
    notes: "Brouillon en cours de révision.",
  },
  {
    id: "inv5",
    number: "INV-2026-005",
    clientId: "c5",
    client: "Africorp Solutions",
    clientEmail: "finance@africorp.ci",
    issueDate: "20/08/2026",
    dueDate: "04/09/2026",
    amount: 3200000,
    taxRate: 18,
    status: "paid",
    items: [
      { id: "i10", description: "Développement application mobile iOS/Android", quantity: 1, unitPrice: 2500000 },
      { id: "i11", description: "Hébergement serveur (12 mois)", quantity: 12, unitPrice: 58333 },
    ],
    notes: "Paiement complet reçu. Merci.",
  },
  {
    id: "inv6",
    number: "INV-2026-006",
    clientId: "c6",
    client: "Groupe Ndiaye",
    clientEmail: "direction@ndiaye-groupe.sn",
    issueDate: "15/08/2026",
    dueDate: "30/08/2026",
    amount: 1800000,
    taxRate: 18,
    status: "sent",
    items: [
      { id: "i12", description: "Système de gestion interne (ERP)", quantity: 1, unitPrice: 1800000 },
    ],
    notes: "En attente de validation finale du client.",
  },
  {
    id: "inv7",
    number: "INV-2026-007",
    clientId: "c1",
    client: "Cansaas Agency",
    clientEmail: "contact@cansaas.com",
    issueDate: "10/08/2026",
    dueDate: "25/08/2026",
    amount: 950000,
    taxRate: 18,
    status: "paid",
    items: [
      { id: "i13", description: "Campagne Google Ads (1 mois)", quantity: 1, unitPrice: 600000 },
      { id: "i14", description: "Rapport performance mensuel", quantity: 1, unitPrice: 350000 },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getClientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((inv) => inv.id === id);
}

export function getInvoicesByClientId(clientId: string): Invoice[] {
  return invoices.filter((inv) => inv.clientId === clientId);
}

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
