import { LineSegment, Point2D, TrackPoint } from '@/types';

export function distance(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function pointToLineDistance(p: Point2D, line: LineSegment): number {
  const { p1, p2 } = line;
  const l2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
  if (l2 === 0) return distance(p, p1);

  // Project point onto line segment
  const t = Math.max(0, Math.min(1, ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2));
  const projection = {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };
  return distance(p, projection);
}

export interface SegmentIntersection {
  intersects: boolean;
  u: number; // parameter along seg1 [0, 1]
  v: number; // parameter along seg2 [0, 1]
  point?: Point2D;
}

/**
 * Checks if segment (p1 -> p2) intersects segment (q1 -> q2)
 */
export function findSegmentIntersection(
  p1: Point2D,
  p2: Point2D,
  q1: Point2D,
  q2: Point2D
): SegmentIntersection {
  const rx = p2.x - p1.x;
  const ry = p2.y - p1.y;
  const sx = q2.x - q1.x;
  const sy = q2.y - q1.y;

  const rCrossS = rx * sy - ry * sx;
  const qMinusP_x = q1.x - p1.x;
  const qMinusP_y = q1.y - p1.y;

  if (Math.abs(rCrossS) < 1e-9) {
    // Parallel or collinear
    return { intersects: false, u: 0, v: 0 };
  }

  const u = (qMinusP_x * sy - qMinusP_y * sx) / rCrossS;
  const v = (qMinusP_x * ry - qMinusP_y * rx) / rCrossS;

  // We allow a tiny numerical tolerance (1e-4) around boundaries
  const eps = 1e-4;
  if (u >= -eps && u <= 1 + eps && v >= -eps && v <= 1 + eps) {
    const clampedU = Math.max(0, Math.min(1, u));
    return {
      intersects: true,
      u: clampedU,
      v: Math.max(0, Math.min(1, v)),
      point: {
        x: p1.x + clampedU * rx,
        y: p1.y + clampedU * ry,
      },
    };
  }

  return { intersects: false, u, v };
}

export interface GateCrossingResult {
  crossed: boolean;
  t: number; // sub-frame crossing timestamp
  point: Point2D;
  index: number; // index of track point just before crossing
}

/**
 * Evaluates whether a track crossed the gate line and interpolates exact crossing time
 */
export function findGateCrossing(track: TrackPoint[], gate: LineSegment): GateCrossingResult | null {
  if (track.length < 2) return null;

  for (let i = 0; i < track.length - 1; i++) {
    const pA = track[i];
    const pB = track[i + 1];

    const hit = findSegmentIntersection(
      { x: pA.x, y: pA.y },
      { x: pB.x, y: pB.y },
      gate.p1,
      gate.p2
    );

    if (hit.intersects && hit.point) {
      const crossingTime = pA.t + hit.u * (pB.t - pA.t);
      return {
        crossed: true,
        t: crossingTime,
        point: hit.point,
        index: i,
      };
    }
  }

  return null;
}
