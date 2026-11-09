import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

export const RevolveWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [fKey, setFKey] = useState<"x" | "sqrt" | "x2" | "sin">("x");
  const [n, setN] = useState(12);

  const funcs = {
    x: {
      f: (x: number) => x,
      a: 0,
      b: 1,
      exact: Math.PI / 3,
      bounds: { xmin: -0.2, xmax: 1.2, ymin: -1.2, ymax: 1.2 },
    },
    sqrt: {
      f: (x: number) => Math.sqrt(Math.max(0, x)),
      a: 0,
      b: 4,
      exact: 8 * Math.PI,
      bounds: { xmin: -0.5, xmax: 4.5, ymin: -2.5, ymax: 2.5 },
    },
    x2: {
      f: (x: number) => x * x,
      a: 0,
      b: 1,
      exact: Math.PI / 5,
      bounds: { xmin: -0.2, xmax: 1.2, ymin: -1.2, ymax: 1.2 },
    },
    sin: {
      f: (x: number) => Math.sin(x),
      a: 0,
      b: Math.PI,
      exact: (Math.PI * Math.PI) / 2,
      bounds: { xmin: -0.5, xmax: 3.5, ymin: -1.2, ymax: 1.2 },
    },
  };

  const data = funcs[fKey];
  const dx = (data.b - data.a) / (n || 1);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const mid = data.a + (i + 0.5) * dx;
    const r = data.f(mid);
    sum += Math.PI * r * r * dx;
  }
  const err = Math.abs(sum - data.exact);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, data.bounds);
    plotRef.current = plot;

    const handleTheme = () => plot.requestDraw();
    window.addEventListener("themechange", handleTheme);

    return () => {
      window.removeEventListener("themechange", handleTheme);
      plot.destroy();
    };
  }, []);

  useEffect(() => {
    if (plotRef.current) {
      plotRef.current.setBounds(data.bounds);
    }
  }, [fKey]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const c = p.getColors();
      const ctx = p.ctx;

      // Top 2D curve
      p.curve(data.f, c.cf, 2);

      // Center axis of revolution
      p.segment(p.bounds.xmin, 0, p.bounds.xmax, 0, c.ink, 1.5, [2, 2]);

      // Draw 3D discs as stacked perspective cylinders
      for (let i = 0; i < n; i++) {
        const xL = data.a + i * dx;
        const xMid = xL + 0.5 * dx;
        const r = data.f(xMid);
        if (r <= 0) continue;

        const pt = p.toScreen(xMid, 0);
        const topPt = p.toScreen(xMid, r);
        const rx = Math.abs(p.toScreen(xMid + dx / 2, 0).x - pt.x);
        const ry = Math.abs(topPt.y - pt.y);

        ctx.save();
        ctx.fillStyle = c.cArea;
        ctx.strokeStyle = c.cf;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, Math.max(2, rx), ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    });
  }, [data, n, dx]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Solid of Revolution (Disc Method)
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

      <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="flex items-center gap-3">
          <label className="font-mono text-xs text-[var(--muted)]">Profile Curve</label>
          <select
            value={fKey}
            onChange={(e) => setFKey(e.target.value as any)}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="x">y = x on [0, 1]</option>
            <option value="sqrt">y = √x on [0, 4]</option>
            <option value="x2">y = x² on [0, 1]</option>
            <option value="sin">y = sin x on [0, π]</option>
          </select>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-[240px]">
          <span className="font-mono text-xs text-[var(--muted)] w-20">Discs: {n}</span>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={n}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
            className="flex-1 accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Disc Sum π Σ f² Δx</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">{sum.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Exact π ∫ f² dx</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">{data.exact.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Approximation Error</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">{err.toFixed(4)}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        Top: 2D function sliced into discs; Bottom: pseudo-3D stack of cylindrical discs revolving about the x-axis.
      </figcaption>
    </figure>
  );
};
