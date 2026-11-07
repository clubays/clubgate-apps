import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

interface TangentWidgetProps {
  preset?: "x2" | "cubic" | "sin" | "exp" | "inv";
}

export const TangentWidget: React.FC<TangentWidgetProps> = ({ preset = "x2" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [fKey, setFKey] = useState<"x2" | "cubic" | "sin" | "exp" | "inv">(preset);
  const [currX, setCurrX] = useState(1.0);

  const funcs = {
    x2: { f: (x: number) => x * x, df: (x: number) => 2 * x },
    cubic: { f: (x: number) => x * x * x - 3 * x, df: (x: number) => 3 * x * x - 3 },
    sin: { f: (x: number) => Math.sin(x), df: (x: number) => Math.cos(x) },
    exp: { f: (x: number) => Math.exp(x), df: (x: number) => Math.exp(x) },
    inv: { f: (x: number) => 1 / x, df: (x: number) => -1 / (x * x) },
  };

  const { f, df } = funcs[fKey];
  const y = f(currX);
  const slope = df(currX);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { xmin: -4, xmax: 4, ymin: -3, ymax: 5 });
    plotRef.current = plot;

    const el = containerRef.current;
    const handlePointer = (e: PointerEvent) => {
      if (e.buttons > 0 || e.type === "pointerdown") {
        const rect = el.getBoundingClientRect();
        const world = plot.toWorld(e.clientX - rect.left, e.clientY - rect.top);
        setCurrX(Math.max(plot.bounds.xmin, Math.min(plot.bounds.xmax, world.x)));
      }
    };

    el.addEventListener("pointerdown", handlePointer);
    el.addEventListener("pointermove", handlePointer);

    const handleTheme = () => plot.requestDraw();
    window.addEventListener("themechange", handleTheme);

    return () => {
      el.removeEventListener("pointerdown", handlePointer);
      el.removeEventListener("pointermove", handlePointer);
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

      // Draw f(x)
      p.curve(f, c.cf, 2);

      // Tangent line +-1.6 units
      const tLen = 1.6;
      const dx = tLen / Math.sqrt(1 + slope * slope);
      const dy = slope * dx;
      p.segment(currX - dx, y - dy, currX + dx, y + dy, c.accent, 2);
      p.dot(currX, y, 5, c.accent);

      // Divider for lower f' plot
      const dividerY = p.height * 0.6;
      ctx.save();
      ctx.strokeStyle = c.line;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, dividerY);
      ctx.lineTo(p.width, dividerY);
      ctx.stroke();
      ctx.restore();

      p.label("f′(x) trace", p.bounds.xmin + 0.3, p.bounds.ymin + 0.4, {
        color: c.cd,
      });

      // Draw f' in green
      p.curve(df, c.cd, 2);
      p.dot(currX, slope, 4.5, c.cd);

      // Vertical connector
      p.segment(currX, y, currX, slope, c.muted, 1, [2, 3]);
    });
  }, [f, df, currX, y, slope]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Tangent & Derivative Trace
        </span>
        <button
          onClick={() => plotRef.current?.resetView()}
          className="p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded"
          title="Reset zoom & pan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={containerRef} className="relative w-full aspect-[16/9] min-h-[280px] bg-[var(--bg)] cursor-crosshair touch-none" />

      <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="flex items-center gap-3">
          <label className="font-mono text-xs text-[var(--muted)]">Function</label>
          <select
            value={fKey}
            onChange={(e) => setFKey(e.target.value as any)}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="x2">f(x) = x²</option>
            <option value="cubic">f(x) = x³ − 3x</option>
            <option value="sin">f(x) = sin x</option>
            <option value="exp">f(x) = eˣ</option>
            <option value="inv">f(x) = 1/x</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[var(--muted)]">x: {currX.toFixed(2)}</span>
          <input
            type="range"
            min="-3.5"
            max="3.5"
            step="0.05"
            value={currX}
            onChange={(e) => setCurrX(parseFloat(e.target.value))}
            className="w-36 accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">x</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">{currX.toFixed(4)}</div>
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
        Move along f(x) (blue); the lower plot simultaneously traces f′(x) (green).
      </figcaption>
    </figure>
  );
};
