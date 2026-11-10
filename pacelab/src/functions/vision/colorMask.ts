import { isHsvMatch, rgbToHsv } from '@/utils/color';

export interface HsvRange {
  hMin: number;
  hMax: number;
  sMin: number;
  sMax: number;
  vMin: number;
  vMax: number;
}

/**
 * Generates binary mask of pixels that match the target HSV ball preset range.
 * Optionally fast-path screens RGB before full HSV conversion.
 */
export function colorMask(
  currRgba: Uint8ClampedArray | Uint8Array,
  outColorMask: Uint8Array,
  width: number,
  height: number,
  range: HsvRange
): number {
  const pixelCount = width * height;
  let matchingPixels = 0;

  for (let i = 0; i < pixelCount; i++) {
    const rIdx = i * 4;
    const r = currRgba[rIdx];
    const g = currRgba[rIdx + 1];
    const b = currRgba[rIdx + 2];

    const hsv = rgbToHsv(r, g, b);
    if (isHsvMatch(hsv, range)) {
      outColorMask[i] = 255;
      matchingPixels++;
    } else {
      outColorMask[i] = 0;
    }
  }

  return matchingPixels;
}
