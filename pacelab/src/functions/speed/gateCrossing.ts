import { LineSegment, TrackPoint } from '@/types';
import { findGateCrossing, GateCrossingResult } from '@/utils/geometry';

export function evaluateGateCrossing(track: TrackPoint[], gate: LineSegment): GateCrossingResult | null {
  return findGateCrossing(track, gate);
}
