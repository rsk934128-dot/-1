import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isCachedMode: boolean;
  lastSyncTime: Date | null;
  connectionType?: string;
  hasBeenOffline: boolean;
  justReconnected: boolean;
  toggleSimulatedOffline: () => void;
  checkConnection: () => Promise<boolean>;
  markSynced: () => void;
}

const CACHE_SYNC_KEY = 'al_sheikh_farid_last_sync_timestamp';

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    const saved = localStorage.getItem('al_sheikh_farid_simulate_offline');
    return saved === 'true';
  });

  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem(CACHE_SYNC_KEY);
    return saved ? new Date(saved) : new Date();
  });

  const [hasBeenOffline, setHasBeenOffline] = useState<boolean>(false);
  const [justReconnected, setJustReconnected] = useState<boolean>(false);

  // Mark currently cached data time
  const markSynced = useCallback(() => {
    const now = new Date();
    setLastSyncTime(now);
    localStorage.setItem(CACHE_SYNC_KEY, now.toISOString());
  }, []);

  // Listen to standard browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      markSynced();
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasBeenOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync timestamp if not set
    if (!localStorage.getItem(CACHE_SYNC_KEY)) {
      markSynced();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [markSynced]);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem('al_sheikh_farid_simulate_offline', String(next));
      if (!next) {
        setJustReconnected(true);
        markSynced();
        setTimeout(() => setJustReconnected(false), 4000);
      } else {
        setHasBeenOffline(true);
      }
      return next;
    });
  }, [markSynced]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (isSimulatedOffline) {
      return false;
    }
    try {
      // Ping check or header head request
      const response = await fetch('/api/health', { method: 'GET', cache: 'no-store' }).catch(() => null);
      if (response && response.ok) {
        setIsOnline(true);
        markSynced();
        return true;
      }
      // If client-only fallback, check online navigator
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);
      if (online) markSynced();
      return online;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, [isSimulatedOffline, markSynced]);

  const isCachedMode = !isOnline || isSimulatedOffline;

  return {
    isOnline,
    isSimulatedOffline,
    isCachedMode,
    lastSyncTime,
    hasBeenOffline,
    justReconnected,
    toggleSimulatedOffline,
    checkConnection,
    markSynced,
  };
}
