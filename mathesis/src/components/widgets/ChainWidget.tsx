import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";
import { numDeriv } from "../../utils/math";

export const ChainWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [compKey, setCompKey] = useState<"sin_x2" | "exp_mx2" | "sqrt_x2p1" | "cube_2xp1">("sin_x2");
  const [x, setX] = useState(1.0);

  const comps = {
    sin_x2: {
      u: (x: number) => x * x,
      du: (x: number) => 2 * x,
      g: (u: number) => Math.sin(u),
      dg: (u: number) => Math.cos(u),
      name: "f(x) = sin(x²)",
    },
    exp_mx2: {
      u: (x: number) => -x * x,
      du: (x: number) => -2 * x,
      g: (u: number) => Math.exp(u),
      dg: (u: number) => Math.exp(u),
      name: "f(x) = exp(−x²)",
    },
    sqrt_x2p1: {
      u: (x: number) => x * x + 1,
      du: (x: number) => 2 * x,
      g: (u: number) => Math.sqrt(u),
      dg: (u: number) => 1 / (2 * Math.sqrt(u)),
      name: "f(x) = √(x² + 1)",
    },
    cube_2xp1: {
      u: (x: number) => 2 * x + 1,
      du: () => 2,
      g: (u: number) => u * u * u,
      dg: (u: number) => 3 * u * u,
      name: "f(x) = (2x + 1)³",
    },
  };

  const c = comps[compKey];
  const uVal = c.u(x);
  const duVal = c.du(x);
  const dgVal = c.dg(uVal);
  const prod = dgVal * duVal;

  const f = (t: number) => c.g(c.u(t));
  const numF = numDeriv(f, x);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { xmin: -3, xmax: 3, ymin: -3, ymax: 4 });
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
      const col = p.getColors();
      p.curve(c.u, col.cdd, 1.6); // u(x) amber
      p.curve(f, col.cf, 2); // f(x) blue
      p.curve((t) => c.dg(c.u(t)) * c.du(t), col.cd, 1.8); // f' green

      p.dot(x, f(x), 5, col.accent);
      p.dot(x, c.u(x), 4, col.cdd);
    });
  }, [c, f, x]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · The Chain Rule
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
          <label className="font-mono text-xs text-[var(--muted)]">Composition</label>
          <select
            value={compKey}
            onChange={(e) => setCompKey(e.target.value as any)}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="sin_x2">f(x) = sin(x²)</option>
            <option value="exp_mx2">f(x) = exp(−x²)</option>
            <option value="sqrt_x2p1">f(x) = √(x² + 1)</option>
            <option value="cube_2xp1">f(x) = (2x + 1)³</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[var(--muted)]">x: {x.toFixed(2)}</span>
          <input
            type="range"
            min="-2.5"
            max="2.5"
            step="0.05"
            value={x}
            onChange={(e) => setX(parseFloat(e.target.value))}
            className="w-36 accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">g′(u) (Outer)</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{dgVal.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">u′(x) (Inner)</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-dd)] tabular-nums">{duVal.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Product g′·u′</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">{prod.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Numeric f′(x)</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{numF.toFixed(4)}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        Amber: inner u(x); Blue: composite f(x)=g(u(x)); Green: derivative f′(x). Notice g′(u)·u′(x) exactly equals f′(x).
      </figcaption>
    </figure>
  );
};
