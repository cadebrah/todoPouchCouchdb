import { useEffect, useState } from 'react';
import { addSyncStatusListener, cancelSync, initializeDB, removeSyncStatusListener, sync, SyncStatus, SyncStatusListener } from '../lib/db';

const initializeDatabase = async (setIsInitialized: (value: boolean) => void, setIsInitializing: (value: boolean) => void, setSyncHandler: (handler: any) => void) => {
  try {
    setIsInitializing(true);
    const initialized = await initializeDB();
    setIsInitialized(initialized);
    setIsInitializing(false);
    
    if (initialized) {
      const handler = sync();
      setSyncHandler(handler);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    setIsInitializing(false);
    throw error;
  }
};

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('pending');
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [syncHandler, setSyncHandler] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const handleStatusChange = (status: SyncStatus, info?: any) => {
      if (!isMounted) return;
      
      setSyncStatus(status);
      if (status === 'error' && info) {
        setSyncError(info instanceof Error ? info : new Error(info.toString()));
      } else {
        setSyncError(null);
      }
    };
    
    const statusListener: SyncStatusListener = {
      onStatusChange: handleStatusChange
    };
    
    addSyncStatusListener(statusListener);
    
    initializeDatabase(setIsInitialized, setIsInitializing, setSyncHandler)
      .catch(error => {
        if (isMounted) {
          setSyncError(error instanceof Error ? error : new Error('Unknown error'));
        }
      });
    
    return () => {
      isMounted = false;
      removeSyncStatusListener(statusListener);
      if (syncHandler) {
        cancelSync();
      }
    };
  }, []);
  
  const restartSync = () => {
    const handler = sync();
    setSyncHandler(handler);
    setSyncStatus('pending');
    setSyncError(null);
  };
  
  return {
    isInitialized,
    isInitializing,
    syncStatus,
    syncError,
    restartSync
  };
}