import { Calibration, Delivery, Session } from '@/types';

export interface SessionExportBundle {
  version: '1.0';
  exportedAt: string;
  session: Session;
  calibration?: Calibration;
  deliveries: Delivery[];
}

export function toJSON(session: Session, deliveries: Delivery[], calibration?: Calibration): string {
  const bundle: SessionExportBundle = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    session,
    calibration,
    deliveries,
  };

  return JSON.stringify(bundle, null, 2);
}
