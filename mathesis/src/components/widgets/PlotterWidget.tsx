import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import * as math from "mathjs";
import { Plot } from "../../utils/plot";
import { MathView } from "../common/MathView";

interface PlotterWidgetProps {
  initialExpr?: string;
  showFDoublePrime?: boolean;
}

export const PlotterWidget: React.FC<PlotterWidgetProps> = ({
  initialExpr = "sin(x)",
  showFDoublePrime = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [expr, setExpr] = useState(initialExpr);
  const [showD1, setShowD1] = useState(true);
  const [showD2, setShowD2] = useState(showFDoublePrime);
  const [d1Tex, setD1Tex] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { xmin: -5, xmax: 5, ymin: -4, ymax: 4 });
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

    try {
      const node = math.parse(expr);
      const compiled = node.compile();

      const dNode = math.derivative(node, "x");
      const compiledD1 = dNode.compile();

      const d2Node = math.derivative(dNode, "x");
      const compiledD2 = d2Node.compile();

      setD1Tex(dNode.toTex());
      setError(false);

      const fn = (x: number) => compiled.evaluate({ x, e: Math.E, pi: Math.PI });
      const dfn = (x: number) => compiledD1.evaluate({ x, e: Math.E, pi: Math.PI });
      const d2fn = (x: number) => compiledD2.evaluate({ x, e: Math.E, pi: Math.PI });

      plot.setRender((p) => {
        const c = p.getColors();
        p.curve(fn, c.cf, 2);
        if (showD1) p.curve(dfn, c.cd, 1.8);
        if (showD2) p.curve(d2fn, c.cdd, 1.8);
      });
    } catch (_) {
      setError(true);
    }
  }, [expr, showD1, showD2]);

  const presets = ["x^2", "sin(x)", "x^3 - 3x", "e^x", "log(x)", "1/x", "x*sin(x)"];

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Symbolic Function & Derivative Plotter
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
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)] shrink-0">f(x) =</label>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="flex-1 h-8.5 px-3 font-mono text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-[var(--muted)] mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setExpr(p)}
              className="px-2 py-0.5 text-xs font-mono rounded bg-[var(--chip)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--accent)] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setShowD1(!showD1)}
            className={`px-3 py-1 rounded text-xs font-mono border transition-all ${
              showD1
                ? "bg-[var(--chip)] border-[var(--c-d)] text-[var(--c-d)] font-medium"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
          >
            {showD1 ? "✓ " : ""}Show f′(x) (Green)
          </button>
          <button
            onClick={() => setShowD2(!showD2)}
            className={`px-3 py-1 rounded text-xs font-mono border transition-all ${
              showD2
                ? "bg-[var(--chip)] border-[var(--c-dd)] text-[var(--c-dd)] font-medium"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
          >
            {showD2 ? "✓ " : ""}Show f″(x) (Amber)
          </button>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Exact Symbolic Derivative</div>
        <div className="min-h-[26px] mt-1">
          {error ? (
            <span className="font-mono text-xs text-[var(--accent)]">Could not parse expression. Check syntax.</span>
          ) : (
            <MathView math={`f'(x) = ${d1Tex}`} />
          )}
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        Edit f(x) with any standard expression; math.js computes symbolic derivatives live.
      </figcaption>
    </figure>
  );
};
