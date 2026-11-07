import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

export const ExtremaWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [fKey, setFKey] = useState<"cubic" | "quartic" | "cubic2">("cubic");
  const [mx, setMx] = useState(0);

  const funcs = {
    cubic: {
      f: (x: number) => x * x * x - 3 * x,
      df: (x: number) => 3 * x * x - 3,
      crit: [
        { x: -1, y: 2, type: "local max (−1, 2)" },
        { x: 1, y: -2, type: "local min (1, −2)" },
      ],
      bounds: { xmin: -3, xmax: 3, ymin: -4, ymax: 4 },
    },
    quartic: {
      f: (x: number) => Math.pow(x, 4) - 4 * Math.pow(x, 3),
      df: (x: number) => 4 * Math.pow(x, 3) - 12 * x * x,
      crit: [
        { x: 0, y: 0, type: "stationary (no extremum)" },
        { x: 3, y: -27, type: "local min (3, −27)" },
      ],
      bounds: { xmin: -1.5, xmax: 4.5, ymin: -30, ymax: 10 },
    },
    cubic2: {
      f: (x: number) => 2 * Math.pow(x, 3) - 9 * x * x + 12 * x,
      df: (x: number) => 6 * x * x - 18 * x + 12,
      crit: [
        { x: 1, y: 5, type: "local max (1, 5)" },
        { x: 2, y: 4, type: "local min (2, 4)" },
      ],
      bounds: { xmin: -0.5, xmax: 3.5, ymin: -2, ymax: 8 },
    },
  };

  const data = funcs[fKey];
  const y = data.f(mx);
  const slope = data.df(mx);

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
  }, [fKey]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const c = p.getColors();
      const ctx = p.ctx;

      // Band along x axis indicating sign of f'
      const bandH = 14;
      const originY = p.toScreen(0, 0).y;
      const bandTop = Math.min(p.height - bandH, Math.max(0, originY - bandH / 2));

      for (let sx = 0; sx < p.width; sx += 4) {
        const wx = p.toWorld(sx, 0).x;
        const s = data.df(wx);
        ctx.fillStyle = s > 0 ? "rgba(42,127,98,.25)" : "rgba(194,55,29,.25)";
        ctx.fillRect(sx, bandTop, 4, bandH);
      }

      // Curves
      p.curve(data.f, c.cf, 2);
      p.curve(data.df, c.cd, 1.5);

      // Critical points
      for (const pt of data.crit) {
        p.dot(pt.x, pt.y, 5, c.accent);
        p.label(pt.type, pt.x, pt.y, { dy: -8, color: c.ink, bg: c.panel });
      }

      // Tangent at marker
      p.line(mx, y, mx + 1, y + slope, c.accent, 1.8);
      p.dot(mx, y, 5, c.accent);
    });
  }, [data, mx, y, slope]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Extrema & Sign of f′
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
          <label className="font-mono text-xs text-[var(--muted)]">Function</label>
          <select
            value={fKey}
            onChange={(e) => {
              const k = e.target.value as keyof typeof funcs;
              setFKey(k);
              setMx((funcs[k].bounds.xmin + funcs[k].bounds.xmax) / 2);
            }}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="cubic">f(x) = x³ − 3x</option>
            <option value="quartic">f(x) = x⁴ − 4x³</option>
            <option value="cubic2">f(x) = 2x³ − 9x² + 12x</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[var(--muted)]">Marker: {mx.toFixed(2)}</span>
          <input
            type="range"
            min={data.bounds.xmin}
            max={data.bounds.xmax}
            step="0.05"
            value={mx}
            onChange={(e) => setMx(parseFloat(e.target.value))}
            className="w-36 accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">x</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{mx.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">f(x)</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">{y.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">f′(x) (Slope)</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">{slope.toFixed(4)}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        Shaded band: green where f′&gt;0 (function increasing ↑), red where f′&lt;0 (decreasing ↓). Critical points marked with labels.
      </figcaption>
    </figure>
  );
};
