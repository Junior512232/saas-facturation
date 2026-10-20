"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthContext";
import type { 
  Client, 
  Invoice, 
  InvoiceStatus, 
  InvoiceItem, 
  Payment, 
  PaymentStatus,
  Product,
  StockMovement,
  Sale,
  CompanySettings,
  Employee,
  Payroll,
  Deal,
  DealStage
} from "@/lib/data";

// Re-export types for convenience
export type { 
  Client, 
  Invoice, 
  InvoiceStatus, 
  Payment, 
  PaymentStatus,
  Product,
  StockMovement,
  Sale,
  CompanySettings,
  Employee,
  Payroll,
  Deal,
  DealStage
};

interface AppDataContextProps {
  clientsList: Client[];
  invoicesList: Invoice[];
  transactionsList: Payment[];
  productsList: Product[];
  salesList: Sale[];
  stockMovementsList: StockMovement[];
  companySettings: CompanySettings | null;
  employeesList: Employee[];
  payrollsList: Payroll[];
  dealsList: Deal[];
  loading: boolean;
  addClient: (client: Omit<Client, "id" | "totalInvoices" | "totalPaid" | "createdAt" | "initials" | "color">) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, "id" | "status"> & { status?: InvoiceStatus }) => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, quantityDelta: number, reason: string) => Promise<void>;
  addSale: (sale: Omit<Sale, "id" | "createdAt">) => Promise<void>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addPayroll: (payroll: Omit<Payroll, "id">) => Promise<void>;
  updatePayrollStatus: (id: string, status: "draft" | "pending" | "paid", paymentMethod?: "wave" | "om" | "bank_transfer" | "cash", paymentDate?: string) => Promise<void>;
  addDeal: (deal: Omit<Deal, "id" | "createdAt">) => Promise<void>;
  updateDealStage: (id: string, stage: DealStage) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;

  getClientById: (id: string) => Client | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getProductById: (id: string) => Product | undefined;
  getInvoicesByClientId: (clientId: string) => Invoice[];
  refreshData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextProps | undefined>(undefined);

const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-700",
  "bg-teal-100 text-teal-700",
];

function makeInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words[0]?.length >= 2) return (words[0][0] + words[0][1]).toUpperCase();
  return "NA";
}

// Map Supabase row → Client
function rowToClient(row: Record<string, unknown>, allInvoices: Invoice[] = []): Client {
  const clientInvoices = allInvoices.filter(inv => inv.clientId === row.id);
  const totalInvoices = clientInvoices.length;
  const totalPaid = clientInvoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);

  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) || "",
    address: (row.address as string) || "",
    city: (row.city as string) || "",
    country: (row.country as string) || "Sénégal",
    taxId: (row.tax_id as string) || undefined,
    totalInvoices,
    totalPaid,
    createdAt: new Date(row.created_at as string).toLocaleDateString("fr-FR"),
    initials: (row.initials as string) || makeInitials(row.name as string),
    color: (row.color as string) || COLORS[0],
  };
}

// Map Supabase row → Invoice
function rowToInvoice(row: Record<string, unknown>): Invoice {
  const issueDate = row.issue_date as string;
  const dueDate = row.due_date as string;
  const clientData = row.clients as { name?: string; email?: string } | undefined;
  return {
    id: row.id as string,
    number: (row.invoice_number as string) || (row.number as string) || "",
    clientId: (row.client_id as string) || "",
    client: clientData?.name || (row.client_name as string) || "Client inconnu",
    clientEmail: clientData?.email || (row.client_email as string) || "",
    issueDate: issueDate ? new Date(issueDate).toLocaleDateString("fr-FR") : "",
    dueDate: dueDate ? new Date(dueDate).toLocaleDateString("fr-FR") : "",
    amount: (row.total as number) || (row.amount as number) || 0,
    taxRate: (row.tax_rate as number) || 18,
    status: (row.status as InvoiceStatus) || "draft",
    items: ((row.invoice_items || row.items) as any[])?.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price || item.unitPrice,
    })) || [],
    notes: (row.notes as string) || undefined,
  };
}

// Map Supabase row → Payment
function rowToPayment(row: Record<string, unknown>): Payment {
  const invoiceData = row.invoices as Record<string, unknown> | undefined;
  const clientData = invoiceData?.clients as { name?: string; id?: string } | undefined;
  
  return {
    id: row.id as string,
    invoiceId: row.invoice_id as string,
    invoiceNumber: (invoiceData?.invoice_number as string) || "N/A",
    clientId: (clientData?.id as string) || "",
    clientName: (clientData?.name as string) || "Client inconnu",
    amount: row.amount as number,
    paymentMethod: (row.payment_method as string) || "Non spécifié",
    transactionId: (row.transaction_id as string) || "",
    paymentDate: row.payment_date ? new Date(row.payment_date as string).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "",
    status: (row.status as PaymentStatus) || "completed",
  };
}

// Parse DD/MM/YYYY → YYYY-MM-DD for Supabase
function parseDateForDB(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  // Already ISO format
  if (dateStr.includes("-") && dateStr.length === 10) return dateStr;
  // DD/MM/YYYY
  const [d, m, y] = dateStr.split("/");
  if (d && m && y) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return null;
}

// Map Supabase row → Product
function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: (row.name as string) || "Article sans nom",
    sku: (row.sku as string) || undefined,
    category: (row.category as string) || "Général",
    purchasePrice: Number(row.purchase_price) || 0,
    sellingPrice: Number(row.selling_price) || 0,
    stockQuantity: Number(row.stock_quantity) || 0,
    minStockAlert: Number(row.min_stock_alert) || 5,
    trackStock: row.track_stock !== false,
    unit: (row.unit as string) || "unité",
    imageUrl: (row.image_url as string) || undefined,
    createdAt: row.created_at ? new Date(row.created_at as string).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
  };
}

// Map Supabase row → Sale
function rowToSale(row: Record<string, unknown>): Sale {
  return {
    id: row.id as string,
    saleNumber: (row.sale_number as string) || "VTE-001",
    clientId: (row.client_id as string) || undefined,
    customerName: (row.customer_name as string) || "Client de passage",
    paymentMethod: (row.payment_method as any) || "cash",
    subtotal: Number(row.subtotal) || 0,
    taxAmount: Number(row.tax_amount) || 0,
    total: Number(row.total) || 0,
    totalCost: Number(row.total_cost) || 0,
    margin: Number(row.margin) || 0,
    items: ((row.sale_items || row.items) as any[])?.map((item: any) => ({
      id: item.id,
      productId: item.product_id || item.productId,
      name: item.name,
      quantity: Number(item.quantity) || 1,
      purchasePrice: Number(item.purchase_price || item.purchasePrice) || 0,
      unitPrice: Number(item.unit_price || item.unitPrice) || 0,
      totalPrice: Number(item.total_price || item.totalPrice) || 0,
    })) || [],
    notes: (row.notes as string) || undefined,
    createdAt: row.created_at ? new Date(row.created_at as string).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString("fr-FR"),
  };
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Terminal TPE Wave & QR Code",
    sku: "TPE-WAVE-01",
    category: "Matériel Informatique",
    purchasePrice: 45000,
    sellingPrice: 75000,
    stockQuantity: 18,
    minStockAlert: 5,
    trackStock: true,
    unit: "unité",
    createdAt: "10/10/2026",
  },
  {
    id: "prod-2",
    name: "Rouleaux Papier Thermique 80mm (Pack x10)",
    sku: "PAP-TH-80",
    category: "Consommables",
    purchasePrice: 6000,
    sellingPrice: 12000,
    stockQuantity: 4,
    minStockAlert: 8, // En alerte stock faible !
    trackStock: true,
    unit: "pack",
    createdAt: "11/10/2026",
  },
  {
    id: "prod-3",
    name: "Lecteur Code-barres USB 2D",
    sku: "SCAN-USB-2D",
    category: "Matériel Informatique",
    purchasePrice: 22000,
    sellingPrice: 38000,
    stockQuantity: 12,
    minStockAlert: 3,
    trackStock: true,
    unit: "unité",
    createdAt: "12/10/2026",
  },
  {
    id: "prod-4",
    name: "Prestation Installation & Paramétrage iziFlow",
    sku: "SRV-INST-PRO",
    category: "Services",
    purchasePrice: 0,
    sellingPrice: 50000,
    stockQuantity: 999,
    minStockAlert: 0,
    trackStock: false, // Service sans déstockage
    unit: "prestation",
    createdAt: "12/10/2026",
  },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: "sale-1",
    saleNumber: "VTE-2026-001",
    customerName: "Boutique Le Relais",
    paymentMethod: "wave",
    subtotal: 150000,
    taxAmount: 27000,
    total: 177000,
    totalCost: 90000,
    margin: 60000,
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        name: "Terminal TPE Wave & QR Code",
        quantity: 2,
        purchasePrice: 45000,
        unitPrice: 75000,
        totalPrice: 150000,
      }
    ],
    createdAt: "14/10/2026 15:30",
  },
  {
    id: "sale-2",
    saleNumber: "VTE-2026-002",
    customerName: "Client de passage",
    paymentMethod: "cash",
    subtotal: 24000,
    taxAmount: 4320,
    total: 28320,
    totalCost: 12000,
    margin: 12000,
    items: [
      {
        id: "item-2",
        productId: "prod-2",
        name: "Rouleaux Papier Thermique 80mm (Pack x10)",
        quantity: 2,
        purchasePrice: 6000,
        unitPrice: 12000,
        totalPrice: 24000,
      }
    ],
    createdAt: "14/10/2026 17:15",
  }
];

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    fullName: "Moussa Diop",
    email: "moussa.diop@iziflow.sn",
    phone: "+221 77 450 12 34",
    position: "Responsable Commercial B2B",
    department: "Ventes & Marketing",
    baseSalary: 450000,
    contractType: "CDI",
    hireDate: "01/02/2024",
    paymentMethod: "wave",
    accountNumber: "+221 77 450 12 34",
    status: "active",
  },
  {
    id: "emp-2",
    fullName: "Fatou Kiné Ndiaye",
    email: "fatou.ndiaye@iziflow.sn",
    phone: "+221 78 320 55 66",
    position: "Comptable & Gestionnaire Paie",
    department: "Finance & Comptabilité",
    baseSalary: 550000,
    contractType: "CDI",
    hireDate: "15/05/2023",
    paymentMethod: "bank_transfer",
    accountNumber: "SN012 01001 12345678901 22",
    status: "active",
  },
  {
    id: "emp-3",
    fullName: "Ibrahima Fall",
    email: "ibrahima.fall@iziflow.sn",
    phone: "+221 76 612 88 90",
    position: "Développeur Fullstack",
    department: "Technologie & IT",
    baseSalary: 650000,
    contractType: "CDI",
    hireDate: "10/01/2024",
    paymentMethod: "wave",
    accountNumber: "+221 76 612 88 90",
    status: "active",
  },
  {
    id: "emp-4",
    fullName: "Aïssatou Sow",
    email: "aissatou.sow@iziflow.sn",
    phone: "+221 70 889 44 11",
    position: "Assistante Administrative",
    department: "Administration",
    baseSalary: 280000,
    contractType: "CDD",
    hireDate: "01/06/2024",
    paymentMethod: "om",
    accountNumber: "+221 70 889 44 11",
    status: "active",
  },
];

const DEFAULT_PAYROLLS: Payroll[] = [
  {
    id: "pay-1",
    employeeId: "emp-1",
    employeeName: "Moussa Diop",
    position: "Responsable Commercial B2B",
    department: "Ventes & Marketing",
    periodMonth: 10,
    periodYear: 2026,
    baseSalary: 450000,
    transportAllowance: 35000,
    bonus: 50000,
    ipresDeduction: 25200,
    cssDeduction: 0,
    taxDeduction: 42000,
    deductions: 67200,
    netSalary: 467800,
    status: "paid",
    paymentMethod: "wave",
    paymentDate: "10/10/2026",
    notes: "Prime de performance Q3 incluse",
  },
  {
    id: "pay-2",
    employeeId: "emp-2",
    employeeName: "Fatou Kiné Ndiaye",
    position: "Comptable & Gestionnaire Paie",
    department: "Finance & Comptabilité",
    periodMonth: 10,
    periodYear: 2026,
    baseSalary: 550000,
    transportAllowance: 35000,
    bonus: 0,
    ipresDeduction: 30800,
    taxDeduction: 58000,
    deductions: 88800,
    netSalary: 496200,
    status: "paid",
    paymentMethod: "bank_transfer",
    paymentDate: "10/10/2026",
  },
  {
    id: "pay-3",
    employeeId: "emp-3",
    employeeName: "Ibrahima Fall",
    position: "Développeur Fullstack",
    department: "Technologie & IT",
    periodMonth: 10,
    periodYear: 2026,
    baseSalary: 650000,
    transportAllowance: 35000,
    bonus: 25000,
    ipresDeduction: 36400,
    taxDeduction: 74000,
    deductions: 110400,
    netSalary: 599600,
    status: "pending",
    paymentMethod: "wave",
    notes: "Virement Wave programmé pour le 28",
  },
  {
    id: "pay-4",
    employeeId: "emp-4",
    employeeName: "Aïssatou Sow",
    position: "Assistante Administrative",
    department: "Administration",
    periodMonth: 10,
    periodYear: 2026,
    baseSalary: 280000,
    transportAllowance: 25000,
    bonus: 0,
    ipresDeduction: 15680,
    taxDeduction: 18500,
    deductions: 34180,
    netSalary: 270820,
    status: "pending",
    paymentMethod: "om",
  },
];

const DEFAULT_DEALS: Deal[] = [
  {
    id: "deal-1",
    title: "Équipement Caisse & Facturation 3 Magasins",
    companyName: "Groupe Alimentaire Dakarois",
    contactName: "Amadou Diallo",
    email: "a.diallo@gad-senegal.sn",
    phone: "+221 77 500 22 33",
    estimatedValue: 2450000,
    stage: "negotiation",
    priority: "high",
    expectedCloseDate: "25/10/2026",
    notes: "Négociation remise de 5% sur l'achat de 3 terminaux et licence annuelle.",
    createdAt: "05/10/2026",
  },
  {
    id: "deal-2",
    title: "Abonnement Annuel Suite Entreprise + Paie",
    companyName: "Société Sénégalaise de Transit (SST)",
    contactName: "Mariama Ba",
    email: "mba@sst-transit.sn",
    phone: "+221 78 911 44 22",
    estimatedValue: 1200000,
    stage: "proposal",
    priority: "medium",
    expectedCloseDate: "30/10/2026",
    notes: "Devis envoyé suite à la démo Zoom. En attente de validation DG.",
    createdAt: "08/10/2026",
  },
  {
    id: "deal-3",
    title: "Déploiement TPE & Facturation WhatsApp",
    companyName: "Clinique Médicale Les Mamelles",
    contactName: "Dr. Ousmane Kane",
    email: "dr.kane@clinique-mamelles.sn",
    phone: "+221 77 622 11 00",
    estimatedValue: 850000,
    stage: "won",
    priority: "high",
    expectedCloseDate: "12/10/2026",
    notes: "Contrat signé ! Facture d'acompte à émettre.",
    createdAt: "02/10/2026",
  },
  {
    id: "deal-4",
    title: "Formation Équipe Commerciale & Logiciel",
    companyName: "Cabinet Conseil Almadies",
    contactName: "Cheikh Tidiane Sy",
    email: "ct.sy@cabinet-almadies.com",
    phone: "+221 76 333 45 67",
    estimatedValue: 600000,
    stage: "contact",
    priority: "medium",
    expectedCloseDate: "05/11/2026",
    notes: "Échange téléphonique concluant, rendez-vous physique prévu jeudi.",
    createdAt: "12/10/2026",
  },
  {
    id: "deal-5",
    title: "Automatisation Devis BTP",
    companyName: "Entreprise Diop BTP",
    contactName: "Babacar Diop",
    email: "b.diop@diop-btp.sn",
    phone: "+221 70 411 99 88",
    estimatedValue: 3500000,
    stage: "prospect",
    priority: "high",
    expectedCloseDate: "15/11/2026",
    notes: "Formulaire web reçu, souhaite intégrer la signature électronique sur ses devis.",
    createdAt: "14/10/2026",
  },
];

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [transactionsList, setTransactionsList] = useState<Payment[]>([]);
  const [productsList, setProductsList] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [salesList, setSalesList] = useState<Sale[]>(DEFAULT_SALES);
  const [stockMovementsList, setStockMovementsList] = useState<StockMovement[]>([]);
  const [employeesList, setEmployeesList] = useState<Employee[]>(DEFAULT_EMPLOYEES);
  const [payrollsList, setPayrollsList] = useState<Payroll[]>(DEFAULT_PAYROLLS);
  const [dealsList, setDealsList] = useState<Deal[]>(DEFAULT_DEALS);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>({
    companyName: "iziFlow SARL",
    email: "contact@iziflow.sn",
    phone: "+221 77 123 45 67",
    ninea: "001234567 2V3",
    rccm: "SN-DKR-2024-B-12345",
    currency: "XOF",
    defaultTaxRate: 18,
    companyLogoUrl: undefined,
    companyStampUrl: undefined,
    companySignatureUrl: undefined,
    companySignatoryName: "La Direction Générale",
    useStampOnDocuments: true,
    useSignatureOnDocuments: true,
  });
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const supabase = createClient();

  // Load local cache if available
  useEffect(() => {
    try {
      const localProducts = localStorage.getItem("iziflow_products");
      if (localProducts) setProductsList(JSON.parse(localProducts));

      const localSales = localStorage.getItem("iziflow_sales");
      if (localSales) setSalesList(JSON.parse(localSales));

      const localSettings = localStorage.getItem("iziflow_company_settings");
      if (localSettings) setCompanySettings(JSON.parse(localSettings));

      const localEmployees = localStorage.getItem("iziflow_employees");
      if (localEmployees) setEmployeesList(JSON.parse(localEmployees));

      const localPayrolls = localStorage.getItem("iziflow_payrolls");
      if (localPayrolls) setPayrollsList(JSON.parse(localPayrolls));

      const localDeals = localStorage.getItem("iziflow_deals");
      if (localDeals) setDealsList(JSON.parse(localDeals));
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    if (!session?.user) {
      setClientsList([]);
      setInvoicesList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [{ data: clientsData }, { data: invoicesData }, { data: paymentsData }] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("*, clients(name, email), invoice_items(*)").order("created_at", { ascending: false }),
        supabase.from("payments").select("*, invoices(invoice_number, clients(id, name))").order("created_at", { ascending: false }),
      ]);
      const parsedInvoices = (invoicesData || []).map(rowToInvoice);
      setInvoicesList(parsedInvoices);
      setClientsList((clientsData || []).map(row => rowToClient(row, parsedInvoices)));
      setTransactionsList((paymentsData || []).map(rowToPayment));

      // Try fetching products if table exists
      try {
        const { data: prodData, error: prodErr } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (!prodErr && prodData && prodData.length > 0) {
          setProductsList(prodData.map(rowToProduct));
        }
      } catch {}

      // Try fetching sales if table exists
      try {
        const { data: salesData, error: salesErr } = await supabase.from("sales").select("*, sale_items(*)").order("created_at", { ascending: false });
        if (!salesErr && salesData && salesData.length > 0) {
          setSalesList(salesData.map(rowToSale));
        }
      } catch {}

      // Try fetching profile company stamp / signature settings
      try {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) {
          setCompanySettings((prev) => ({
            companyName: profileData.company_name || prev?.companyName || "Entreprise",
            email: profileData.email || prev?.email || "",
            phone: profileData.phone || prev?.phone,
            ninea: profileData.ninea || prev?.ninea,
            rccm: profileData.rccm || prev?.rccm,
            currency: profileData.currency || "XOF",
            defaultTaxRate: Number(profileData.default_tax_rate) || 18,
            companyLogoUrl: profileData.company_logo_url || prev?.companyLogoUrl,
            companyStampUrl: profileData.company_stamp_url || prev?.companyStampUrl,
            companySignatureUrl: profileData.company_signature_url || prev?.companySignatureUrl,
            companySignatoryName: profileData.company_signatory_name || prev?.companySignatoryName || "La Direction",
            useStampOnDocuments: profileData.use_stamp_on_documents !== false,
            useSignatureOnDocuments: profileData.use_signature_on_documents !== false,
          }));
        }
      } catch {}

    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addClient = async (newClientData: Omit<Client, "id" | "totalInvoices" | "totalPaid" | "createdAt" | "initials" | "color">) => {
    const initials = makeInitials(newClientData.name);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const { data, error } = await supabase
      .from("clients")
      .insert({
        profile_id: session!.user.id,
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone || null,
        address: newClientData.address || null,
        ninea: newClientData.taxId || null,
      })
      .select()
      .single();

    if (!error && data) {
      setClientsList((prev) => [rowToClient(data, invoicesList), ...prev]);
    }
  };

  const addInvoice = async (newInvoiceData: Omit<Invoice, "id" | "status"> & { status?: InvoiceStatus }) => {
    const taxRate = newInvoiceData.taxRate || 18;
    const subtotal = newInvoiceData.amount / (1 + taxRate / 100);
    const taxAmount = newInvoiceData.amount - subtotal;

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        profile_id: session!.user.id,
        invoice_number: newInvoiceData.number,
        client_id: newInvoiceData.clientId || null,
        issue_date: parseDateForDB(newInvoiceData.issueDate),
        due_date: parseDateForDB(newInvoiceData.dueDate),
        subtotal: subtotal,
        tax_amount: taxAmount,
        total: newInvoiceData.amount,
        status: newInvoiceData.status || "draft",
        notes: newInvoiceData.notes || null,
      })
      .select("*, clients(name, email)")
      .single();

    if (!error && data) {
      if (newInvoiceData.items && newInvoiceData.items.length > 0) {
        const itemsToInsert = newInvoiceData.items.map((item) => ({
          invoice_id: data.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        }));
        await supabase.from("invoice_items").insert(itemsToInsert);
      }

      setInvoicesList((prev) => [{ ...rowToInvoice(data), items: newInvoiceData.items || [] }, ...prev]);
    }
  };

  // ─── Products & Stocks Operations ──────────────────────────────────────────

  const addProduct = async (productData: Omit<Product, "id" | "createdAt">) => {
    const newProd: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toLocaleDateString("fr-FR"),
    };

    // Try Supabase insert
    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from("products")
          .insert({
            profile_id: session.user.id,
            name: productData.name,
            sku: productData.sku || null,
            category: productData.category || "Général",
            purchase_price: productData.purchasePrice,
            selling_price: productData.sellingPrice,
            stock_quantity: productData.stockQuantity,
            min_stock_alert: productData.minStockAlert,
            track_stock: productData.trackStock,
            unit: productData.unit,
            image_url: productData.imageUrl || null,
          })
          .select()
          .single();

        if (!error && data) {
          newProd.id = data.id;
        }
      } catch {}
    }

    setProductsList((prev) => {
      const updated = [newProd, ...prev];
      try { localStorage.setItem("iziflow_products", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (session?.user) {
      try {
        await supabase
          .from("products")
          .update({
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.sku !== undefined && { sku: updates.sku }),
            ...(updates.category !== undefined && { category: updates.category }),
            ...(updates.purchasePrice !== undefined && { purchase_price: updates.purchasePrice }),
            ...(updates.sellingPrice !== undefined && { selling_price: updates.sellingPrice }),
            ...(updates.stockQuantity !== undefined && { stock_quantity: updates.stockQuantity }),
            ...(updates.minStockAlert !== undefined && { min_stock_alert: updates.minStockAlert }),
            ...(updates.trackStock !== undefined && { track_stock: updates.trackStock }),
            ...(updates.unit !== undefined && { unit: updates.unit }),
          })
          .eq("id", id);
      } catch {}
    }

    setProductsList((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      try { localStorage.setItem("iziflow_products", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteProduct = async (id: string) => {
    if (session?.user) {
      try {
        await supabase.from("products").delete().eq("id", id);
      } catch {}
    }

    setProductsList((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try { localStorage.setItem("iziflow_products", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const adjustStock = async (productId: string, quantityDelta: number, reason: string) => {
    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stockQuantity + quantityDelta);
    await updateProduct(productId, { stockQuantity: newStock });

    // Record movement
    const movement: StockMovement = {
      id: `mov_${Date.now()}`,
      productId,
      productName: product.name,
      type: quantityDelta >= 0 ? "in" : "out",
      quantity: Math.abs(quantityDelta),
      previousStock: product.stockQuantity,
      newStock,
      referenceType: "manual_adjustment",
      notes: reason,
      createdAt: new Date().toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setStockMovementsList((prev) => [movement, ...prev]);
  };

  // ─── Sales Operations ───────────────────────────────────────────────────────

  const addSale = async (saleData: Omit<Sale, "id" | "createdAt">) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      createdAt: new Date().toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    // Deduct stock for items that have a productId
    for (const item of saleData.items) {
      if (item.productId) {
        const prod = productsList.find((p) => p.id === item.productId);
        if (prod && prod.trackStock) {
          const updatedStock = Math.max(0, prod.stockQuantity - item.quantity);
          await updateProduct(prod.id, { stockQuantity: updatedStock });
        }
      }
    }

    setSalesList((prev) => {
      const updated = [newSale, ...prev];
      try { localStorage.setItem("iziflow_sales", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // ─── Company Settings & Stamp / Signature ──────────────────────────────────

  const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => {
      const updated = prev ? { ...prev, ...settings } : (settings as CompanySettings);
      try { localStorage.setItem("iziflow_company_settings", JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (session?.user) {
      try {
        await supabase
          .from("profiles")
          .update({
            ...(settings.companyName !== undefined && { company_name: settings.companyName }),
            ...(settings.phone !== undefined && { phone: settings.phone }),
            ...(settings.ninea !== undefined && { ninea: settings.ninea }),
            ...(settings.rccm !== undefined && { rccm: settings.rccm }),
            ...(settings.currency !== undefined && { currency: settings.currency }),
            ...(settings.defaultTaxRate !== undefined && { default_tax_rate: settings.defaultTaxRate }),
            ...(settings.companyLogoUrl !== undefined && { company_logo_url: settings.companyLogoUrl }),
            ...(settings.companyStampUrl !== undefined && { company_stamp_url: settings.companyStampUrl }),
            ...(settings.companySignatureUrl !== undefined && { company_signature_url: settings.companySignatureUrl }),
            ...(settings.companySignatoryName !== undefined && { company_signatory_name: settings.companySignatoryName }),
            ...(settings.useStampOnDocuments !== undefined && { use_stamp_on_documents: settings.useStampOnDocuments }),
            ...(settings.useSignatureOnDocuments !== undefined && { use_signature_on_documents: settings.useSignatureOnDocuments }),
          })
          .eq("id", session.user.id);
      } catch {}
    }
  };

  // ─── Employees & Payroll ────────────────────────────────────────────────────

  const addEmployee = async (employeeData: Omit<Employee, "id">) => {
    const newEmp: Employee = {
      ...employeeData,
      id: "emp-" + Date.now(),
    };
    setEmployeesList((prev) => {
      const updated = [newEmp, ...prev];
      try { localStorage.setItem("iziflow_employees", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    setEmployeesList((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      try { localStorage.setItem("iziflow_employees", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteEmployee = async (id: string) => {
    setEmployeesList((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      try { localStorage.setItem("iziflow_employees", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const addPayroll = async (payrollData: Omit<Payroll, "id">) => {
    const newPay: Payroll = {
      ...payrollData,
      id: "pay-" + Date.now(),
    };
    setPayrollsList((prev) => {
      const updated = [newPay, ...prev];
      try { localStorage.setItem("iziflow_payrolls", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const updatePayrollStatus = async (
    id: string, 
    status: "draft" | "pending" | "paid", 
    paymentMethod?: "wave" | "om" | "bank_transfer" | "cash",
    paymentDate?: string
  ) => {
    setPayrollsList((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              paymentMethod: paymentMethod || p.paymentMethod,
              paymentDate: paymentDate || (status === "paid" ? new Date().toLocaleDateString("fr-FR") : p.paymentDate),
            }
          : p
      );
      try { localStorage.setItem("iziflow_payrolls", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // ─── CRM & Deals ────────────────────────────────────────────────────────────

  const addDeal = async (dealData: Omit<Deal, "id" | "createdAt">) => {
    const newDeal: Deal = {
      ...dealData,
      id: "deal-" + Date.now(),
      createdAt: new Date().toLocaleDateString("fr-FR"),
    };
    setDealsList((prev) => {
      const updated = [newDeal, ...prev];
      try { localStorage.setItem("iziflow_deals", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const updateDealStage = async (id: string, stage: DealStage) => {
    setDealsList((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, stage } : d));
      try { localStorage.setItem("iziflow_deals", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteDeal = async (id: string) => {
    setDealsList((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try { localStorage.setItem("iziflow_deals", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const getClientById = (id: string) => clientsList.find((c) => c.id === id);
  const getInvoiceById = (id: string) => invoicesList.find((inv) => inv.id === id);
  const getProductById = (id: string) => productsList.find((p) => p.id === id);
  const getInvoicesByClientId = (clientId: string) => invoicesList.filter((inv) => inv.clientId === clientId);

  return (
    <AppDataContext.Provider
      value={{
        clientsList,
        invoicesList,
        transactionsList,
        productsList,
        salesList,
        stockMovementsList,
        companySettings,
        employeesList,
        payrollsList,
        dealsList,
        loading,
        addClient,
        addInvoice,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addSale,
        updateCompanySettings,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addPayroll,
        updatePayrollStatus,
        addDeal,
        updateDealStage,
        deleteDeal,

        getClientById,
        getInvoiceById,
        getProductById,
        getInvoicesByClientId,
        refreshData: fetchData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within an AppDataProvider");
  return context;
};
