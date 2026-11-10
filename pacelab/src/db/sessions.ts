import { Session } from '@/types';
import { getDB } from './schema';

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDB();
  return db.get('sessions', id);
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB();
  const sessions = await db.getAllFromIndex('sessions', 'by-createdAt');
  return sessions.reverse(); // newest first
}

export async function saveSession(session: Session): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['sessions', 'deliveries'], 'readwrite');

  // Delete all deliveries associated with this session
  const deliveryIndex = tx.objectStore('deliveries').index('by-sessionId');
  let cursor = await deliveryIndex.openCursor(IDBKeyRange.only(id));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  await tx.objectStore('sessions').delete(id);
  await tx.done;
}

export async function updateSessionName(id: string, name: string): Promise<void> {
  const db = await getDB();
  const sess = await db.get('sessions', id);
  if (sess) {
    sess.name = name;
    await db.put('sessions', sess);
  }
}
