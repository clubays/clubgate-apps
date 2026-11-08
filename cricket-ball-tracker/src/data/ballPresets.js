export const BALL_PRESETS = {
  red: {
    id: 'red',
    name: 'Red ball (Leather / Match)',
    badge: 'Red Match',
    colour: '#d62828',
    expectedHueRange: 'h < 12° or h > 345°',
    checkPixel: (h, s, v) => (h < 12 || h > 345) && s > 0.45 && v > 0.2,
  },
  white: {
    id: 'white',
    name: 'White ball (ODI / T20)',
    badge: 'White Ball',
    colour: '#f8fafc',
    expectedHueRange: 's < 0.22, v > 0.78',
    checkPixel: (h, s, v) => s < 0.22 && v > 0.78,
  },
  pink: {
    id: 'pink',
    name: 'Pink ball (Day/Night)',
    badge: 'Pink Test',
    colour: '#ff66a3',
    expectedHueRange: '315°–350°, s > 0.25',
    checkPixel: (h, s, v) => h >= 315 && h <= 350 && s >= 0.25 && s <= 0.8 && v > 0.45,
  },
  any: {
    id: 'any',
    name: 'Any (Motion & shape only)',
    badge: 'Any Ball',
    colour: '#c6ff3d',
    expectedHueRange: 'All colours allowed',
    checkPixel: () => true,
  },
};
