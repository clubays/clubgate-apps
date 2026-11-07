/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MODEL_REGISTRY } from '@/models';
import { Lights } from './Lights';
import { CameraRig } from './CameraRig';
import { Labels } from './Labels';
import { StageLoader } from './Loader';
import { Hotspot } from '@/types';
import { useStageStore } from '@/store/useStageStore';
import { RotateCcw, Tag, Maximize2, Minimize2, Eye, EyeOff, Layers } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StageCanvasProps {
  modelId: string;
  hotspots?: Hotspot[];
  simulationState?: any;
  className?: string;
}

export function StageCanvas({
  modelId,
  hotspots = [],
  simulationState,
  className,
}: StageCanvasProps) {
  const {
    selectedHotspot,
    setSelectedHotspot,
    highlightedParts,
    exploded,
    setExploded,
    showLabels,
    setShowLabels,
    triggerResetCamera,
    isCinematic,
    toggleCinematic,
  } = useStageStore();

  const [hasGlError, setHasGlError] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Check WebGL availability
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setHasGlError(true);
      }
    } catch {
      setHasGlError(true);
    }
  }, []);

  const ModelComponent = MODEL_REGISTRY[modelId] || MODEL_REGISTRY.cell;

  if (hasGlError) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300">
        <svg className="w-24 h-24 text-amber-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
          3D Hardware Acceleration Unavailable
        </h3>
        <p className="text-xs max-w-sm text-center text-stone-500 mb-4">
          WebGL context could not be initialized. You can still explore the lesson text, diagrams, and quizzes normally.
        </p>
        <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-xs w-full max-w-xs space-y-1">
          <div className="font-semibold text-stone-900 dark:text-stone-100">Hotspot Key Structures:</div>
          {hotspots.map((h) => (
            <div key={h.id} className="text-stone-600 dark:text-stone-300">
              • <strong>{h.label}</strong>: {h.description}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full select-none overflow-hidden bg-[#faf8f5] dark:bg-[#090b0e]', className)}>
      {/* 3D Canvas Viewport */}
      <Suspense fallback={<StageLoader />}>
        <Canvas
          dpr={[1, 2]}
          gl={{
            powerPreference: 'high-performance',
            antialias: true,
          }}
          camera={{ position: [0, 1.5, 6.5], fov: 45 }}
          className="w-full h-full touch-none"
        >
          <Lights />
          <CameraRig />

          <group position={[0, 0, 0]}>
            <ModelComponent
              highlightedParts={highlightedParts}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
              simulationState={simulationState}
              exploded={exploded}
              showLabels={showLabels}
            />

            <Labels
              hotspots={hotspots}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
              showLabels={showLabels}
            />
          </group>
        </Canvas>
      </Suspense>

      {/* Top Left Keyboard Nav Reminder Pill */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-xl border border-stone-200/80 dark:border-stone-800 text-[11px] font-mono text-stone-600 dark:text-stone-400 pointer-events-none shadow-xs">
        <span>Orbit: Left Drag</span>
        <span>•</span>
        <span>Pan: WASD</span>
        <span>•</span>
        <span>Zoom: Scroll</span>
      </div>

      {/* Top Right Quick Toggles */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        <button
          onClick={toggleCinematic}
          className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-600 shadow-xs transition-colors cursor-pointer"
          title={isCinematic ? 'Exit Full Cinema Mode' : 'Enter Full Cinema Mode'}
          aria-label="Toggle full screen cinema mode"
        >
          {isCinematic ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Unified Bottom Control Dock */}
      <div
        className={cn(
          'absolute bottom-4 left-1/2 -translate-x-1/2 z-10 transition-transform duration-300 ease-out',
          isDockCollapsed ? 'translate-y-16' : 'translate-y-0'
        )}
      >
        {/* Dock Drawer Handle Tab */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className="px-3 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-b-0 border-stone-200 dark:border-stone-800 rounded-t-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
          >
            {isDockCollapsed ? '▴ Controls' : '▾ Hide'}
          </button>
        </div>

        {/* Dock Controls Container */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 rounded-2xl shadow-lg text-xs text-stone-700 dark:text-stone-300">
          {/* Exploded View Slider */}
          <div className="flex items-center gap-2 pr-2 border-r border-stone-200 dark:border-stone-800">
            <Layers size={14} className="text-stone-400" />
            <span className="hidden sm:inline">Exploded:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={exploded}
              onChange={(e) => setExploded(parseFloat(e.target.value))}
              className="w-18 sm:w-24 h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              title="Separate 3D layers"
            />
          </div>

          {/* Toggle Hotspot Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Toggle hotspot text tags"
          >
            {showLabels ? <Eye size={14} className="text-teal-600" /> : <EyeOff size={14} className="text-stone-400" />}
            <span className="hidden sm:inline">{showLabels ? 'Labels On' : 'Labels Off'}</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={triggerResetCamera}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Reset Camera (Press R)"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
