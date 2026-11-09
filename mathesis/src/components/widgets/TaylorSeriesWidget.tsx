import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

interface TaylorSeriesWidgetProps {
  initialPreset?: "sin" | "cos" | "exp" | "geom" | "ln";
  initialN?: number;
}

export const TaylorSeriesWidget: React.FC<TaylorSeriesWidgetProps> = ({
  initialPreset = "sin",
  initialN = 3,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [pKey, setPKey] = useState<"sin" | "cos" | "exp" | "geom" | "ln">(initialPreset);
  const [order, setOrder] = useState<number>(initialN);
  const [probeX, setProbeX] = useState<number>(1.5);

  const presets = {
    sin: {
      name: "f(x) = sin(x)",
      f: (x: number) => Math.sin(x),
      poly: (x: number, n: number) => {
        let sum = 0;
        let fact = 1;
        for (let k = 0; k <= n; k++) {
          if (k > 0) fact *= k;
          if (k % 2 === 1) {
            const sign = ((k - 1) / 2) % 2 === 0 ? 1 : -1;
            sum += (sign * Math.pow(x, k)) / fact;
          }
        }
        return sum;
      },
      roc: "(-∞, ∞)",
      formula: (n: number) => {
        const terms: string[] = [];
        let fact = 1;
        for (let k = 0; k <= n; k++) {
          if (k > 0) fact *= k;
          if (k % 2 === 1) {
            const sign = ((k - 1) / 2) % 2 === 0 ? "+" : "-";
            const term = k === 1 ? "x" : `x^${k}/${fact}`;
            terms.push(terms.length === 0 ? (sign === "-" ? `-${term}` : term) : `${sign} ${term}`);
          }
        }
        return terms.length ? terms.join(" ") : "0";
      },
      bounds: { xmin: -7, xmax: 7, ymin: -2.5, ymax: 2.5 },
    },
    cos: {
      name: "f(x) = cos(x)",
      f: (x: number) => Math.cos(x),
      poly: (x: number, n: number) => {
        let sum = 0;
        let fact = 1;
        for (let k = 0; k <= n; k++) {
          if (k > 0) fact *= k;
          if (k % 2 === 0) {
            const sign = (k / 2) % 2 === 0 ? 1 : -1;
            sum += (sign * Math.pow(x, k)) / fact;
          }
        }
        return sum;
      },
      roc: "(-∞, ∞)",
      formula: (n: number) => {
        const terms: string[] = [];
        let fact = 1;
        for (let k = 0; k <= n; k++) {
          if (k > 0) fact *= k;
          if (k % 2 === 0) {
            const sign = (k / 2) % 2 === 0 ? "+" : "-";
            const term = k === 0 ? "1" : `x^${k}/${fact}`;
            terms.push(terms.length === 0 ? term : `${sign} ${term}`);
          }
        }
        return terms.length ? terms.join(" ") : "1";
      },
      bounds: { xmin: -7, xmax: 7, ymin: -2.5, ymax: 2.5 },
    },
    exp: {
      name: "f(x) = eˣ",
      f: (x: number) => Math.exp(x),
      poly: (x: number, n: number) => {
        let sum = 0;
        let fact = 1;
        for (let k = 0; k <= n; k++) {
          if (k > 0) fact *= k;
          sum += Math.pow(x, k) / fact;
        }
        return sum;
      },
      roc: "(-∞, ∞)",
      formula: (n: number) => {
        const terms: string[] = [];
        let fact = 1;
        for (let k = 0; k <= Math.min(n, 6); k++) {
          if (k > 0) fact *= k;
          if (k === 0) terms.push("1");
          else if (k === 1) terms.push("+ x");
          else terms.push(`+ x^${k}/${fact}`);
        }
        if (n > 6) terms.push("+ ...");
        return terms.join(" ");
      },
      bounds: { xmin: -4, xmax: 4, ymin: -1, ymax: 9 },
    },
    geom: {
      name: "f(x) = 1 / (1 - x)",
      f: (x: number) => (Math.abs(1 - x) < 1e-4 ? NaN : 1 / (1 - x)),
      poly: (x: number, n: number) => {
        let sum = 0;
        for (let k = 0; k <= n; k++) {
          sum += Math.pow(x, k);
        }
        return sum;
      },
      roc: "(-1, 1)",
      formula: (n: number) => {
        const terms: string[] = [];
        for (let k = 0; k <= Math.min(n, 5); k++) {
          if (k === 0) terms.push("1");
          else if (k === 1) terms.push("+ x");
          else terms.push(`+ x^${k}`);
        }
        if (n > 5) terms.push("+ ...");
        return terms.join(" ");
      },
      bounds: { xmin: -2, xmax: 2, ymin: -4, ymax: 8 },
    },
    ln: {
      name: "f(x) = ln(1 + x)",
      f: (x: number) => (x <= -1 ? NaN : Math.log(1 + x)),
      poly: (x: number, n: number) => {
        let sum = 0;
        for (let k = 1; k <= n; k++) {
          const sign = k % 2 === 1 ? 1 : -1;
          sum += (sign * Math.pow(x, k)) / k;
        }
        return sum;
      },
      roc: "(-1, 1]",
      formula: (n: number) => {
        const terms: string[] = [];
        for (let k = 1; k <= Math.min(n, 5); k++) {
          const sign = k % 2 === 1 ? "+" : "-";
          const term = k === 1 ? "x" : `x^${k}/${k}`;
          terms.push(terms.length === 0 ? term : `${sign} ${term}`);
        }
        if (n > 5) terms.push("+ ...");
        return terms.length ? terms.join(" ") : "0";
      },
      bounds: { xmin: -1.5, xmax: 2.5, ymin: -3, ymax: 3 },
    },
  };

  const active = presets[pKey];

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, active.bounds);
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
      plotRef.current.setBounds(active.bounds);
    }
  }, [pKey]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const c = p.getColors();
      const ctx = p.ctx;

      // Draw radius of convergence shaded zone if geom or ln
      if (pKey === "geom" || pKey === "ln") {
        const pL = p.toScreen(-1, 0);
        const pR = p.toScreen(1, 0);
        ctx.save();
        ctx.fillStyle = "rgba(42, 127, 98, 0.08)";
        ctx.fillRect(Math.min(pL.x, pR.x), 0, Math.abs(pR.x - pL.x), p.height);

        // Boundary lines
        p.segment(-1, p.bounds.ymin, -1, p.bounds.ymax, c.cd, 1, [4, 4]);
        p.segment(1, p.bounds.ymin, 1, p.bounds.ymax, c.cd, 1, [4, 4]);
        ctx.restore();
      }

      // Draw original true function
      p.curve(active.f, c.cf, 2.5);

      // Draw Taylor polynomial
      p.curve((x: number) => active.poly(x, order), c.accent, 2.2);

      // Probe point
      const trueVal = active.f(probeX);
      const polyVal = active.poly(probeX, order);

      if (!isNaN(trueVal)) {
        p.dot(probeX, trueVal, 4.5, c.cf);
      }
      if (!isNaN(polyVal)) {
        p.dot(probeX, polyVal, 5, c.accent);
        p.segment(probeX, trueVal, probeX, polyVal, c.ink, 1, [2, 2]);
      }
    });
  }, [active, order, probeX, pKey]);

  const fVal = active.f(probeX);
  const pVal = active.poly(probeX, order);
  const err = !isNaN(fVal) && !isNaN(pVal) ? Math.abs(fVal - pVal) : NaN;

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Taylor Polynomial Approximation P_n(x)
        </span>
        <button
          onClick={() => {
            setOrder(initialN);
            setProbeX(1.5);
            plotRef.current?.resetView();
          }}
          className="p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] min-h-[300px] bg-[var(--bg)] cursor-grab active:cursor-grabbing"
      />

      <div className="p-4 flex flex-wrap items-center gap-5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)]">Function</label>
          <select
            value={pKey}
            onChange={(e) => {
              const val = e.target.value as any;
              setPKey(val);
              setOrder(initialN);
              if (val === "geom" || val === "ln") {
                setProbeX(0.5);
              } else {
                setProbeX(1.5);
              }
            }}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="sin">sin(x) [Maclaurin]</option>
            <option value="cos">cos(x) [Maclaurin]</option>
            <option value="exp">eˣ [Exponential]</option>
            <option value="geom">1 / (1 - x) [Geometric]</option>
            <option value="ln">ln(1 + x) [Logarithmic]</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)] min-w-[70px]">
            Degree n = <span className="font-bold text-[var(--ink)]">{order}</span>
          </label>
          <input
            type="range"
            min="0"
            max="13"
            step="1"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value, 10))}
            className="w-28 accent-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)] min-w-[60px]">
            Probe x = <span className="font-bold text-[var(--ink)]">{probeX.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={pKey === "geom" || pKey === "ln" ? "-0.95" : "-4"}
            max={pKey === "geom" || pKey === "ln" ? "0.95" : "4"}
            step="0.05"
            value={probeX}
            onChange={(e) => setProbeX(parseFloat(e.target.value))}
            className="w-24 accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="px-4 py-2 bg-[var(--bg)] border-t border-[var(--line)] font-mono text-xs overflow-x-auto text-[var(--ink)]">
        <span className="text-[var(--accent)] font-semibold">P_{order}(x) = </span>
        <span>{active.formula(order)}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">True f(x) (Blue)</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">
            {isNaN(fVal) ? "Undefined" : fVal.toFixed(5)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Taylor P_n(x) (Red)</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">
            {isNaN(pVal) ? "NaN" : pVal.toFixed(5)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Absolute Error</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">
            {isNaN(err) ? "—" : err < 1e-6 ? "< 10⁻⁶" : err.toFixed(5)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Conv. Radius R</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-d)]">{active.roc}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        As polynomial degree n increases, P_n(x) hugs the true function f(x) over a progressively wider domain around the expansion center a = 0.
      </figcaption>
    </figure>
  );
};
