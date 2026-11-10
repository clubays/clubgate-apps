export type UnitSystem = 'km/h' | 'mph' | 'm/s';
export type ThemeMode = 'night' | 'day';

export interface Point2D {
  x: number;
  y: number;
}

export interface LineSegment {
  p1: Point2D;
  p2: Point2D;
}

export type CalibrationMode = 'gates' | 'homography';

export interface Calibration {
  id: string;
  label: string;
  mode: CalibrationMode;
  videoWidth: number;
  videoHeight: number;
  gateA: LineSegment;
  gateB: LineSegment;
  distanceM: number;
  homography?: number[]; // 3x3 matrix in row-major order (length 9)
  pixelsPerMetre: number;
  createdAt: number;
}

export interface BallColorPreset {
  id: string;
  label: string;
  hMin: number;
  hMax: number;
  sMin: number;
  sMax: number;
  vMin: number;
  vMax: number;
  colorHex: string;
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  calibrationId: string;
  ballPreset: string;
  bowler?: string;
  notes?: string;
}

export interface TrackPoint {
  t: number; // seconds (performance.now() / 1000 or mediaTime)
  x: number; // original frame coordinates
  y: number;
  conf: number; // 0..1
}

export type DeliveryMethod = 'gates' | 'fit';
export type ConfidenceLevel = 'high' | 'low';

export interface Delivery {
  id: string;
  sessionId: string;
  createdAt: number;
  speedMps: number;
  gateSpeedMps?: number;
  fitSpeedMps?: number;
  uncertaintyMps: number;
  method: DeliveryMethod;
  preBounce: boolean;
  r2: number;
  confidence: ConfidenceLevel;
  track: TrackPoint[];
  snapshot: string; // data URL JPEG
  bowler?: string;
  notes?: string;
}

export type DeliveryState = 'IDLE' | 'ARMED' | 'TRACKING' | 'CAPTURED' | 'COOLDOWN';

export interface SpeedClass {
  name: string;
  minKmh: number;
  maxKmh: number;
  badgeClass: string;
}

export interface Settings {
  units: UnitSystem;
  theme: ThemeMode;
  ballPreset: string;
  customHsv: {
    hMin: number;
    hMax: number;
    sMin: number;
    sMax: number;
    vMin: number;
    vMax: number;
  };
  sensitivity: number; // 10..50 (default 22)
  workWidth: 320 | 480 | 640;
  minSpeedKmh: number;
  cooldownSeconds: number;
  beep: boolean;
  vibration: boolean;
  speech: boolean;
  preferredCameraId?: string;
  preferredResolution: '720p' | '1080p';
  targetFps: 30 | 60 | 120;
}

export interface WorkerFrameMessage {
  type: 'PROCESS_FRAME';
  bitmap: ImageBitmap;
  timestamp: number;
  workW: number;
  settings: {
    sensitivity: number;
    ballColor: {
      hMin: number;
      hMax: number;
      sMin: number;
      sMax: number;
      vMin: number;
      vMax: number;
    };
    pixelsPerMetre: number;
    gateA: LineSegment;
    gateB: LineSegment;
    distanceM: number;
    minSpeedKmh: number;
    isArmed: boolean;
  };
}

export interface WorkerResetMessage {
  type: 'RESET';
}

export interface WorkerResultMessage {
  type: 'FRAME_PROCESSED';
  timestamp: number;
  processingMs: number;
  detectedCandidate?: {
    x: number; // working frame
    y: number;
    radius: number;
    confidence: number;
  };
  trackState?: {
    id: number;
    x: number; // original frame coords
    y: number;
    vx: number;
    vy: number;
    confirmed: boolean;
    points: TrackPoint[];
  };
  deliveryEvent?: {
    type: 'CAPTURED';
    speedMps: number;
    gateSpeedMps?: number;
    fitSpeedMps?: number;
    uncertaintyMps: number;
    method: DeliveryMethod;
    preBounce: boolean;
    r2: number;
    confidence: ConfidenceLevel;
    track: TrackPoint[];
    crossedGateB: boolean;
  };
  state: DeliveryState;
}
