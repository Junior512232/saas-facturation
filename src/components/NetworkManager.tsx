"use client";

import { useEffect } from 'react';
import { useSyncStore } from '@/lib/syncStore';

export function NetworkManager() {
  const { setOnlineStatus, processQueue } = useSyncStore();

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      processQueue(); // Lancer la synchro au retour de la connexion
    };
    
    const handleOffline = () => {
      setOnlineStatus(false);
    };

    // Initialisation au chargement
    if (typeof navigator !== 'undefined') {
      setOnlineStatus(navigator.onLine);
      if (navigator.onLine) {
        processQueue();
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, processQueue]);

  return null;
}
