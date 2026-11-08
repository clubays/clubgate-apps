import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, RefreshCw, ZoomIn, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { LANDMARK_DEFINITIONS } from '../../data/landmarks.js';
import { generatePitchGridLines } from '../../functions/calibration.js';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';

export default function CalibrationOverlay({ videoRef, containerRef }) {
  const calibrationMode = useAnalysisStore((s) => s.calibrationMode);
  const setCalibrationMode = useAnalysisStore((s) => s.setCalibrationMode);
  const landmarkPoints = useAnalysisStore((s) => s.landmarkPoints);
  const addLandmarkPoint = useAnalysisStore((s) => s.addLandmarkPoint);
  const updateLandmarkPoint = useAnalysisStore((s) => s.updateLandmarkPoint);
  const clearLandmarks = useAnalysisStore((s) => s.clearLandmarks);
  const calibration = useAnalysisStore((s) => s.calibration);
  const calibErrorText = useAnalysisStore((s) => s.calibErrorText);
  const videoWidth = useAnalysisStore((s) => s.videoWidth);
  const videoHeight = useAnalysisStore((s) => s.videoHeight);
  const showPitchGrid = useSettingsStore((s) => s.showPitchGrid);

  const [selectedPointIdx, setSelectedPointIdx] = useState(null);
  const [hoverPos, setHoverPos] = useState(null); // { x, y } in client coords
  const canvasRef = useRef(null);

  const defs = LANDMARK_DEFINITIONS[calibrationMode] || LANDMARK_DEFINITIONS.sideOn;
  const currentTargetLandmark = defs[landmarkPoints.length] || null;

  // Convert client click coordinate on container to native video resolution coordinates
  const clientToVideoCoords = (clientX, clientY) => {
    if (!videoRef?.current) return null;
    const rect = videoRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const scaleX = videoWidth / rect.width;
    const scaleY = videoHeight / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return [Math.round(x), Math.round(y)];
  };

  const videoToClientCoords = (vx, vy) => {
    if (!videoRef?.current) return [0, 0];
    const rect = videoRef.current.getBoundingClientRect();
    const scaleX = rect.width / videoWidth;
    const scaleY = rect.height / videoHeight;
    return [rect.left + vx * scaleX, rect.top + vy * scaleY];
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('.no-tap-interfere')) return;
    const coords = clientToVideoCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (landmarkPoints.length < 4) {
      addLandmarkPoint(coords);
      setSelectedPointIdx(landmarkPoints.length);
    } else {
      // Find nearest placed point within 30px
      let nearestIdx = -1;
      let nearestDist = Infinity;
      landmarkPoints.forEach((pt, idx) => {
        const [cx, cy] = videoToClientCoords(pt[0], pt[1]);
        const dist = Math.hypot(cx - e.clientX, cy - e.clientY);
        if (dist < 35 && dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });
      if (nearestIdx >= 0) {
        setSelectedPointIdx(nearestIdx);
      }
    }
  };

  const handlePointerMove = (e) => {
    const coords = clientToVideoCoords(e.clientX, e.clientY);
    if (coords) {
      setHoverPos({
        clientX: e.clientX,
        clientY: e.clientY,
        videoX: coords[0],
        videoY: coords[1],
      });
    }
  };

  const handlePointerLeave = () => {
    setHoverPos(null);
  };

  const nudgeSelected = (dx, dy, isShift = false) => {
    if (selectedPointIdx === null || !landmarkPoints[selectedPointIdx]) return;
    const step = isShift ? 5 : 1;
    const curr = landmarkPoints[selectedPointIdx];
    updateLandmarkPoint(selectedPointIdx, [curr[0] + dx * step, curr[1] + dy * step]);
  };

  // Keyboard nudge arrows
  useEffect(() => {
    function onKeyDown(e) {
      if (selectedPointIdx === null) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        nudgeSelected(0, -1, e.shiftKey);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nudgeSelected(0, 1, e.shiftKey);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nudgeSelected(-1, 0, e.shiftKey);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nudgeSelected(1, 0, e.shiftKey);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPointIdx, landmarkPoints]);

  // Render 1m grid marks onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef?.current) return;
    const ctx = canvas.getContext('2d');
    const rect = videoRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (calibration && showPitchGrid) {
      const gridTicks = generatePitchGridLines(calibration);
      const scaleX = rect.width / videoWidth;
      const scaleY = rect.height / videoHeight;

      ctx.strokeStyle = 'rgba(198, 255, 61, 0.4)';
      ctx.lineWidth = 1;

      gridTicks.forEach((tick) => {
        const bx = tick.base[0] * scaleX;
        const by = tick.base[1] * scaleY;
        const tx = tick.top[0] * scaleX;
        const ty = tick.top[1] * scaleY;

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(tx, ty);
        if (tick.isStumpLine) {
          ctx.strokeStyle = '#c6ff3d';
          ctx.lineWidth = 2.5;
        } else if (tick.isPoppingCrease) {
          ctx.strokeStyle = '#e8eef5';
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = 'rgba(198, 255, 61, 0.3)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();

        // Meter label at ground
        if (tick.x % 2 === 0 || tick.isStumpLine) {
          ctx.fillStyle = '#c6ff3d';
          ctx.font = '9px monospace';
          ctx.fillText(`${tick.x}m`, bx - 6, by + 12);
        }
      });
    }
  }, [calibration, showPitchGrid, videoWidth, videoHeight]);

  return (
    <div
      className="absolute inset-0 z-20 cursor-crosshair overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top Banner Instruction */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 no-tap-interfere pointer-events-auto">
        <div className="bg-[#121923]/90 backdrop-blur-md border border-[#243146] px-3 py-2 rounded-xl text-xs flex items-center gap-3">
          <div className="flex bg-[#0b0f14] p-0.5 rounded-lg border border-[#243146] text-xs">
            <button
              onClick={() => setCalibrationMode('sideOn')}
              className={`px-2 py-1 rounded font-bold ${
                calibrationMode === 'sideOn' ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'text-[#8a9ab0]'
              }`}
            >
              Side-on (Stumps)
            </button>
            <button
              onClick={() => setCalibrationMode('behindArm')}
              className={`px-2 py-1 rounded font-bold ${
                calibrationMode === 'behindArm' ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'text-[#8a9ab0]'
              }`}
            >
              Behind-the-arm
            </button>
          </div>

          <div className="font-semibold text-[#e8eef5]">
            {currentTargetLandmark ? (
              <span>
                Tap #{landmarkPoints.length + 1}: <strong className="text-[#c6ff3d]">{currentTargetLandmark.name}</strong>
              </span>
            ) : (
              <span className="text-[#2fd27e] flex items-center gap-1">
                <Check className="w-4 h-4" /> Calibrated! RMS Error:{' '}
                <strong>{calibration?.rmsCm?.toFixed(1)} cm</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {landmarkPoints.length > 0 && (
            <button
              onClick={clearLandmarks}
              className="px-3 py-1.5 rounded-lg bg-[#182231] hover:bg-[#243146] text-xs font-semibold text-[#8a9ab0] hover:text-[#e8eef5] border border-[#243146] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Taps</span>
            </button>
          )}
        </div>
      </div>

      {/* Warnings & Errors */}
      {calibErrorText && (
        <div className="absolute top-16 left-3 right-3 z-30 bg-[#e5473f]/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg no-tap-interfere">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{calibErrorText}</span>
        </div>
      )}

      {calibration && calibration.rmsCm > 5.0 && (
        <div className="absolute top-16 left-3 right-3 z-30 bg-[#ffb020] text-[#0b0f14] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg no-tap-interfere">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Calibration looks off ({calibration.rmsCm.toFixed(1)} cm RMS error &gt; 5 cm). Re-tap the landmarks for maximum accuracy.</span>
        </div>
      )}

      {/* Render tapped points */}
      {videoRef?.current &&
        landmarkPoints.map((pt, idx) => {
          const rect = videoRef.current.getBoundingClientRect();
          const cx = (pt[0] / videoWidth) * rect.width;
          const cy = (pt[1] / videoHeight) * rect.height;
          const isSelected = selectedPointIdx === idx;

          return (
            <div
              key={idx}
              style={{ left: `${cx}px`, top: `${cy}px` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-[10px] ${
                  isSelected
                    ? 'border-[#c6ff3d] bg-[#c6ff3d] text-[#0b0f14] shadow-lg scale-110'
                    : 'border-white bg-[#0b0f14]/80 text-white'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-[10px] font-bold text-white bg-black/75 px-1 rounded mt-0.5 whitespace-nowrap">
                {defs[idx]?.name}
              </span>
            </div>
          );
        })}

      {/* 4x Magnifier Loupe Circle above hover pointer */}
      {hoverPos && videoRef?.current && (
        <div
          className="fixed pointer-events-none rounded-full border-2 border-[#c6ff3d] shadow-2xl bg-[#0b0f14] overflow-hidden z-40"
          style={{
            width: '120px',
            height: '120px',
            left: `${hoverPos.clientX - 60}px`,
            top: `${hoverPos.clientY - 140}px`, // Float 80px above cursor
          }}
        >
          {/* Zoomed view of video canvas */}
          <div
            className="w-full h-full relative"
            style={{
              transform: 'scale(4)',
              transformOrigin: `${(hoverPos.videoX / videoWidth) * 100}% ${(hoverPos.videoY / videoHeight) * 100}%`,
            }}
          >
            <img
              src={videoRef.current.src}
              className="hidden"
              alt=""
            />
          </div>
          {/* Crosshair inside loupe */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-0.5 bg-[#c6ff3d]" />
            <div className="h-4 w-0.5 bg-[#c6ff3d] absolute" />
            <div className="w-1.5 h-1.5 rounded-full border border-[#0b0f14] bg-[#c6ff3d] absolute" />
          </div>
        </div>
      )}

      {/* Nudge Control pad for selected landmark */}
      {selectedPointIdx !== null && (
        <div className="absolute bottom-4 right-4 bg-[#121923]/95 border border-[#243146] p-2.5 rounded-xl flex flex-col items-center gap-1 no-tap-interfere shadow-2xl pointer-events-auto">
          <span className="text-[10px] font-bold text-[#8a9ab0] uppercase">
            Nudge #{selectedPointIdx + 1}
          </span>
          <button
            onClick={() => nudgeSelected(0, -1)}
            className="p-1.5 bg-[#182231] hover:bg-[#243146] rounded text-[#e8eef5]"
            title="Up (1px, Shift=5px)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => nudgeSelected(-1, 0)}
              className="p-1.5 bg-[#182231] hover:bg-[#243146] rounded text-[#e8eef5]"
              title="Left (1px)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => nudgeSelected(1, 0)}
              className="p-1.5 bg-[#182231] hover:bg-[#243146] rounded text-[#e8eef5]"
              title="Right (1px)"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => nudgeSelected(0, 1)}
            className="p-1.5 bg-[#182231] hover:bg-[#243146] rounded text-[#e8eef5]"
            title="Down (1px)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
