import { Delivery } from '@/types';
import { getDB } from './schema';

export async function getDelivery(id: string): Promise<Delivery | undefined> {
  const db = await getDB();
  return db.get('deliveries', id);
}

export async function getDeliveriesForSession(sessionId: string): Promise<Delivery[]> {
  const db = await getDB();
  const deliveries = await db.getAllFromIndex('deliveries', 'by-sessionId', sessionId);
  return deliveries.sort((a, b) => a.createdAt - b.createdAt); // chronological order
}

export async function getAllDeliveries(): Promise<Delivery[]> {
  const db = await getDB();
  return db.getAllFromIndex('deliveries', 'by-createdAt');
}

export async function saveDelivery(delivery: Delivery): Promise<void> {
  const db = await getDB();
  await db.put('deliveries', delivery);
}

export async function deleteDelivery(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('deliveries', id);
}

export async function updateDeliveryMetadata(
  id: string,
  updates: { bowler?: string; notes?: string }
): Promise<void> {
  const db = await getDB();
  const del = await db.get('deliveries', id);
  if (del) {
    if (updates.bowler !== undefined) del.bowler = updates.bowler;
    if (updates.notes !== undefined) del.notes = updates.notes;
    await db.put('deliveries', del);
  }
}

export interface GlobalDeliveryStats {
  totalCount: number;
  topSpeedMps: number;
  avgSpeedMps: number;
  recentDeliveries: Delivery[];
  weekCount: number;
}

export async function getGlobalDeliveryStats(): Promise<GlobalDeliveryStats> {
  const all = await getAllDeliveries();
  if (all.length === 0) {
    return {
      totalCount: 0,
      topSpeedMps: 0,
      avgSpeedMps: 0,
      recentDeliveries: [],
      weekCount: 0,
    };
  }

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let topSpeed = 0;
  let sumSpeed = 0;
  let weekCount = 0;

  for (const d of all) {
    if (d.speedMps > topSpeed) {
      topSpeed = d.speedMps;
    }
    sumSpeed += d.speedMps;
    if (d.createdAt >= oneWeekAgo) {
      weekCount++;
    }
  }

  const recent = [...all].reverse().slice(0, 5);

  return {
    totalCount: all.length,
    topSpeedMps: topSpeed,
    avgSpeedMps: sumSpeed / all.length,
    recentDeliveries: recent,
    weekCount,
  };
}

export async function clearAllDatabaseData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['calibrations', 'sessions', 'deliveries'], 'readwrite');
  await tx.objectStore('calibrations').clear();
  await tx.objectStore('sessions').clear();
  await tx.objectStore('deliveries').clear();
  await tx.done;
}
