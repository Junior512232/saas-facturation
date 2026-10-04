import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Invoice, Client } from './data';

// Définir le stockage personnalisé basé sur IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

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
      invoices: [],
      clients: [],

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
      storage: createJSONStorage(() => idbStorage), // Utilise IndexedDB !
    }
  )
);
