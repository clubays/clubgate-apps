export function isSecureOrLocal(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.isSecureContext) return true;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

export function supportsVideoFrameCallback(): boolean {
  if (typeof HTMLVideoElement === 'undefined') return false;
  return 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
}

export function supportsWakeLock(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'wakeLock' in navigator;
}

export function getFpsAdvisory(fps: number): {
  type: 'optimal' | 'acceptable' | 'warning';
  message: string;
  distancePerFrameMeters: number; // For a 140 km/h ball (38.89 m/s)
} {
  const ballSpeedMps = 140 / 3.6; // 38.89 m/s
  const distPerFrame = ballSpeedMps / Math.max(1, fps);

  if (fps >= 100) {
    return {
      type: 'optimal',
      message: `Optimal high-speed capture (${fps.toFixed(0)} fps). Ball travels ~${distPerFrame.toFixed(2)}m per frame at 140 km/h.`,
      distancePerFrameMeters: distPerFrame,
    };
  } else if (fps >= 55) {
    return {
      type: 'acceptable',
      message: `Standard capture rate (${fps.toFixed(0)} fps). Ball travels ~${distPerFrame.toFixed(2)}m per frame at 140 km/h.`,
      distancePerFrameMeters: distPerFrame,
    };
  } else {
    return {
      type: 'warning',
      message: `Low frame rate advisory: ${fps.toFixed(0)} fps. A 140 km/h ball moves ~${distPerFrame.toFixed(2)}m per frame. Sub-frame gate interpolation active, but 60–120 fps is recommended.`,
      distancePerFrameMeters: distPerFrame,
    };
  }
}
