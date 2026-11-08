/**
 * Fast RGB to HSV conversion and ball color mask filtering
 */

/**
 * Fast RGB to HSV conversion
 * r, g, b in [0, 255]
 * returns h in [0, 360], s in [0, 1], v in [0, 1]
 */
export function rgbToHsv(r, g, b) {
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;

  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const delta = max - min;

  let h = 0;
  if (delta > 1e-5) {
    if (max === rf) {
      h = 60 * (((gf - bf) / delta) % 6);
    } else if (max === gf) {
      h = 60 * ((bf - rf) / delta + 2);
    } else {
      h = 60 * ((rf - gf) / delta + 4);
    }
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return [h, s, v];
}

/**
 * Test whether a pixel matches the specified ball preset
 */
export function matchBallColor(h, s, v, preset = 'red') {
  switch (preset) {
    case 'red':
      return (h < 12 || h > 345) && s > 0.45 && v > 0.2;
    case 'white':
      return s < 0.22 && v > 0.78;
    case 'pink':
      return h >= 315 && h <= 350 && s >= 0.25 && s <= 0.8 && v > 0.45;
    case 'any':
    default:
      return true;
  }
}

/**
 * Compute average color score of a blob based on how closely it matches preset
 */
export function computeColorMatchScore(meanR, meanG, meanB, preset = 'red') {
  if (preset === 'any') return 1.0;
  const [h, s, v] = rgbToHsv(meanR, meanG, meanB);

  switch (preset) {
    case 'red': {
      const isRedHue = h < 20 || h > 340;
      const hueDist = h < 180 ? h : 360 - h;
      const hueScore = Math.max(0, 1 - hueDist / 30);
      const satScore = Math.min(1, s / 0.5);
      const valScore = Math.min(1, v / 0.3);
      return (hueScore * 0.5 + satScore * 0.3 + valScore * 0.2);
    }
    case 'white': {
      const lowSat = Math.max(0, 1 - s / 0.3);
      const highVal = Math.max(0, (v - 0.7) / 0.3);
      return (lowSat * 0.5 + highVal * 0.5);
    }
    case 'pink': {
      const targetHue = 330;
      const hDiff = Math.abs(h - targetHue);
      const hueScore = Math.max(0, 1 - hDiff / 25);
      const satScore = Math.max(0, 1 - Math.abs(s - 0.5) / 0.3);
      return (hueScore * 0.6 + satScore * 0.4);
    }
    default:
      return 0.5;
  }
}
