import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";
import { simpson } from "../../utils/math";

interface RiemannWidgetProps {
  showAverage?: boolean;
  preset?: "x2" | "x" | "sin" | "sqrt" | "exp";
  range?: [number, number];
  rule?: "left" | "right" | "mid" | "trap";
  n?: number;
}

export const RiemannWidget: React.FC<RiemannWidgetProps> = ({
  showAverage = false,
  preset = "x2",
  range = [0, 2],
  rule: initialRule = "mid",
  n: initialN = 4,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [fKey, setFKey] = useState<"x2" | "x" | "sin" | "sqrt" | "exp">(preset);
  const [rule, setRule] = useState<"left" | "right" | "mid" | "trap">(initialRule);
  const [a, setA] = useState(range[0]);
  const [b, setB] = useState(range[1]);
  const [n, setN] = useState(initialN);

  const funcs = {
    x2: (x: number) => x * x,
    x: (x: number) => x,
    sin: (x: number) => Math.sin(x),
    sqrt: (x: number) => (x >= 0 ? Math.sqrt(x) : NaN),
    exp: (x: number) => Math.exp(x),
  };

  const f = funcs[fKey];
  const dx = (b - a) / (n || 1);
  let sum = 0;

  for (let i = 0; i < n; i++) {
    const xL = a + i * dx;
    const xR = xL + dx;
    if (rule === "left") sum += f(xL) * dx;
    else if (rule === "right") sum += f(xR) * dx;
    else if (rule === "mid") sum += f((xL + xR) / 2) * dx;
    else if (rule === "trap") sum += ((f(xL) + f(xR)) / 2) * dx;
  }

  const exact = simpson(f, a, b, 4000);
  const err = Math.abs(sum - exact);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { xmin: -1, xmax: 4, ymin: -1, ymax: 6 });
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

      // Draw strips
      for (let i = 0; i < n; i++) {
        const xL = a + i * dx;
        const xR = xL + dx;
        let yVal = 0;
        if (rule === "left") yVal = f(xL);
        else if (rule === "right") yVal = f(xR);
        else if (rule === "mid") yVal = f((xL + xR) / 2);

        if (rule === "trap") {
          const y1 = f(xL);
          const y2 = f(xR);
          const p1 = p.toScreen(xL, 0);
          const p2 = p.toScreen(xL, y1);
          const p3 = p.toScreen(xR, y2);
          const p4 = p.toScreen(xR, 0);

          ctx.save();
          ctx.fillStyle = c.cArea;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();
          ctx.fill();
          if (n <= 60) {
            ctx.strokeStyle = c.cf;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.restore();
        } else {
          p.rect(xL, 0, dx, yVal, c.cArea, n <= 60 ? c.cf : null);
        }
      }

      // Curve f(x)
      p.curve(f, c.cf, 2);

      // Average line if requested
      if (showAverage && b !== a) {
        const avg = exact / (b - a);
        p.segment(a, avg, b, avg, c.accent, 2, [5, 4]);
        p.label(`f_avg = ${avg.toFixed(3)}`, b + 0.1, avg, {
          color: c.accent,
          bg: c.panel,
        });
      }
    });
  }, [f, a, b, n, rule, dx, showAverage, exact]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Riemann Sums & Definite Integral
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="font-mono text-xs text-[var(--muted)]">Function</label>
            <select
              value={fKey}
              onChange={(e) => setFKey(e.target.value as any)}
              className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            >
              <option value="x2">f(x) = x²</option>
              <option value="x">f(x) = x</option>
              <option value="sin">f(x) = sin x</option>
              <option value="sqrt">f(x) = √x</option>
              <option value="exp">f(x) = eˣ</option>
            </select>
          </div>

          <div className="inline-flex border border-[var(--line)] rounded overflow-hidden">
            {(["left", "right", "mid", "trap"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRule(r)}
                className={`px-2.5 py-1 text-xs font-mono border-r border-[var(--line)] last:border-none transition-colors ${
                  rule === r
                    ? "bg-[var(--ink)] text-[var(--panel)] font-medium"
                    : "bg-[var(--panel)] text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[var(--muted)]">[a, b]:</span>
            <input
              type="number"
              step="0.5"
              value={a}
              onChange={(e) => setA(parseFloat(e.target.value) || 0)}
              className="w-16 h-8 px-2 text-xs font-mono bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)]"
            />
            <input
              type="number"
              step="0.5"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value) || 1)}
              className="w-16 h-8 px-2 text-xs font-mono bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)]"
            />
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-[240px]">
            <span className="font-mono text-xs text-[var(--muted)] w-14">Strips n: {n}</span>
            <input
              type="range"
              min="1"
              max="200"
              step="1"
              value={n}
              onChange={(e) => setN(parseInt(e.target.value, 10))}
              className="flex-1 accent-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Riemann Sum</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">{sum.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Exact Integral</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">{exact.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Approximation Error</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">{err.toFixed(4)}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        {showAverage
          ? "Dashed horizontal line marks the average value f_avg on [a, b]."
          : "Increase strips n from 4 to 200 to watch approximating rectangles coalesce into exact area."}
      </figcaption>
    </figure>
  );
};
