/**
 * Combines motion and color masks.
 * If color matching is active and found sufficient pixels, performs (motion AND color).
 * Otherwise falls back to motion-only.
 */
export function combineMasks(
  diffMask: Uint8Array,
  colorMaskBuffer: Uint8Array,
  outCombinedMask: Uint8Array,
  width: number,
  height: number,
  matchingColorPixels: number
): { isColorConstrained: boolean } {
  const pixelCount = width * height;
  // If there are at least a few color hits, enforce (motion AND color)
  const isColorConstrained = matchingColorPixels >= 4;

  if (isColorConstrained) {
    for (let i = 0; i < pixelCount; i++) {
      outCombinedMask[i] = diffMask[i] > 0 && colorMaskBuffer[i] > 0 ? 255 : 0;
    }
  } else {
    // Fall back to motion diff only
    outCombinedMask.set(diffMask);
  }

  return { isColorConstrained };
}
