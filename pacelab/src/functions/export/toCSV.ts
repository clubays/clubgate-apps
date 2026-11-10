import { Delivery, Session } from '@/types';

/**
 * Generates RFC 4180 compliant CSV export for a session's deliveries
 */
export function toCSV(session: Session, deliveries: Delivery[]): string {
  const headers = [
    'index',
    'timestamp',
    'speed_kmh',
    'speed_mph',
    'speed_mps',
    'uncertainty_kmh',
    'method',
    'pre_bounce',
    'confidence',
    'bowler',
    'notes',
  ];

  const rows = deliveries.map((d, idx) => {
    const kmh = (d.speedMps * 3.6).toFixed(1);
    const mph = (d.speedMps * 2.236936).toFixed(1);
    const mps = d.speedMps.toFixed(2);
    const uncKmh = (d.uncertaintyMps * 3.6).toFixed(1);
    const timeIso = new Date(d.createdAt).toISOString();
    const bowler = (d.bowler || session.bowler || '').replace(/"/g, '""');
    const notes = (d.notes || '').replace(/"/g, '""');

    return [
      idx + 1,
      timeIso,
      kmh,
      mph,
      mps,
      uncKmh,
      d.method,
      d.preBounce ? 'true' : 'false',
      d.confidence,
      `"${bowler}"`,
      `"${notes}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
