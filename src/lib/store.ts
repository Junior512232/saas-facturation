import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Invoice, Client, invoices as initialInvoices, clients as initialClients } from './data';

interface AppState {
  invoices: Invoice[];
  clients: Client[];
  
  // Actions for Invoices
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updatedInvoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  // Actions for Clients
  addClient: (client: Client) => void;
  updateClient: (id: string, updatedClient: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      invoices: initialInvoices,
      clients: initialClients,

      addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
      updateInvoice: (id, updatedInvoice) => set((state) => ({
        invoices: state.invoices.map((inv) => inv.id === id ? { ...inv, ...updatedInvoice } : inv)
      })),
      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id)
      })),

      addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
      updateClient: (id, updatedClient) => set((state) => ({
        clients: state.clients.map((c) => c.id === id ? { ...c, ...updatedClient } : c)
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id)
      })),
    }),
    {
      name: 'izifacture-storage', // name of the item in the storage (must be unique)
    }
  )
);
