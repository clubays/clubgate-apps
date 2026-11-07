/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatMinutes(mins: number): string {
  if (mins <= 1) return '1 min';
  return `${mins} mins`;
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function pluralize(count: number, singular: string, plural: string = `${singular}s`): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}
