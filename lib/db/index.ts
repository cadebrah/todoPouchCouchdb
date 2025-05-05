import PouchAdapterAsyncStorage from 'pouchdb-adapter-asyncstorage';
import PouchAdapterHttp from 'pouchdb-adapter-http';
import PouchDB from 'pouchdb-core';
import PouchDBFind from 'pouchdb-find';
import PouchDBMapReduce from 'pouchdb-mapreduce';
import PouchDBReplication from 'pouchdb-replication';
import 'react-native-get-random-values'; // Required for UUID generation

// Register PouchDB plugins
PouchDB.plugin(PouchAdapterAsyncStorage);
PouchDB.plugin(PouchAdapterHttp);
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBMapReduce);
PouchDB.plugin(PouchDBReplication);

// Create local database
const localDB = new PouchDB('todos', { adapter: 'asyncstorage' });

// Configuration for remote CouchDB
const REMOTE_COUCHDB_URL = 'https://admin:password@todo-app-sync-8119f06155bc.herokuapp.com/todos';

// Create remote database connection
const remoteDB = new PouchDB(REMOTE_COUCHDB_URL);

// Define sync status type
export type SyncStatus = 'pending' | 'active' | 'paused' | 'error' | 'complete' | 'denied';

// Sync status listener interface
export interface SyncStatusListener {
  onStatusChange: (status: SyncStatus, info?: any) => void;
}

// Array to store sync status listeners
const syncStatusListeners: SyncStatusListener[] = [];

// Add a sync status listener
export const addSyncStatusListener = (listener: SyncStatusListener) => {
  syncStatusListeners.push(listener);
};

// Remove a sync status listener
export const removeSyncStatusListener = (listener: SyncStatusListener) => {
  const index = syncStatusListeners.indexOf(listener);
  if (index > -1) {
    syncStatusListeners.splice(index, 1);
  }
};

// Notify all listeners of a status change
const notifySyncStatusChange = (status: SyncStatus, info?: any) => {
  syncStatusListeners.forEach(listener => {
    listener.onStatusChange(status, info);
  });
};

// Setup sync options
const syncOptions = {
  live: true, // Keep the sync alive
  retry: true, // Retry on failure
  continuous: true, // Continuously sync
};

// Initialize sync
let syncHandler: any = null;

export const sync = () => {
  // If sync is already running, cancel it first
  if (syncHandler) {
    syncHandler.cancel();
  }

  // Start sync
  syncHandler = localDB.sync(remoteDB, syncOptions)
    .on('change', (change: PouchDBChange) => {
      console.log('Sync change:', change);
      notifySyncStatusChange('active', change);
    })
    .on('paused', (info: PouchDBInfo) => {
      console.log('Sync paused:', info);
      notifySyncStatusChange('paused', info);
    })
    .on('active', () => {
      console.log('Sync active');
      notifySyncStatusChange('active');
    })
    .on('denied', (err: PouchDBError) => {
      console.error('Sync denied:', err);
      notifySyncStatusChange('denied', err);
    })
    .on('complete', (info: PouchDBInfo) => {
      console.log('Sync complete:', info);
      notifySyncStatusChange('complete', info);
    })
    .on('error', (err: PouchDBError) => {
      console.error('Sync error:', err);
      notifySyncStatusChange('error', err);
    });

  return syncHandler;
};

// Initialize database indexes
export const initializeDB = async () => {
  try {
    // Create index for type field
    await localDB.createIndex({
      index: { fields: ['type'] }
    });
    
    // Create index for completed field
    await localDB.createIndex({
      index: { fields: ['completed'] }
    });
    
    // Create index for createdAt field
    await localDB.createIndex({
      index: { fields: ['createdAt'] }
    });
    
    console.log('Database indexes created successfully');
    return true;
  } catch (error) {
    console.error('Error creating database indexes:', error);
    return false;
  }
};

// Cancel sync
export const cancelSync = () => {
  if (syncHandler) {
    syncHandler.cancel();
    syncHandler = null;
  }
};

// Export database objects
export { localDB, remoteDB };

