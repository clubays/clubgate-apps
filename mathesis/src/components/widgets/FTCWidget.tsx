import React, { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";
import { numDeriv } from "../../utils/math";

export const FTCWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [fKey, setFKey] = useState<"t2" | "cost" | "expt">("t2");
  const [x, setX] = useState(1.5);
  const [isPlaying, setIsPlaying] = useState(false);

  const funcs = {
    t2: { f: (t: number) => t * t, F: (x: number) => Math.pow(x, 3) / 3 },
    cost: { f: (t: number) => Math.cos(t), F: (x: number) => Math.sin(x) },
    expt: { f: (t: number) => Math.exp(t), F: (x: number) => Math.exp(x) - 1 },
  };

  const { f, F } = funcs[fKey];
  const area = F(x);
  const fx = f(x);
  const slopeA = numDeriv(F, x);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, {
      xmin: -0.5,
      xmax: 3.5,
      ymin: -2,
      ymax: 8,
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

      // Top: Shaded region under f(t) from 0 to x
      p.fillBetween(f, null, 0, x, c.cArea);
      p.curve(f, c.cf, 2);

      // Lower plot divider
      const divY = p.height * 0.55;
      ctx.save();
      ctx.strokeStyle = c.line;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, divY);
      ctx.lineTo(p.width, divY);
      ctx.stroke();
      ctx.restore();

      // Bottom: Accumulation function A(x) in amber
      p.curve(F, c.cdd, 2);
      p.dot(x, area, 5, c.cdd);

      // Tangent on A(x) showing slope = f(x)
      p.segment(x - 0.6, area - 0.6 * fx, x + 0.6, area + 0.6 * fx, c.accent, 2);
      p.label(`Slope = ${fx.toFixed(2)}`, x + 0.1, area - 0.5, {
        color: c.accent,
        bg: c.panel,
      });
    });
  }, [f, F, x, area, fx]);

  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let forward = true;

    function step() {
      setX((prev) => {
        let next = prev + (forward ? 0.02 : -0.02);
        if (next >= 3.0) forward = false;
        if (next <= 0.1) {
          forward = true;
          setIsPlaying(false);
          return 0.1;
        }
        return next;
      });
      animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Fundamental Theorem of Calculus
        </span>
        <button
          onClick={() => {
            setX(1.5);
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
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)]">Rate f(t)</label>
          <select
            value={fKey}
            onChange={(e) => setFKey(e.target.value as any)}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="t2">f(t) = t²</option>
            <option value="cost">f(t) = cos t</option>
            <option value="expt">f(t) = eᵗ</option>
          </select>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="h-8.5 px-3 rounded text-xs font-mono bg-[var(--chip)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--accent)] flex items-center gap-1.5 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          {isPlaying ? "Pause sweep" : "Sweep x"}
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-[260px]">
          <span className="font-mono text-xs text-[var(--muted)] w-24">Upper limit x: {x.toFixed(2)}</span>
          <input
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={x}
            onChange={(e) => setX(parseFloat(e.target.value))}
            className="flex-1 accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Area A(x) = ∫₀ˣ f</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-dd)] tabular-nums">{area.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Curve height f(x)</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">{fx.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Slope of A at x</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">{slopeA.toFixed(4)}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        Top: area accumulating under f(t); Bottom: accumulation A(x). The slope of A(x) exactly equals f(x)!
      </figcaption>
    </figure>
  );
};
