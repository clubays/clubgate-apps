/**
 * IndexedDB wrapper for Seam & Speed
 * Stores: sessions, videos, calibrations
 */

const DB_NAME = 'seam-and-speed';
const DB_VERSION = 1;

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('date', 'date', { unique: false });
        sessionStore.createIndex('bowler', 'bowler', { unique: false });
      }
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('calibrations')) {
        db.createObjectStore('calibrations', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function saveSession(session) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const req = store.put(session);
    req.onsuccess = () => resolve(session.id);
    req.onerror = () => reject(req.error);
  });
}

export async function getSession(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllSessions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const req = store.getAll();
    req.onsuccess = () => {
      const results = req.result || [];
      // Sort newest first
      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSession(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sessions', 'videos'], 'readwrite');
    tx.objectStore('sessions').delete(id);
    tx.objectStore('videos').delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveVideoBlob(id, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite');
    const store = tx.objectStore('videos');
    const req = store.put({ id, blob, size: blob.size, type: blob.type, updatedAt: Date.now() });
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

export async function getVideoBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readonly');
    const store = tx.objectStore('videos');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result?.blob || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCalibration(calib) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('calibrations', 'readwrite');
    const store = tx.objectStore('calibrations');
    const req = store.put(calib);
    req.onsuccess = () => resolve(calib.id);
    req.onerror = () => reject(req.error);
  });
}

export async function getCalibration(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('calibrations', 'readonly');
    const store = tx.objectStore('calibrations');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCalibrations() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('calibrations', 'readonly');
    const store = tx.objectStore('calibrations');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
