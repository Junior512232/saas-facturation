import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

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

type SyncAction = {
  id: string; // ID unique de l'action (uuid)
  type: 'CREATE_INVOICE' | 'UPDATE_INVOICE' | 'CREATE_CLIENT';
  payload: any;
  timestamp: number;
};

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  syncQueue: SyncAction[];
  
  setOnlineStatus: (status: boolean) => void;
  addToQueue: (action: Omit<SyncAction, 'id' | 'timestamp'>) => void;
  processQueue: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, getStore) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: false,
      syncQueue: [],

      setOnlineStatus: (status) => set({ isOnline: status }),

      addToQueue: (action) => {
        const newAction: SyncAction = {
          ...action,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set((state) => ({ syncQueue: [...state.syncQueue, newAction] }));
        
        // Si on est en ligne, on tente de synchroniser immédiatement
        if (getStore().isOnline) {
          getStore().processQueue();
        }
      },

      processQueue: async () => {
        const state = getStore();
        if (!state.isOnline || state.isSyncing || state.syncQueue.length === 0) return;

        set({ isSyncing: true });

        // Traiter les actions dans l'ordre chronologique
        const queue = [...state.syncQueue].sort((a, b) => a.timestamp - b.timestamp);
        const remainingQueue = [...queue];

        for (const action of queue) {
          try {
            // Envoyer à Supabase selon le type d'action
            if (action.type === 'CREATE_INVOICE') {
              // const { createClient } = await import('@/lib/supabase/client');
              // const supabase = createClient();
              // await supabase.from('invoices').insert(action.payload);
              console.log("Synchronisation de l'action:", action);
            }
            
            // Simuler un délai réseau
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Succès : retirer de la file d'attente
            remainingQueue.shift();
          } catch (error) {
            console.error("Erreur de synchronisation:", error);
            break; // On arrête pour maintenir l'ordre et on réessaiera plus tard
          }
        }

        set({ syncQueue: remainingQueue, isSyncing: false });
      },
    }),
    {
      name: 'sync-queue-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
