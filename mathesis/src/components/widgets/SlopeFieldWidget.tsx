import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

interface SlopeFieldWidgetProps {
  preset?: "linear" | "cooling" | "logistic" | "circle";
  initialX0?: number;
  initialY0?: number;
}

export const SlopeFieldWidget: React.FC<SlopeFieldWidgetProps> = ({
  preset = "linear",
  initialX0 = -2,
  initialY0 = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [pKey, setPKey] = useState<"linear" | "cooling" | "logistic" | "circle" | "oscillator">(preset as any);
  const [method, setMethod] = useState<"rk4" | "euler">("rk4");
  const [x0, setX0] = useState(initialX0);
  const [y0, setY0] = useState(initialY0);
  const [eulerStep, setEulerStep] = useState(0.4);

  const systems = {
    linear: {
      label: "dy/dx = x - y",
      f: (x: number, y: number) => x - y,
      exact: (x: number, c: number) => x - 1 + c * Math.exp(-x),
      bounds: { xmin: -4, xmax: 4, ymin: -3, ymax: 3 },
      note: "Direction field with isoclines along lines of constant slope.",
    },
    cooling: {
      label: "dy/dx = -0.8(y - 1) (Newton Cooling)",
      f: (_x: number, y: number) => -0.8 * (y - 1),
      exact: (x: number, c: number) => 1 + c * Math.exp(-0.8 * x),
      bounds: { xmin: -1, xmax: 6, ymin: -1, ymax: 4 },
      note: "Ambient temperature T_env = 1. Trajectories asymptotically relax toward equilibrium.",
    },
    logistic: {
      label: "dy/dx = y(1 - y/2) (Logistic Growth)",
      f: (_x: number, y: number) => y * (1 - y / 2),
      exact: null,
      bounds: { xmin: -3, xmax: 5, ymin: -1, ymax: 3 },
      note: "Stable carrying capacity at y = 2, unstable equilibrium at y = 0.",
    },
    circle: {
      label: "dy/dx = -x / y (Harmonic / Circles)",
      f: (x: number, y: number) => (Math.abs(y) < 1e-4 ? (x > 0 ? -1e4 : 1e4) : -x / y),
      exact: null,
      bounds: { xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5 },
      note: "Orthogonal trajectories form concentric circles x² + y² = r².",
    },
    oscillator: {
      label: "dy/dx = cos(x) - 0.5y",
      f: (x: number, y: number) => Math.cos(x) - 0.5 * y,
      exact: null,
      bounds: { xmin: -5, xmax: 5, ymin: -3, ymax: 3 },
      note: "Sinusoidal driving force balanced by first-order damping.",
    },
  };

  const activeSys = systems[pKey];

  const ptRef = useRef({ x: x0, y: y0 });
  ptRef.current = { x: x0, y: y0 };

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, activeSys.bounds);
    plotRef.current = plot;

    const canvas = plot.canvas;
    let isDraggingPt = false;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const w = plot.toWorld(sx, sy);
      const curScreen = plot.toScreen(ptRef.current.x, ptRef.current.y);
      const dist = Math.hypot(sx - curScreen.x, sy - curScreen.y);

      if (dist < 22 || e.shiftKey) {
        isDraggingPt = true;
        setX0(w.x);
        setY0(w.y);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingPt) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const w = plot.toWorld(sx, sy);
      setX0(w.x);
      setY0(w.y);
    };

    const handlePointerUp = () => {
      isDraggingPt = false;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    const handleTheme = () => plot.requestDraw();
    window.addEventListener("themechange", handleTheme);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("themechange", handleTheme);
      plot.destroy();
    };
  }, []);

  useEffect(() => {
    if (plotRef.current) {
      plotRef.current.setBounds(activeSys.bounds);
    }
  }, [pKey]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const c = p.getColors();
      const ctx = p.ctx;
      const f = activeSys.f;

      // Draw slope field segments
      const xRange = p.bounds.xmax - p.bounds.xmin;
      const yRange = p.bounds.ymax - p.bounds.ymin;
      const nx = 20;
      const ny = 16;
      const dx = xRange / nx;
      const dy = yRange / ny;
      const segLen = 7; // half visual length

      ctx.save();
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.45;

      for (let i = 0; i <= nx; i++) {
        const xVal = p.bounds.xmin + i * dx;
        for (let j = 0; j <= ny; j++) {
          const yVal = p.bounds.ymin + j * dy;
          const slope = f(xVal, yVal);
          if (isNaN(slope) || !isFinite(slope)) continue;

          const angle = Math.atan(slope);
          const sp = p.toScreen(xVal, yVal);
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          ctx.beginPath();
          ctx.moveTo(sp.x - segLen * cosA, sp.y + segLen * sinA);
          ctx.lineTo(sp.x + segLen * cosA, sp.y - segLen * sinA);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Draw Solution Trajectory
      if (method === "rk4") {
        // Runge-Kutta 4th order forward and backward
        const rk4Step = (x: number, y: number, h: number) => {
          const k1 = f(x, y);
          const k2 = f(x + 0.5 * h, y + 0.5 * h * k1);
          const k3 = f(x + 0.5 * h, y + 0.5 * h * k2);
          const k4 = f(x + h, y + h * k3);
          return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        };

        const traceTrajectory = (direction: 1 | -1) => {
          ctx.beginPath();
          const pStart = p.toScreen(x0, y0);
          ctx.moveTo(pStart.x, pStart.y);

          let curX = x0;
          let curY = y0;
          const h = 0.04 * direction;
          const maxSteps = 400;

          for (let step = 0; step < maxSteps; step++) {
            if (
              curX < p.bounds.xmin - 1 ||
              curX > p.bounds.xmax + 1 ||
              curY < p.bounds.ymin - 1 ||
              curY > p.bounds.ymax + 1 ||
              isNaN(curY)
            ) {
              break;
            }
            curY = rk4Step(curX, curY, h);
            curX += h;
            const scr = p.toScreen(curX, curY);
            ctx.lineTo(scr.x, scr.y);
          }
          ctx.stroke();
        };

        ctx.save();
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 2.5;
        traceTrajectory(1);
        traceTrajectory(-1);
        ctx.restore();
      } else {
        // Euler Method forward with visible discrete chords
        ctx.save();
        ctx.strokeStyle = c.cd;
        ctx.lineWidth = 2;

        let curX = x0;
        let curY = y0;
        const h = eulerStep;
        const steps = 15;

        for (let s = 0; s < steps; s++) {
          const slope = f(curX, curY);
          const nextX = curX + h;
          const nextY = curY + h * slope;

          p.segment(curX, curY, nextX, nextY, c.cd, 2.2);
          p.dot(curX, curY, 3, c.cd);

          curX = nextX;
          curY = nextY;
          if (curX > p.bounds.xmax + 1 || Math.abs(curY) > 50) break;
        }
        ctx.restore();
      }

      // Draw initial point (x0, y0)
      p.dot(x0, y0, 6, c.accent, "#ffffff");
      const label = `(${x0.toFixed(2)}, ${y0.toFixed(2)})`;
      const ptScr = p.toScreen(x0, y0);
      ctx.font = `11px ${c.mono}`;
      ctx.fillStyle = c.ink;
      ctx.fillText(label, ptScr.x + 8, ptScr.y - 8);
    });
  }, [x0, y0, activeSys, method, eulerStep]);

  const slopeAtPt = activeSys.f(x0, y0);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Direction Field &amp; Solution Curves
        </span>
        <button
          onClick={() => {
            setX0(initialX0);
            setY0(initialY0);
            plotRef.current?.resetView();
          }}
          className="p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded transition-colors"
          title="Reset initial condition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] min-h-[300px] bg-[var(--bg)] cursor-crosshair select-none"
      />

      <div className="p-4 flex flex-wrap items-center gap-4 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)]">Equation</label>
          <select
            value={pKey}
            onChange={(e) => {
              setPKey(e.target.value as any);
              setX0(0);
              setY0(1);
            }}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="linear">dy/dx = x - y</option>
            <option value="cooling">dy/dx = -0.8(y - 1) [Cooling]</option>
            <option value="logistic">dy/dx = y(1 - y/2) [Logistic]</option>
            <option value="circle">dy/dx = -x / y [Concentric]</option>
            <option value="oscillator">dy/dx = cos(x) - 0.5y</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)]">Solver</label>
          <div className="inline-flex rounded border border-[var(--line)] p-0.5 text-xs bg-[var(--bg)]">
            <button
              onClick={() => setMethod("rk4")}
              className={`px-2.5 py-1 rounded transition-colors ${
                method === "rk4" ? "bg-[var(--panel)] font-semibold text-[var(--ink)] shadow-xs" : "text-[var(--muted)]"
              }`}
            >
              Exact (RK4)
            </button>
            <button
              onClick={() => setMethod("euler")}
              className={`px-2.5 py-1 rounded transition-colors ${
                method === "euler" ? "bg-[var(--panel)] font-semibold text-[var(--ink)] shadow-xs" : "text-[var(--muted)]"
              }`}
            >
              Euler Method
            </button>
          </div>
        </div>

        {method === "euler" && (
          <div className="flex items-center gap-2">
            <label className="font-mono text-xs text-[var(--muted)]">Step Δx: {eulerStep.toFixed(2)}</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={eulerStep}
              onChange={(e) => setEulerStep(parseFloat(e.target.value))}
              className="w-24 accent-[var(--accent)]"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Seed Point (x₀, y₀)</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">
            ({x0.toFixed(2)}, {y0.toFixed(2)})
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Current Slope dy/dx</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">
            {isNaN(slopeAtPt) ? "Undefined" : slopeAtPt.toFixed(3)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Dynamics</div>
          <div className="font-mono text-sm font-semibold text-[var(--cd,var(--ink))]">
            {slopeAtPt > 0.05 ? "Rising ↗" : slopeAtPt < -0.05 ? "Falling ↘" : "Stationary →"}
          </div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        Click or drag anywhere in the plane to reposition (x₀, y₀). Notice how solution curves are everywhere tangent to the slope field segments.
      </figcaption>
    </figure>
  );
};
