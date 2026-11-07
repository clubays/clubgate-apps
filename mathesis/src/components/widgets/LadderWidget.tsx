import React, { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

export const LadderWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [x, setX] = useState(3.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const L = 5.0;
  const dxdt = 0.5;

  const y = Math.sqrt(Math.max(0, L * L - x * x));
  const dydt = y > 0 ? -(x / y) * dxdt : -Infinity;

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, {
      xmin: -1,
      xmax: 6,
      ymin: -1,
      ymax: 6,
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

      // Ground and wall
      p.segment(-0.5, 0, 5.5, 0, c.ink, 3);
      p.segment(0, -0.5, 0, 5.5, c.ink, 3);

      // Ladder
      p.segment(x, 0, 0, y, c.accent, 4);
      p.dot(x, 0, 5, c.accent);
      p.dot(0, y, 5, c.accent);

      p.label(`x = ${x.toFixed(2)}m`, x / 2, -0.4, {
        align: "center",
        color: c.ink,
      });
      p.label(`y = ${y.toFixed(2)}m`, -0.4, y / 2, {
        align: "right",
        color: c.ink,
      });
      p.label("L = 5m", x / 2 + 0.3, y / 2 + 0.3, { color: c.accent });
    });
  }, [x, y]);

  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let lastTime = performance.now();

    function step(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setX((prev) => {
        const next = prev + dxdt * dt;
        if (next >= 4.85) {
          setIsPlaying(false);
          return 4.85;
        }
        return next;
      });
      animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, dxdt]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Sliding Ladder (5m)
        </span>
        <button
          onClick={() => {
            setX(3.0);
            plotRef.current?.resetView();
          }}
          className="p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded"
          title="Reset zoom & pan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={containerRef} className="relative w-full aspect-[16/9] min-h-[280px] bg-[var(--bg)] cursor-grab active:cursor-grabbing" />

      <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <span className="font-mono text-xs text-[var(--muted)] w-24">Base x: {x.toFixed(2)} m</span>
          <input
            type="range"
            min="0.5"
            max="4.8"
            step="0.05"
            value={x}
            onChange={(e) => setX(parseFloat(e.target.value))}
            className="flex-1 accent-[var(--accent)]"
          />
        </div>

        <button
          onClick={() => {
            if (x >= 4.8) setX(1.0);
            setIsPlaying(!isPlaying);
          }}
          className="h-8.5 px-3 rounded text-xs font-mono bg-[var(--chip)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--accent)] flex items-center gap-1.5 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          {isPlaying ? "Pause slide" : "Slide (dx/dt = 0.5 m/s)"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Base x</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{x.toFixed(3)} m</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Height y</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{y.toFixed(3)} m</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">dx/dt</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">+0.500 m/s</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">dy/dt = −(x/y)dx/dt</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">
            {isFinite(dydt) ? `${dydt.toFixed(3)} m/s` : "−∞"}
          </div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        As x increases at constant rate, the top accelerates downward: dy/dt = −(x/y)(dx/dt).
      </figcaption>
    </figure>
  );
};
