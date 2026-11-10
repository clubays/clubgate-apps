export interface GateSpeedResult {
  mps: number;
  dtSeconds: number;
  direction: 'A_to_B' | 'B_to_A';
}

/**
 * Calculates velocity from sub-frame gate crossing timestamps and real distance
 * v = D / (t_B - t_A)
 */
export function speedFromGates(tA: number, tB: number, distanceM: number): GateSpeedResult {
  const dt = tB - tA;
  const absDt = Math.abs(dt);

  if (absDt < 1e-4 || distanceM <= 0) {
    return {
      mps: 0,
      dtSeconds: absDt,
      direction: 'A_to_B',
    };
  }

  const mps = distanceM / absDt;
  const direction = dt >= 0 ? 'A_to_B' : 'B_to_A';

  return {
    mps,
    dtSeconds: absDt,
    direction,
  };
}
