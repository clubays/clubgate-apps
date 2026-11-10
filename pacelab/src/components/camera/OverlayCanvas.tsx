import React, { useEffect, useRef } from 'react';
import { Calibration, DeliveryState, TrackPoint } from '@/types';
import { cn } from '@/utils/cn';

interface OverlayCanvasProps {
  calibration: Calibration | null;
  state: DeliveryState;
  showGates: boolean;
  activeCandidate?: { x: number; y: number; radius: number; confidence: number };
  activeTrack?: { points: TrackPoint[]; isConfirmed: boolean };
  videoWidth: number;
  videoHeight: number;
  className?: string;
}

export const OverlayCanvas: React.FC<OverlayCanvasProps> = ({
  calibration,
  state,
  showGates,
  activeCandidate,
  activeTrack,
  videoWidth,
  videoHeight,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || videoWidth <= 0 || videoHeight <= 0) return;

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // 1. Draw Gate Lines
    if (showGates && calibration) {
      const drawGate = (gate: typeof calibration.gateA, label: string, color: string) => {
        const { p1, p2 } = gate;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // End caps
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
        ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Gate Label Badge
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        ctx.font = 'bold 13px var(--font-mono)';
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = '#05080c';
        ctx.fillRect(midX - textWidth / 2 - 8, midY - 11, textWidth + 16, 22);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - textWidth / 2 - 8, midY - 11, textWidth + 16, 22);

        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, midX, midY);

        ctx.restore();
      };

      drawGate(calibration.gateA, 'GATE A', '#22d3ee');
      drawGate(calibration.gateB, 'GATE B', '#22d3ee');
    }

    // 2. Draw Trajectory Trail
    if (activeTrack && activeTrack.points.length > 1) {
      const points = activeTrack.points;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const ageProgress = (i + 1) / points.length; // 0 (oldest) to 1 (newest)

        ctx.strokeStyle = `rgba(163, 230, 53, ${Math.max(0.2, ageProgress)})`;
        ctx.lineWidth = Math.max(1.5, ageProgress * 4.5);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw glowing dot at newest track position
      const head = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#a3e635';
      ctx.shadowColor = '#a3e635';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.restore();
    }

    // 3. Draw Detected Ball Candidate Ring
    if (activeCandidate) {
      ctx.save();
      const scaleX = videoWidth / 480; // from workWidth
      const cx = activeCandidate.x * scaleX;
      const cy = activeCandidate.y * scaleX;
      const rad = Math.max(6, activeCandidate.radius * scaleX);

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, rad + 4, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair tick marks
      ctx.beginPath();
      ctx.moveTo(cx - rad - 8, cy); ctx.lineTo(cx - rad, cy);
      ctx.moveTo(cx + rad, cy); ctx.lineTo(cx + rad + 8, cy);
      ctx.moveTo(cx, cy - rad - 8); ctx.lineTo(cx, cy - rad);
      ctx.moveTo(cx, cy + rad); ctx.lineTo(cx, cy + rad + 8);
      ctx.stroke();

      ctx.restore();
    }
  }, [calibration, state, showGates, activeCandidate, activeTrack, videoWidth, videoHeight]);

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <canvas
        ref={canvasRef}
        aria-label="Ball trajectory and gate timing overlay"
        className="w-full h-full object-contain"
      />

      {/* Viewport Border Flash on Capture */}
      {state === 'CAPTURED' && (
        <div className="absolute inset-0 border-4 border-[var(--speed)] shadow-[inset_0_0_40px_rgba(163,230,53,0.5)] animate-pulse" />
      )}
    </div>
  );
};
