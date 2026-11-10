import { DBSchema, openDB, IDBPDatabase } from 'idb';
import { Calibration, Delivery, Session } from '@/types';

export interface PaceLabDBSchema extends DBSchema {
  calibrations: {
    key: string;
    value: Calibration;
    indexes: {
      'by-createdAt': number;
    };
  };
  sessions: {
    key: string;
    value: Session;
    indexes: {
      'by-createdAt': number;
    };
  };
  deliveries: {
    key: string;
    value: Delivery;
    indexes: {
      'by-sessionId': string;
      'by-createdAt': number;
    };
  };
}

const DB_NAME = 'pacelab';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PaceLabDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<PaceLabDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<PaceLabDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Calibrations store
        if (!db.objectStoreNames.contains('calibrations')) {
          const calStore = db.createObjectStore('calibrations', { keyPath: 'id' });
          calStore.createIndex('by-createdAt', 'createdAt');
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessStore.createIndex('by-createdAt', 'createdAt');
        }

        // Deliveries store
        if (!db.objectStoreNames.contains('deliveries')) {
          const delStore = db.createObjectStore('deliveries', { keyPath: 'id' });
          delStore.createIndex('by-sessionId', 'sessionId');
          delStore.createIndex('by-createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}
