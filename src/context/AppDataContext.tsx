"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthContext";
import type { Client, Invoice, InvoiceStatus, InvoiceItem, Payment, PaymentStatus } from "@/lib/data";

// Re-export types for convenience
export type { Client, Invoice, InvoiceStatus, Payment, PaymentStatus };

interface AppDataContextProps {
  clientsList: Client[];
  invoicesList: Invoice[];
  transactionsList: Payment[];
  loading: boolean;
  addClient: (client: Omit<Client, "id" | "totalInvoices" | "totalPaid" | "createdAt" | "initials" | "color">) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, "id" | "status"> & { status?: InvoiceStatus }) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
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
function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) || "",
    address: (row.address as string) || "",
    city: (row.city as string) || "",
    country: (row.country as string) || "Sénégal",
    taxId: (row.tax_id as string) || undefined,
    totalInvoices: (row.total_invoices as number) || 0,
    totalPaid: (row.total_paid as number) || 0,
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
    items: (row.items as InvoiceItem[]) || [],
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
function parseDateForDB(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  // Already ISO format
  if (dateStr.includes("-") && dateStr.length === 10) return dateStr;
  // DD/MM/YYYY
  const [d, m, y] = dateStr.split("/");
  if (d && m && y) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return new Date().toISOString().split("T")[0];
}

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [transactionsList, setTransactionsList] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const supabase = createClient();

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
        supabase.from("invoices").select("*, clients(name, email)").order("created_at", { ascending: false }),
        supabase.from("payments").select("*, invoices(invoice_number, clients(id, name))").order("created_at", { ascending: false }),
      ]);
      setClientsList((clientsData || []).map(rowToClient));
      setInvoicesList((invoicesData || []).map(rowToInvoice));
      setTransactionsList((paymentsData || []).map(rowToPayment));
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
      setClientsList((prev) => [rowToClient(data), ...prev]);
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

      setInvoicesList((prev) => [rowToInvoice(data), ...prev]);
    }
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    const invoice = invoicesList.find((i) => i.id === id);
    const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
    if (error) return;

    setInvoicesList((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)));

    // Update client totalPaid
    if (invoice?.clientId) {
      const oldPaid = invoice.status === "paid" ? invoice.amount : 0;
      const newPaid = status === "paid" ? invoice.amount : 0;
      const diff = newPaid - oldPaid;
      if (diff !== 0) {
        await supabase
          .from("clients")
          .update({ total_paid: Math.max(0, (clientsList.find((c) => c.id === invoice.clientId)?.totalPaid || 0) + diff) })
          .eq("id", invoice.clientId);
        setClientsList((prev) =>
          prev.map((c) =>
            c.id === invoice.clientId ? { ...c, totalPaid: Math.max(0, c.totalPaid + diff) } : c
          )
        );
      }
    }
  };

  const getClientById = (id: string) => clientsList.find((c) => c.id === id);
  const getInvoiceById = (id: string) => invoicesList.find((inv) => inv.id === id);
  const getInvoicesByClientId = (clientId: string) => invoicesList.filter((inv) => inv.clientId === clientId);

  return (
    <AppDataContext.Provider
      value={{
        clientsList,
        invoicesList,
        transactionsList,
        loading,
        addClient,
        addInvoice,
        updateInvoiceStatus,
        getClientById,
        getInvoiceById,
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
