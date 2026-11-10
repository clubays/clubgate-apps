import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

interface LoupeProps {
  sourceElement: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | null;
  point: { x: number; y: number }; // In source native coordinates
  clientPos: { x: number; y: number }; // In viewport screen coordinates
  zoom?: number;
  size?: number;
  className?: string;
}

export const Loupe: React.FC<LoupeProps> = ({
  sourceElement,
  point,
  clientPos,
  zoom = 4,
  size = 110,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!sourceElement || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Turn off smoothing for crisp pixel view
    ctx.imageSmoothingEnabled = false;

    // Sub-region from source: size / zoom
    const sw = size / zoom;
    const sh = size / zoom;
    const sx = point.x - sw / 2;
    const sy = point.y - sh / 2;

    ctx.drawImage(sourceElement, sx, sy, sw, sh, 0, 0, size, size);

    // Crosshairs
    const center = size / 2;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
    ctx.lineWidth = 1;

    // Horizontal crosshair
    ctx.beginPath();
    ctx.moveTo(center - 16, center);
    ctx.lineTo(center - 3, center);
    ctx.moveTo(center + 3, center);
    ctx.lineTo(center + 16, center);
    // Vertical crosshair
    ctx.moveTo(center, center - 16);
    ctx.lineTo(center, center - 3);
    ctx.moveTo(center, center + 3);
    ctx.lineTo(center, center + 16);
    ctx.stroke();

    // Center target ring
    ctx.beginPath();
    ctx.arc(center, center, 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#a3e635';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [sourceElement, point, zoom, size]);

  // Position loupe offset above finger / cursor
  const loupeOffset = size / 2 + 35;
  const top = Math.max(10, clientPos.y - loupeOffset - size / 2);
  const left = Math.max(10, Math.min(window.innerWidth - size - 10, clientPos.x - size / 2));

  return (
    <div
      className={cn(
        'fixed pointer-events-none z-50 rounded-full border-2 border-[var(--accent)] shadow-[0_0_20px_rgba(34,211,238,0.4)] overflow-hidden bg-black/90',
        className
      )}
      style={{
        width: size,
        height: size,
        top,
        left,
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-1.5 left-0 right-0 text-center font-mono text-[9px] text-[var(--accent)] font-bold tracking-widest bg-black/60 py-0.5">
        {zoom}× ZOOM
      </div>
    </div>
  );
};
