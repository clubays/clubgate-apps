import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";
import { simpson } from "../../utils/math";

export const AreaWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [pKey, setPKey] = useState<"p1" | "p2" | "p3" | "p4">("p1");

  const pairs = {
    p1: {
      f: (x: number) => x,
      g: (x: number) => x * x,
      a: 0,
      b: 1,
      exact: "1/6",
      label: "y = x and y = x²",
      bounds: { xmin: -0.5, xmax: 1.5, ymin: -0.5, ymax: 1.5 },
    },
    p2: {
      f: () => 4,
      g: (x: number) => x * x,
      a: -2,
      b: 2,
      exact: "32/3",
      label: "y = x² and y = 4",
      bounds: { xmin: -3, xmax: 3, ymin: -1, ymax: 5 },
    },
    p3: {
      f: (x: number) => 2 * x,
      g: (x: number) => x * x,
      a: 0,
      b: 2,
      exact: "4/3",
      label: "y = x² and y = 2x",
      bounds: { xmin: -0.5, xmax: 2.5, ymin: -0.5, ymax: 5 },
    },
    p4: {
      f: (x: number) => Math.sqrt(Math.max(0, x)),
      g: (x: number) => x,
      a: 0,
      b: 1,
      exact: "1/6",
      label: "y = √x and y = x",
      bounds: { xmin: -0.5, xmax: 1.5, ymin: -0.5, ymax: 1.5 },
    },
  };

  const data = pairs[pKey];
  const numArea = simpson((x: number) => Math.abs(data.f(x) - data.g(x)), data.a, data.b, 2000);

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
  }, [pKey]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const c = p.getColors();
      p.fillBetween(data.f, data.g, data.a, data.b, c.cArea);

      p.curve(data.f, c.cf, 2);
      p.curve(data.g, c.cd, 2);

      p.dot(data.a, data.f(data.a), 5, c.accent);
      p.dot(data.b, data.f(data.b), 5, c.accent);
    });
  }, [data]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Area Between Two Curves
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

      <div className="p-4 flex items-center gap-3 border-t border-[var(--line)] bg-[var(--panel)]">
        <label className="font-mono text-xs text-[var(--muted)]">Curves</label>
        <select
          value={pKey}
          onChange={(e) => setPKey(e.target.value as any)}
          className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        >
          <option value="p1">y = x and y = x²</option>
          <option value="p2">y = x² and y = 4</option>
          <option value="p3">y = x² and y = 2x</option>
          <option value="p4">y = √x and y = x</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Intersections [a, b]</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">
            [{data.a}, {data.b}]
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Numerical Area</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">{numArea.toFixed(4)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Exact Fraction</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)] tabular-nums">{data.exact}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        The region where f(x) ≥ g(x) is integrated from the left intersection to the right intersection.
      </figcaption>
    </figure>
  );
};
