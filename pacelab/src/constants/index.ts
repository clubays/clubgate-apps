import { BallColorPreset, Settings, SpeedClass } from '@/types';

export const PITCH_PRESETS = [
  {
    id: 'stumps_to_stumps',
    label: 'Stumps to stumps (22 yards)',
    distanceM: 20.12,
    description: 'Distance between bowling crease stump line and batting stump line',
  },
  {
    id: 'crease_to_crease',
    label: 'Crease to crease (popping)',
    distanceM: 17.68,
    description: 'Distance between popping creases (1.22m in front of stumps)',
  },
  {
    id: 'half_pitch',
    label: 'Half pitch / Practice nets',
    distanceM: 10.06,
    description: 'Half length pitch for indoor or short nets',
  },
  {
    id: 'custom',
    label: 'Custom distance',
    distanceM: 15.0,
    description: 'Enter your measured tape distance between the two gate marks',
  },
] as const;

export const BALL_PRESETS: BallColorPreset[] = [
  {
    id: 'red',
    label: 'Red Match Ball',
    hMin: 345, // wrapped in color checker: >= 345 or <= 20
    hMax: 20,
    sMin: 35,
    sMax: 100,
    vMin: 20,
    vMax: 90,
    colorHex: '#dc2626',
  },
  {
    id: 'white',
    label: 'White Match Ball',
    hMin: 0,
    hMax: 360,
    sMin: 0,
    sMax: 30,
    vMin: 70,
    vMax: 100,
    colorHex: '#f8fafc',
  },
  {
    id: 'pink',
    label: 'Pink D/N Ball',
    hMin: 310,
    hMax: 345,
    sMin: 35,
    sMax: 100,
    vMin: 40,
    vMax: 100,
    colorHex: '#ec4899',
  },
  {
    id: 'orange',
    label: 'Orange Training Ball',
    hMin: 15,
    hMax: 45,
    sMin: 55,
    sMax: 100,
    vMin: 50,
    vMax: 100,
    colorHex: '#f97316',
  },
  {
    id: 'custom',
    label: 'Custom HSV',
    hMin: 0,
    hMax: 360,
    sMin: 0,
    sMax: 100,
    vMin: 0,
    vMax: 100,
    colorHex: '#eab308',
  },
];

export const SPEED_CLASSES: SpeedClass[] = [
  { name: 'Spin', minKmh: 0, maxKmh: 95, badgeClass: 'text-sky-400 border-sky-500/40 bg-sky-950/40' },
  { name: 'Medium', minKmh: 95, maxKmh: 125, badgeClass: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
  { name: 'Medium-Fast', minKmh: 125, maxKmh: 135, badgeClass: 'text-orange-400 border-orange-500/40 bg-orange-950/40' },
  { name: 'Fast', minKmh: 135, maxKmh: 145, badgeClass: 'text-lime-400 border-lime-500/40 bg-lime-950/40' },
  { name: 'Express', minKmh: 145, maxKmh: 200, badgeClass: 'text-rose-400 border-rose-500/40 bg-rose-950/40 shadow-rose-500/20 shadow-sm' },
];

export const CRICKET_BALL_DIAMETER_M = 0.072; // 7.2 cm diameter (224-229mm circumference)

export const DEFAULT_SETTINGS: Settings = {
  units: 'km/h',
  theme: 'night',
  ballPreset: 'red',
  customHsv: {
    hMin: 345,
    hMax: 20,
    sMin: 35,
    sMax: 100,
    vMin: 20,
    vMax: 90,
  },
  sensitivity: 22,
  workWidth: 480,
  minSpeedKmh: 40,
  cooldownSeconds: 2.5,
  beep: true,
  vibration: true,
  speech: true,
  preferredResolution: '720p',
  targetFps: 60,
};
