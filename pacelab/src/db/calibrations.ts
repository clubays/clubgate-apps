import { Calibration } from '@/types';
import { getDB } from './schema';

export async function getCalibration(id: string): Promise<Calibration | undefined> {
  const db = await getDB();
  return db.get('calibrations', id);
}

export async function getAllCalibrations(): Promise<Calibration[]> {
  const db = await getDB();
  return db.getAllFromIndex('calibrations', 'by-createdAt');
}

export async function getLatestCalibration(): Promise<Calibration | undefined> {
  const all = await getAllCalibrations();
  return all.length > 0 ? all[all.length - 1] : undefined;
}

export async function saveCalibration(calibration: Calibration): Promise<void> {
  const db = await getDB();
  await db.put('calibrations', calibration);
}

export async function deleteCalibration(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('calibrations', id);
}
