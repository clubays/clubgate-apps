import { SPEED_CLASSES } from '@/constants';
import { SpeedClass, UnitSystem } from '@/types';

export const MPS_TO_KMH = 3.6;
export const MPS_TO_MPH = 2.236936;

export function convertSpeed(speedMps: number, targetUnit: UnitSystem): number {
  switch (targetUnit) {
    case 'km/h':
      return speedMps * MPS_TO_KMH;
    case 'mph':
      return speedMps * MPS_TO_MPH;
    case 'm/s':
      return speedMps;
  }
}

export function convertToMps(value: number, fromUnit: UnitSystem): number {
  switch (fromUnit) {
    case 'km/h':
      return value / MPS_TO_KMH;
    case 'mph':
      return value / MPS_TO_MPH;
    case 'm/s':
      return value;
  }
}

export function formatSpeed(speedMps: number, unit: UnitSystem, decimals: number = 1): string {
  if (isNaN(speedMps) || !isFinite(speedMps) || speedMps < 0) {
    return '--.-';
  }
  const val = convertSpeed(speedMps, unit);
  return val.toFixed(decimals);
}

export function getSpeedClass(speedMps: number): SpeedClass {
  const kmh = speedMps * MPS_TO_KMH;
  for (const sc of SPEED_CLASSES) {
    if (kmh >= sc.minKmh && kmh < sc.maxKmh) {
      return sc;
    }
  }
  return SPEED_CLASSES[SPEED_CLASSES.length - 1]; // fallback to fastest
}

export function formatUncertainty(uncertaintyMps: number, unit: UnitSystem, decimals: number = 1): string {
  const val = convertSpeed(uncertaintyMps, unit);
  return `±${val.toFixed(decimals)}`;
}
