import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LineSegment, Point2D } from '@/types';
import { Loupe } from './Loupe';

interface GateEditorProps {
  imageSource: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | null;
  nativeWidth: number;
  nativeHeight: number;
  gateA: LineSegment;
  gateB: LineSegment;
  onChangeGateA: (gate: LineSegment) => void;
  onChangeGateB: (gate: LineSegment) => void;
  className?: string;
}

type HandleKey = 'A1' | 'A2' | 'B1' | 'B2';

export const GateEditor: React.FC<GateEditorProps> = ({
  imageSource,
  nativeWidth,
  nativeHeight,
  gateA,
  gateB,
  onChangeGateA,
  onChangeGateB,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHandle, setSelectedHandle] = useState<HandleKey | null>('A1');
  const [activeDragging, setActiveDragging] = useState<HandleKey | null>(null);
  const [loupeClientPos, setLoupeClientPos] = useState<{ x: number; y: number } | null>(null);

  // Coordinate conversion between screen and native image pixels
  const getContainerScale = useCallback(() => {
    const defaultRect = { left: 0, top: 0, width: 1, height: 1 };
    if (!containerRef.current) return { scale: 1, offsetX: 0, offsetY: 0, cw: 1, ch: 1, rect: defaultRect };
    const rect = containerRef.current.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    // contain aspect ratio
    const imgAspect = nativeWidth / nativeHeight;
    const containerAspect = cw / ch;

    let renderW = cw;
    let renderH = ch;
    let offsetX = 0;
    let offsetY = 0;

    if (containerAspect > imgAspect) {
      renderH = ch;
      renderW = ch * imgAspect;
      offsetX = (cw - renderW) / 2;
    } else {
      renderW = cw;
      renderH = cw / imgAspect;
      offsetY = (ch - renderH) / 2;
    }

    const scale = renderW / nativeWidth;
    return { scale, offsetX, offsetY, cw, ch, rect };
  }, [nativeWidth, nativeHeight]);

  const nativeToScreen = useCallback(
    (p: Point2D) => {
      const { scale, offsetX, offsetY } = getContainerScale();
      return {
        x: offsetX + p.x * scale,
        y: offsetY + p.y * scale,
      };
    },
    [getContainerScale]
  );

  const screenToNative = useCallback(
    (clientX: number, clientY: number) => {
      const { scale, offsetX, offsetY, rect } = getContainerScale();
      const relX = clientX - rect.left - offsetX;
      const relY = clientY - rect.top - offsetY;

      const natX = Math.max(0, Math.min(nativeWidth, relX / scale));
      const natY = Math.max(0, Math.min(nativeHeight, relY / scale));
      return { x: natX, y: natY };
    },
    [getContainerScale, nativeWidth, nativeHeight]
  );

  const updateHandlePoint = useCallback(
    (handle: HandleKey, pt: Point2D) => {
      if (handle === 'A1') {
        onChangeGateA({ ...gateA, p1: pt });
      } else if (handle === 'A2') {
        onChangeGateA({ ...gateA, p2: pt });
      } else if (handle === 'B1') {
        onChangeGateB({ ...gateB, p1: pt });
      } else if (handle === 'B2') {
        onChangeGateB({ ...gateB, p2: pt });
      }
    },
    [gateA, gateB, onChangeGateA, onChangeGateB]
  );

  const getHandlePoint = useCallback(
    (handle: HandleKey): Point2D => {
      switch (handle) {
        case 'A1': return gateA.p1;
        case 'A2': return gateA.p2;
        case 'B1': return gateB.p1;
        case 'B2': return gateB.p2;
      }
    },
    [gateA, gateB]
  );

  // Pointer drag handling
  const handlePointerDown = (handle: HandleKey, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedHandle(handle);
    setActiveDragging(handle);
    setLoupeClientPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragging) return;
    const pt = screenToNative(e.clientX, e.clientY);
    updateHandlePoint(activeDragging, pt);
    setLoupeClientPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture release ignored
      }
      setActiveDragging(null);
      setLoupeClientPos(null);
    }
  };

  // Keyboard nudge navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedHandle) return;
      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else if (e.key === 'Tab') {
        e.preventDefault();
        const order: HandleKey[] = ['A1', 'A2', 'B1', 'B2'];
        const nextIdx = (order.indexOf(selectedHandle) + (e.shiftKey ? 3 : 1)) % 4;
        setSelectedHandle(order[nextIdx]);
        return;
      } else {
        return;
      }

      e.preventDefault();
      const curr = getHandlePoint(selectedHandle);
      const updated = {
        x: Math.max(0, Math.min(nativeWidth, curr.x + dx)),
        y: Math.max(0, Math.min(nativeHeight, curr.y + dy)),
      };
      updateHandlePoint(selectedHandle, updated);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHandle, getHandlePoint, updateHandlePoint, nativeWidth, nativeHeight]);

  // Points on screen
  const sA1 = nativeToScreen(gateA.p1);
  const sA2 = nativeToScreen(gateA.p2);
  const sB1 = nativeToScreen(gateB.p1);
  const sB2 = nativeToScreen(gateB.p2);

  const activeNativePoint = activeDragging ? getHandlePoint(activeDragging) : null;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full select-none touch-none ${className || ''}`}
    >
      {/* SVG Gate Lines and Labels */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Gate A line */}
        <line
          x1={sA1.x}
          y1={sA1.y}
          x2={sA2.x}
          y2={sA2.y}
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />

        {/* Gate B line */}
        <line
          x1={sB1.x}
          y1={sB1.y}
          x2={sB2.x}
          y2={sB2.y}
          stroke="#a3e635"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />

        {/* Pitch Baseline connection line */}
        <line
          x1={(sA1.x + sA2.x) / 2}
          y1={(sA1.y + sA2.y) / 2}
          x2={(sB1.x + sB2.x) / 2}
          y2={(sB1.y + sB2.y) / 2}
          stroke="var(--line)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Interactive Handles */}
      {[
        { id: 'A1' as HandleKey, screen: sA1, color: '#22d3ee', label: 'A1 (Top)' },
        { id: 'A2' as HandleKey, screen: sA2, color: '#22d3ee', label: 'A2 (Bottom)' },
        { id: 'B1' as HandleKey, screen: sB1, color: '#a3e635', label: 'B1 (Top)' },
        { id: 'B2' as HandleKey, screen: sB2, color: '#a3e635', label: 'B2 (Bottom)' },
      ].map((h) => {
        const isSelected = selectedHandle === h.id;
        const isDragging = activeDragging === h.id;

        return (
          <div
            key={h.id}
            onPointerDown={(e) => handlePointerDown(h.id, e)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-3 touch-none group"
            style={{ left: h.screen.x, top: h.screen.y }}
          >
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-bold shadow-lg transition-transform ${
                isSelected
                  ? 'scale-125 border-white bg-[#05080c] text-white ring-2 ring-[var(--accent)] ring-offset-1'
                  : 'border-black bg-[var(--surface-2)] text-[var(--text)]'
              } ${isDragging ? 'scale-135' : ''}`}
              style={{ borderColor: h.color }}
            >
              {h.id}
            </div>

            {/* Tooltip hint on hover */}
            <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 text-[9px] font-mono text-[var(--muted)] bg-[var(--surface)]/90 px-1 py-0.5 rounded border border-[var(--line)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {h.label}
            </div>
          </div>
        );
      })}

      {/* 4x Zoom Loupe when dragging a handle */}
      {activeDragging && activeNativePoint && loupeClientPos && (
        <Loupe
          sourceElement={imageSource}
          point={activeNativePoint}
          clientPos={loupeClientPos}
          zoom={4}
          size={120}
        />
      )}
    </div>
  );
};
