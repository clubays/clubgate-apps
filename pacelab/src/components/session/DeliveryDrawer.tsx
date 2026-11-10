import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { CornerBrackets } from '@/components/brand/CornerBrackets';
import { Delivery, UnitSystem } from '@/types';
import { formatDateTime } from '@/utils/time';
import { formatSpeed, formatUncertainty, getSpeedClass } from '@/utils/units';
import { X, Trash2, Save, Activity, Target, ShieldCheck, AlertTriangle } from 'lucide-react';

interface DeliveryDrawerProps {
  delivery: Delivery | null;
  isOpen: boolean;
  units: UnitSystem;
  onClose: () => void;
  onSaveMetadata: (id: string, updates: { bowler?: string; notes?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const DeliveryDrawer: React.FC<DeliveryDrawerProps> = ({
  delivery,
  isOpen,
  units,
  onClose,
  onSaveMetadata,
  onDelete,
}) => {
  const [bowler, setBowler] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (delivery) {
      setBowler(delivery.bowler || '');
      setNotes(delivery.notes || '');
    }
  }, [delivery]);

  if (!isOpen || !delivery) return null;

  const speedClass = getSpeedClass(delivery.speedMps);
  const formattedSpeed = formatSpeed(delivery.speedMps, units, 1);
  const formattedUncertainty = formatUncertainty(delivery.uncertaintyMps, units, 1);

  const gateSpeedFormatted = delivery.gateSpeedMps
    ? formatSpeed(delivery.gateSpeedMps, units, 1)
    : '--.-';
  const fitSpeedFormatted = delivery.fitSpeedMps
    ? formatSpeed(delivery.fitSpeedMps, units, 1)
    : '--.-';

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveMetadata(delivery.id, { bowler, notes });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recorded ball?')) {
      setIsDeleting(true);
      await onDelete(delivery.id);
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-[var(--surface)] border-l border-[var(--line)] shadow-2xl h-full flex flex-col z-10 overflow-y-auto">
        <CornerBrackets />

        {/* Top bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[var(--muted)]">DELIVERY INSPECT</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${speedClass.badgeClass}`}>
              {speedClass.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 space-y-6">
          {/* Snapshot with trail */}
          <div className="relative rounded-[6px] overflow-hidden border border-[var(--line)] bg-black aspect-video flex items-center justify-center">
            {delivery.snapshot ? (
              <img
                src={delivery.snapshot}
                alt="Delivery gate crossing snapshot"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs font-mono text-[var(--muted)]">NO SNAPSHOT AVAILABLE</div>
            )}
            <div className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-white">
              {delivery.track.length} Track Points
            </div>
          </div>

          {/* Headline Speed Card */}
          <div className="p-4 rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] text-center relative overflow-hidden">
            <div className="text-xs font-mono text-[var(--muted)] uppercase mb-1">
              Headline Speed ({delivery.method === 'gates' ? 'Gate Timing' : 'Fit Only'})
            </div>
            <div className="text-5xl font-bold font-mono text-[var(--speed)] tracking-tight">
              {formattedSpeed} <span className="text-sm text-[var(--muted)] font-normal">{units}</span>
            </div>
            <div className="text-xs font-mono text-[var(--muted)] mt-1">
              Uncertainty: <span className="text-[var(--text)] font-semibold">{formattedUncertainty} {units}</span>
            </div>
          </div>

          {/* Technical Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded border border-[var(--line)] bg-[var(--surface)]">
              <div className="text-[var(--muted)] mb-1">GATE SPEED</div>
              <div className="font-semibold text-sm text-[var(--text)]">
                {gateSpeedFormatted} {units}
              </div>
            </div>

            <div className="p-3 rounded border border-[var(--line)] bg-[var(--surface)]">
              <div className="text-[var(--muted)] mb-1">FIT SPEED (LSQ)</div>
              <div className="font-semibold text-sm text-[var(--text)]">
                {fitSpeedFormatted} {units}
              </div>
            </div>

            <div className="p-3 rounded border border-[var(--line)] bg-[var(--surface)]">
              <div className="text-[var(--muted)] mb-1">TRAJECTORY R²</div>
              <div className="font-semibold text-sm text-[var(--text)]">
                {delivery.r2 ? delivery.r2.toFixed(4) : '--'}
              </div>
            </div>

            <div className="p-3 rounded border border-[var(--line)] bg-[var(--surface)]">
              <div className="text-[var(--muted)] mb-1">CONFIDENCE</div>
              <div className={`font-semibold text-sm flex items-center gap-1 ${delivery.confidence === 'high' ? 'text-[var(--speed)]' : 'text-[var(--warn)]'}`}>
                {delivery.confidence === 'high' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {delivery.confidence.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Bounce & Timestamp Info */}
          <div className="text-xs font-mono text-[var(--muted)] space-y-1 p-3 rounded border border-[var(--line)] bg-[var(--surface)]">
            <div>Recorded: <span className="text-[var(--text)]">{formatDateTime(delivery.createdAt)}</span></div>
            <div>Phase: <span className="text-[var(--text)]">{delivery.preBounce ? 'Pre-pitch bounce window' : 'Full trajectory'}</span></div>
          </div>

          {/* Bowler & Notes Form */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                BOWLER NAME
              </label>
              <input
                type="text"
                value={bowler}
                onChange={(e) => setBowler(e.target.value)}
                placeholder="e.g. Anderson, Bumrah"
                className="w-full px-3 py-2 text-sm rounded-[4px] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-hidden focus:border-[var(--accent)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                NOTES & DELIVERY TAGS
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Good length outswinger, bouncer, yorker"
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-[4px] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-hidden focus:border-[var(--accent)] font-mono resize-none"
              />
            </div>

            <Button
              variant="secondary"
              onClick={handleSave}
              isLoading={isSaving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Details
            </Button>
          </div>
        </div>

        {/* Footer Delete */}
        <div className="p-4 sm:p-5 border-t border-[var(--line)] flex justify-between items-center bg-[var(--surface-2)]">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Ball
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
