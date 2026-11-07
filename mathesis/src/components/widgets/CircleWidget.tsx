import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

export const CircleWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [deg, setDeg] = useState(53);

  const rad = (deg * Math.PI) / 180;
  const x = 5 * Math.cos(rad);
  const y = 5 * Math.sin(rad);

  const isVertical = Math.abs(y) < 0.02;
  const slope = !isVertical ? -x / y : null;
  const normSlope = Math.abs(x) > 0.02 ? y / x : null;

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, {
      xmin: -7,
      xmax: 7,
      ymin: -7,
      ymax: 7,
      equal: true,
    });
    plotRef.current = plot;

    const handleTheme = () => plot.requestDraw();
    window.addEventListener("themechange", handleTheme);

    return () => {
      window.removeEventListener("themechange", handleTheme);
      plot.destroy();
    };
  }, []);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const c = p.getColors();
      const ctx = p.ctx;

      // Draw Circle
      const origin = p.toScreen(0, 0);
      const rPt = p.toScreen(5, 0);
      const rPx = Math.abs(rPt.x - origin.x);

      ctx.save();
      ctx.strokeStyle = c.cf;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, rPx, 0, Math.PI * 2);
      ctx.stroke();

      // Radius vector
      p.segment(0, 0, x, y, c.muted, 1, [3, 3]);

      // Tangent
      if (isVertical) {
        p.segment(x, -6, x, 6, c.accent, 2);
      } else if (slope !== null) {
        p.line(x, y, x + 1, y + slope, c.accent, 2);
      }

      // Point
      p.dot(x, y, 5, c.accent);
      ctx.restore();
    });
  }, [x, y, isVertical, slope]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Implicit Differentiation (x² + y² = 25)
        </span>
        <button
          onClick={() => plotRef.current?.resetView()}
          className="p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded"
          title="Reset zoom & pan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={containerRef} className="relative w-full aspect-[16/9] min-h-[280px] bg-[var(--bg)] cursor-grab active:cursor-grabbing" />

      <div className="p-4 flex items-center gap-4 border-t border-[var(--line)] bg-[var(--panel)]">
        <span className="font-mono text-xs text-[var(--muted)] w-24">Angle θ: {deg}°</span>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={deg}
          onChange={(e) => setDeg(parseInt(e.target.value, 10))}
          className="flex-1 accent-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">(x, y)</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">
            ({x.toFixed(2)}, {y.toFixed(2)})
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">dy/dx = −x/y</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">
            {isVertical ? "vertical (undef)" : slope?.toFixed(4)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Normal slope y/x</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">
            {normSlope === null ? "undef" : normSlope > 0 ? `+${normSlope.toFixed(4)}` : normSlope.toFixed(4)}
          </div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        At ({x.toFixed(1)}, {y.toFixed(1)}), the circle tangent has slope {isVertical ? "∞" : slope?.toFixed(2)}. Notice where y=0 gives a vertical tangent.
      </figcaption>
    </figure>
  );
};
