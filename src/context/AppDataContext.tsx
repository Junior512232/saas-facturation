"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthContext";
import type { Client, Invoice, InvoiceStatus, InvoiceItem } from "@/lib/data";

// Re-export types for convenience
export type { Client, Invoice, InvoiceStatus };

interface AppDataContextProps {
  clientsList: Client[];
  invoicesList: Invoice[];
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
  return {
    id: row.id as string,
    number: row.number as string,
    clientId: (row.client_id as string) || "",
    client: row.client_name as string,
    clientEmail: row.client_email as string,
    issueDate: issueDate ? new Date(issueDate).toLocaleDateString("fr-FR") : "",
    dueDate: dueDate ? new Date(dueDate).toLocaleDateString("fr-FR") : "",
    amount: (row.amount as number) || 0,
    taxRate: (row.tax_rate as number) || 18,
    status: (row.status as InvoiceStatus) || "draft",
    items: (row.items as InvoiceItem[]) || [],
    notes: (row.notes as string) || undefined,
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
      const [{ data: clientsData }, { data: invoicesData }] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      ]);
      setClientsList((clientsData || []).map(rowToClient));
      setInvoicesList((invoicesData || []).map(rowToInvoice));
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
        user_id: session!.user.id,
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone || null,
        address: newClientData.address || null,
        city: newClientData.city || null,
        country: newClientData.country || "Sénégal",
        tax_id: newClientData.taxId || null,
        initials,
        color,
        total_invoices: 0,
        total_paid: 0,
      })
      .select()
      .single();

    if (!error && data) {
      setClientsList((prev) => [rowToClient(data), ...prev]);
    }
  };

  const addInvoice = async (newInvoiceData: Omit<Invoice, "id" | "status"> & { status?: InvoiceStatus }) => {
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        user_id: session!.user.id,
        number: newInvoiceData.number,
        client_id: newInvoiceData.clientId || null,
        client_name: newInvoiceData.client,
        client_email: newInvoiceData.clientEmail,
        issue_date: parseDateForDB(newInvoiceData.issueDate),
        due_date: parseDateForDB(newInvoiceData.dueDate),
        amount: newInvoiceData.amount,
        tax_rate: newInvoiceData.taxRate || 18,
        status: newInvoiceData.status || "draft",
        items: newInvoiceData.items || [],
        notes: newInvoiceData.notes || null,
      })
      .select()
      .single();

    if (!error && data) {
      setInvoicesList((prev) => [rowToInvoice(data), ...prev]);
      // Update client invoice count
      if (newInvoiceData.clientId) {
        await supabase.rpc("increment_client_invoices", { client_id_param: newInvoiceData.clientId });
        setClientsList((prev) =>
          prev.map((c) =>
            c.id === newInvoiceData.clientId ? { ...c, totalInvoices: c.totalInvoices + 1 } : c
          )
        );
      }
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
