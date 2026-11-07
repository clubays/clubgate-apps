import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

export const FamilyWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [currentC, setCurrentC] = useState(0);
  const [customPoint, setCustomPoint] = useState<{ x: number; y: number; c: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { xmin: -4, xmax: 4, ymin: -5, ymax: 9 });
    plotRef.current = plot;

    const el = containerRef.current;
    const handleDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const world = plot.toWorld(e.clientX - rect.left, e.clientY - rect.top);
      const c = world.y - world.x * world.x;
      setCustomPoint({ x: world.x, y: world.y, c });
    };

    el.addEventListener("pointerdown", handleDown);

    const handleTheme = () => plot.requestDraw();
    window.addEventListener("themechange", handleTheme);

    return () => {
      el.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("themechange", handleTheme);
      plot.destroy();
    };
  }, []);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const c = p.getColors();
      // Derivative line f(x) = 2x in green
      p.curve((x) => 2 * x, c.cd, 1.8);

      // Family F(x) = x^2 + k
      for (let k = -3; k <= 3; k++) {
        const isHighlighted = k === currentC && !customPoint;
        p.curve((x) => x * x + k, c.cf, isHighlighted ? 2.5 : 1);
      }

      // Custom curve if clicked
      if (customPoint) {
        p.curve((x) => x * x + customPoint.c, c.accent, 2.5);
        p.dot(customPoint.x, customPoint.y, 5, c.accent);
      }
    });
  }, [currentC, customPoint]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Family of Curves F(x) = x² + C
        </span>
        <button
          onClick={() => {
            setCustomPoint(null);
            plotRef.current?.resetView();
          }}
          className="p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded"
          title="Reset zoom & pan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={containerRef} className="relative w-full aspect-[16/9] min-h-[280px] bg-[var(--bg)] cursor-crosshair touch-none" />

      <div className="p-4 flex items-center gap-4 border-t border-[var(--line)] bg-[var(--panel)]">
        <span className="font-mono text-xs text-[var(--muted)] w-28">Constant C: {currentC}</span>
        <input
          type="range"
          min="-3"
          max="3"
          step="1"
          value={currentC}
          onChange={(e) => {
            setCurrentC(parseInt(e.target.value, 10));
            setCustomPoint(null);
          }}
          className="flex-1 accent-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Derivative f(x)</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">2x (shared slope)</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Initial Condition</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">
            {customPoint ? `(${customPoint.x.toFixed(2)}, ${customPoint.y.toFixed(2)})` : "Click plot to set"}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Unique Solution</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">
            {customPoint
              ? `F(x) = x² ${customPoint.c >= 0 ? `+ ${customPoint.c.toFixed(2)}` : `− ${Math.abs(customPoint.c).toFixed(2)}`}`
              : `F(x) = x² ${currentC >= 0 ? `+ ${currentC}` : `− ${Math.abs(currentC)}`}`}
          </div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        All blue parabolas have the same slope f(x)=2x at any x. Click anywhere to nail down the constant C with an initial condition.
      </figcaption>
    </figure>
  );
};
