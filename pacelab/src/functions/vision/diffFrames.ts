/**
 * Computes absolute luma difference between current RGBA frame and previous luma buffer.
 * Reuses existing Uint8Array buffers to ensure zero allocations per frame in worker loop.
 */
export function diffFrames(
  currRgba: Uint8ClampedArray | Uint8Array,
  prevLuma: Uint8Array,
  outDiffMask: Uint8Array,
  outCurrLuma: Uint8Array,
  width: number,
  height: number,
  threshold: number = 22
): void {
  const pixelCount = width * height;

  for (let i = 0; i < pixelCount; i++) {
    const rIdx = i * 4;
    const r = currRgba[rIdx];
    const g = currRgba[rIdx + 1];
    const b = currRgba[rIdx + 2];

    // Fast integer luma calculation: (77*R + 150*G + 29*B) >> 8
    const luma = (77 * r + 150 * g + 29 * b) >> 8;
    outCurrLuma[i] = luma;

    const diff = Math.abs(luma - prevLuma[i]);
    outDiffMask[i] = diff >= threshold ? 255 : 0;
  }
}
