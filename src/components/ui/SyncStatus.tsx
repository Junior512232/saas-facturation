"use client";

import { useSyncStore } from '@/lib/syncStore';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SyncStatus() {
  const { isOnline, isSyncing, syncQueue } = useSyncStore();
  const pendingCount = syncQueue.length;
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch since navigator.onLine is browser-only
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-amber-600 bg-amber-50 px-2 sm:px-2.5 py-1 rounded-full border border-amber-200" title={`${pendingCount} action(s) en attente`}>
        <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span className="hidden sm:inline">Hors-ligne ({pendingCount})</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-1 rounded-full border border-blue-200">
        <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
        <span className="hidden sm:inline">Synchro...</span>
      </div>
    );
  }

  if (pendingCount === 0) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-1 rounded-full border border-emerald-200" title="Synchronisé avec le cloud">
        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span className="hidden sm:inline">Synchronisé</span>
      </div>
    );
  }

  // Fallback if online but not syncing yet
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-1 rounded-full border border-blue-200">
      <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      <span className="hidden sm:inline">En attente ({pendingCount})</span>
    </div>
  );
}
