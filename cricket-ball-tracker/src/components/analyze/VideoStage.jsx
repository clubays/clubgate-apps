import React, { useRef, useState } from 'react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import CalibrationOverlay from './CalibrationOverlay.jsx';
import TrackOverlay from './TrackOverlay.jsx';

export default function VideoStage({ videoRef }) {
  const step = useAnalysisStore((s) => s.step);
  const videoUrl = useAnalysisStore((s) => s.videoUrl);
  const setCurrentTime = useAnalysisStore((s) => s.setCurrentTime);
  const setIsPlaying = useAnalysisStore((s) => s.setIsPlaying);

  const containerRef = useRef(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleWheel = (e) => {
    // Only zoom if ctrl/meta is held or right click/wheel
    if (e.ctrlKey || e.metaKey || step === 4) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      setZoom((prev) => Math.max(1.0, Math.min(4.0, prev * zoomFactor)));
    }
  };

  const handlePointerDown = (e) => {
    // Middle click or drag with Alt/Shift for panning
    if (e.button === 1 || e.altKey || (e.button === 0 && zoom > 1.05 && step === 4)) {
      setIsPanning(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const resetPanZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="video-stage-wrapper"
    >
      <div
        className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <video
          ref={videoRef}
          src={videoUrl || undefined}
          playsInline
          muted
          crossOrigin="anonymous"
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="max-h-[calc(100vh-220px)] max-w-full object-contain pointer-events-none rounded-lg shadow-2xl"
        />

        {/* Overlays */}
        {step === 2 && <CalibrationOverlay videoRef={videoRef} containerRef={containerRef} />}
        {step >= 3 && <TrackOverlay videoRef={videoRef} />}
      </div>

      {/* Zoom indicator & reset button */}
      {zoom > 1.05 && (
        <button
          onClick={resetPanZoom}
          className="absolute bottom-4 left-4 z-30 px-3 py-1 bg-[#121923]/90 text-xs font-bold text-[#c6ff3d] rounded-lg border border-[#243146] hover:bg-[#182231]"
        >
          Zoom: {Math.round(zoom * 100)}% (Reset)
        </button>
      )}
    </div>
  );
}
