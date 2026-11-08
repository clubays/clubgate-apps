/**
 * Units conversion and formatting utilities
 */

export const MPS_TO_KMH = 3.6;
export const MPS_TO_MPH = 2.236936;

export function mpsToKmh(mps) {
  return mps * MPS_TO_KMH;
}

export function mpsToMph(mps) {
  return mps * MPS_TO_MPH;
}

export function kmhToMps(kmh) {
  return kmh / MPS_TO_KMH;
}

export function formatSpeed(mps, unit = 'kmh', sd = null) {
  if (mps === null || mps === undefined || isNaN(mps)) return '—';
  const val = unit === 'mph' ? mpsToMph(mps) : mpsToKmh(mps);
  const unitLabel = unit === 'mph' ? 'mph' : 'km/h';
  
  const sdVal = sd != null ? (unit === 'mph' ? mpsToMph(sd) : mpsToKmh(sd)) : null;

  // Display rule: 142.6 ± 3.1 km/h. Round to 0.1 km/h but only show the decimals when sd < 1.5 km/h, otherwise round to 1 km/h.
  const showDecimals = sdVal === null || sdVal < 1.5;
  const formattedVal = showDecimals ? val.toFixed(1) : Math.round(val).toString();

  if (sdVal != null && !isNaN(sdVal)) {
    const formattedSd = sdVal < 1.5 ? sdVal.toFixed(1) : Math.round(sdVal).toString();
    return `${formattedVal} ± ${formattedSd} ${unitLabel}`;
  }

  return `${formattedVal} ${unitLabel}`;
}

export function formatDistance(m) {
  if (m === null || m === undefined || isNaN(m)) return '—';
  return `${m.toFixed(2)} m`;
}

export function formatCm(cm) {
  if (cm === null || cm === undefined || isNaN(cm)) return '—';
  return `${cm.toFixed(1)} cm`;
}
