import React, { useEffect, useRef } from 'react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';

export default function TrackOverlay({ videoRef }) {
  const canvasRef = useRef(null);
  const currentTime = useAnalysisStore((s) => s.currentTime);
  const deliveries = useAnalysisStore((s) => s.deliveries);
  const selectedDeliveryIdx = useAnalysisStore((s) => s.selectedDeliveryIdx);
  const videoWidth = useAnalysisStore((s) => s.videoWidth);
  const videoHeight = useAnalysisStore((s) => s.videoHeight);
  const isManualFixMode = useAnalysisStore((s) => s.isManualFixMode);
  const setManualDetectionAtTime = useAnalysisStore((s) => s.setManualDetectionAtTime);

  const showDebugGate = useSettingsStore((s) => s.showDebugGate);

  const selectedDelivery = deliveries[selectedDeliveryIdx] || null;

  // Handle click in manual fix mode
  const handlePointerDown = (e) => {
    if (!isManualFixMode || !videoRef?.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const scaleX = videoWidth / rect.width;
    const scaleY = videoHeight / rect.height;

    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    setManualDetectionAtTime(currentTime, px, py);
  };

  // Render canvas overlay on time/state change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef?.current) return;
    const ctx = canvas.getContext('2d');
    const rect = videoRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!selectedDelivery || !selectedDelivery.points) return;

    const scaleX = rect.width / videoWidth;
    const scaleY = rect.height / videoHeight;

    const points = selectedDelivery.points;

    // Filter points around currentTime (e.g. up to current time for flight trail)
    const activePoints = points.filter((p) => p.t <= currentTime);
    const last12 = activePoints.slice(-12);

    // Draw fading trajectory trail (last 12 points)
    if (last12.length >= 2) {
      for (let i = 1; i < last12.length; i++) {
        const p1 = last12[i - 1];
        const p2 = last12[i];
        const alpha = (i / last12.length) * 0.9;

        ctx.beginPath();
        ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
        ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
        ctx.strokeStyle = `rgba(198, 255, 61, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Find current point closest to currentTime (within 0.05s)
    let currentPt = null;
    let minDt = Infinity;
    for (const p of points) {
      const dt = Math.abs(p.t - currentTime);
      if (dt < minDt && dt < 0.06) {
        minDt = dt;
        currentPt = p;
      }
    }

    if (currentPt) {
      const cx = currentPt.x * scaleX;
      const cy = currentPt.y * scaleY;
      const cr = (currentPt.r || 8) * scaleX;

      // Draw ball outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(cr, 8), 0, Math.PI * 2);
      ctx.strokeStyle = currentPt.isManual ? '#ffb020' : '#c6ff3d';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = currentPt.isManual ? '#ffb020' : '#c6ff3d';
      ctx.fill();

      // Label
      ctx.fillStyle = '#e8eef5';
      ctx.font = 'bold 11px Inter, sans-serif';
      const labelText = currentPt.isManual
        ? 'MANUAL LOCK'
        : currentPt.interpolated
        ? 'INTERPOLATED'
        : 'BALL';
      ctx.fillText(labelText, cx + 12, cy - 8);

      // Debug gating ellipse (± gate)
      if (showDebugGate) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, cr * 2.8, cr * 2.0, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 176, 32, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [currentTime, selectedDelivery, videoWidth, videoHeight, showDebugGate]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      className={`absolute inset-0 z-10 pointer-events-${isManualFixMode ? 'auto cursor-crosshair' : 'none'}`}
    />
  );
}
