import React, { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

export const SecantWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [fKey, setFKey] = useState<"x2" | "x3" | "sin" | "exp">("x2");
  const [x0, setX0] = useState(1.0);
  const [tVal, setTVal] = useState(0.04);
  const [isPlaying, setIsPlaying] = useState(false);

  const funcs = {
    x2: { f: (x: number) => x * x, df: (x: number) => 2 * x },
    x3: { f: (x: number) => x * x * x, df: (x: number) => 3 * x * x },
    sin: { f: (x: number) => Math.sin(x), df: (x: number) => Math.cos(x) },
    exp: { f: (x: number) => Math.exp(x), df: (x: number) => Math.exp(x) },
  };

  const tToH = (t: number) => 2 * Math.pow(0.001 / 2, t);
  const h = tToH(tVal);

  const { f, df } = funcs[fKey];
  const secSlope = (f(x0 + h) - f(x0)) / h;
  const trueSlope = df(x0);
  const gap = Math.abs(secSlope - trueSlope);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { xmin: -4, xmax: 4, ymin: -2, ymax: 6 });
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
      p.curve(f, c.cf, 2);

      const py = f(x0);
      const qx = x0 + h;
      const qy = f(qx);

      // Tangent faint dashed
      p.line(x0, py, x0 + 1, py + trueSlope, c.accent, 1.2, [4, 4]);

      // Secant line
      p.line(x0, py, qx, qy, c.accent, 2);

      p.dot(x0, py, 4.5, c.cf);
      p.label("P", x0, py, { dx: -12, dy: -6, color: c.ink });
      p.dot(qx, qy, 4.5, c.accent);
      p.label("Q", qx, qy, { dx: 8, dy: -6, color: c.accent });
    });
  }, [f, df, x0, h, trueSlope]);

  const handlePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const startT = performance.now();
    const dur = 3200;

    function step(now: number) {
      const elapsed = now - startT;
      const p = Math.min(1, elapsed / dur);
      const ease = 1 - Math.exp(-3.5 * p);
      setTVal(ease);
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        setIsPlaying(false);
      }
    }
    requestAnimationFrame(step);
  };

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Secant to Tangent
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

      <div className="p-4 flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="flex flex-wrap items-center gap-3">
          <label className="font-mono text-xs text-[var(--muted)]">Function</label>
          <select
            value={fKey}
            onChange={(e) => setFKey(e.target.value as any)}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="x2">f(x) = x²</option>
            <option value="x3">f(x) = x³</option>
            <option value="sin">f(x) = sin x</option>
            <option value="exp">f(x) = eˣ</option>
          </select>

          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="h-8.5 px-3 rounded text-xs font-mono bg-[var(--chip)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--accent)] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" /> Play h → 0
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--muted)] w-14">x₀: {x0.toFixed(2)}</span>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={x0}
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="flex-1 accent-[var(--accent)]"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--muted)] w-16">h: {h.toFixed(3)}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={tVal}
              onChange={(e) => setTVal(parseFloat(e.target.value))}
              className="flex-1 accent-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)] text-center sm:text-left">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Secant slope</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{secSlope.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">True f′(x₀)</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{trueSlope.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Gap |Δ|</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">{gap.toFixed(4)}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        Drag h toward 0 to watch the secant line snap to the true tangent.
      </figcaption>
    </figure>
  );
};
