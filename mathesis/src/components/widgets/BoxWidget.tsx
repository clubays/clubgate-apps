import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

export const BoxWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [x, setX] = useState(1.0);

  const base = 12 - 2 * x;
  const vol = x * base * base;

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, {
      xmin: -1,
      xmax: 7,
      ymin: -10,
      ymax: 145,
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

      // Draw left side: 12x12 sheet diagram
      const midW = p.width * 0.42;
      const sheetSize = Math.min(midW - 40, p.height - 40);
      const ox = 25;
      const oy = (p.height - sheetSize) / 2;
      const scale = sheetSize / 12;

      ctx.save();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox, oy, sheetSize, sheetSize);

      // Cutout corners shaded
      const cutPx = x * scale;
      ctx.fillStyle = c.accentTint;
      ctx.fillRect(ox, oy, cutPx, cutPx);
      ctx.fillRect(ox + sheetSize - cutPx, oy, cutPx, cutPx);
      ctx.fillRect(ox, oy + sheetSize - cutPx, cutPx, cutPx);
      ctx.fillRect(ox + sheetSize - cutPx, oy + sheetSize - cutPx, cutPx, cutPx);

      // Fold lines dashed
      ctx.strokeStyle = c.accent;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(ox + cutPx, oy + cutPx, sheetSize - 2 * cutPx, sheetSize - 2 * cutPx);
      ctx.restore();

      // Right side: Graph of V(x) = x(12-2x)^2
      const V = (t: number) => (t >= 0 && t <= 6 ? t * Math.pow(12 - 2 * t, 2) : 0);
      p.curve(V, c.cf, 2);

      // Highlight max at (2, 128)
      p.dot(2, 128, 4.5, c.cd);
      p.label("Max (2, 128)", 2, 128, { dy: -8, color: c.cd, bg: c.panel });

      // Operating point
      p.dot(x, vol, 5, c.accent);
      p.label(`V = ${vol.toFixed(1)}`, x, vol, {
        dy: -8,
        color: c.accent,
        bg: c.panel,
      });
    });
  }, [x, vol]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Maximising Box Volume
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
        <span className="font-mono text-xs text-[var(--muted)] w-28">Cut size x: {x.toFixed(2)}</span>
        <input
          type="range"
          min="0"
          max="6"
          step="0.05"
          value={x}
          onChange={(e) => setX(parseFloat(e.target.value))}
          className="flex-1 accent-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Cut x</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{x.toFixed(2)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Base side (12−2x)</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{base.toFixed(2)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Volume V(x)</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">{vol.toFixed(2)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Optimum Peak</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">128.00 (x = 2)</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        Left: 12×12 cardboard sheet with corner cutouts; Right: V(x) = x(12−2x)². The apex is at x = 2 with V = 128.
      </figcaption>
    </figure>
  );
};
