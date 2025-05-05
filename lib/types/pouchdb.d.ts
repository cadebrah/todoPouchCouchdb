declare module 'pouchdb-adapter-asyncstorage';
declare module 'pouchdb-adapter-http';
declare module 'pouchdb-core';
declare module 'pouchdb-find';
declare module 'pouchdb-mapreduce';
declare module 'pouchdb-replication';

interface PouchDBChange {
  direction: 'pull' | 'push';
  change: {
    docs: any[];
    seq: number;
  };
}

interface PouchDBError {
  status: number;
  name: string;
  message: string;
}

interface PouchDBInfo {
  docs_written: number;
  docs_read: number;
  start_time: string;
  end_time: string;
  status: string;
} 