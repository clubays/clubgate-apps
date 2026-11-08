export const DEFAULT_LENGTH_ZONES = [
  { id: 'full-toss', name: 'Full toss', min: -Infinity, max: 0, color: '#e5473f', desc: 'No bounce before stumps' },
  { id: 'yorker', name: 'Yorker', min: 0, max: 1.5, color: '#38bdf8', desc: '0 – 1.5 m from stumps' },
  { id: 'full', name: 'Full', min: 1.5, max: 3.5, color: '#2fd27e', desc: '1.5 – 3.5 m from stumps' },
  { id: 'good', name: 'Good length', min: 3.5, max: 6.0, color: '#c6ff3d', desc: '3.5 – 6.0 m from stumps' },
  { id: 'short-of-length', name: 'Short of length', min: 6.0, max: 8.0, color: '#ffb020', desc: '6.0 – 8.0 m from stumps' },
  { id: 'short', name: 'Short / bouncer', min: 8.0, max: Infinity, color: '#f97316', desc: 'Over 8.0 m from stumps' },
];

export function getLengthZone(distFromStrikerStumps, zones = DEFAULT_LENGTH_ZONES) {
  if (distFromStrikerStumps === null || distFromStrikerStumps === undefined || isNaN(distFromStrikerStumps)) {
    return { id: 'unknown', name: 'Unknown', color: '#8a9ab0', desc: 'Undetected bounce' };
  }
  for (const z of zones) {
    if (distFromStrikerStumps >= z.min && distFromStrikerStumps < z.max) {
      return z;
    }
  }
  return zones[zones.length - 1];
}
