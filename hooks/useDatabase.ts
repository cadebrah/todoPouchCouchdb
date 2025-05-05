import { useEffect, useState } from 'react';
import {
  getSyncError,
  getSyncStatus,
  initializeDB,
  restartSync,
  SyncStatus
} from '../lib/db';

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());
  const [syncError, setSyncError] = useState<Error | null>(getSyncError());

  // Initialize the database
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        setIsInitializing(true);
        const initialized = await initializeDB();
        
        if (isMounted) {
          setIsInitialized(initialized);
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Error initializing database:', error);
        if (isMounted) {
          setIsInitializing(false);
          setSyncError(error instanceof Error ? error : new Error('Unknown error'));
        }
      }
    };
    
    initialize();
    
    // Listen for status changes
    const onStatusChange = (status: SyncStatus, error?: Error | null) => {
      if (isMounted) {
        setSyncStatus(status);
        setSyncError(error || null);
      }
    };
    
    // Set up event listeners
    const dbEvents = require('../lib/db').dbEvents;
    dbEvents.on('statusChange', onStatusChange);
    
    // Clean up
    return () => {
      isMounted = false;
      dbEvents.removeListener('statusChange', onStatusChange);
    };
  }, []);
  
  return {
    isInitialized,
    isInitializing,
    syncStatus,
    syncError,
    restartSync
  };
}