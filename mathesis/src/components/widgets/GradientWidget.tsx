import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

interface GradientWidgetProps {
  initialPreset?: "paraboloid" | "saddle" | "gaussian" | "waves";
  initialX?: number;
  initialY?: number;
}

export const GradientWidget: React.FC<GradientWidgetProps> = ({
  initialPreset = "paraboloid",
  initialX = 1.5,
  initialY = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [preset, setPreset] = useState<"paraboloid" | "saddle" | "gaussian" | "waves">(initialPreset);
  const [probeX, setProbeX] = useState(initialX);
  const [probeY, setProbeY] = useState(initialY);
  const [showAscentPath, setShowAscentPath] = useState(true);

  const surfaces = {
    paraboloid: {
      name: "f(x, y) = x² + y² (Bowl)",
      f: (x: number, y: number) => x * x + y * y,
      grad: (x: number, y: number) => ({ dx: 2 * x, dy: 2 * y }),
      bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },
      contourLevels: [0.5, 1, 2, 3, 4, 6, 8],
    },
    saddle: {
      name: "f(x, y) = x² - y² (Saddle)",
      f: (x: number, y: number) => x * x - y * y,
      grad: (x: number, y: number) => ({ dx: 2 * x, dy: -2 * y }),
      bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },
      contourLevels: [-6, -4, -2, -1, 0, 1, 2, 4, 6],
    },
    gaussian: {
      name: "f(x, y) = 4·exp(-(x² + y²)/2) (Hill)",
      f: (x: number, y: number) => 4 * Math.exp(-(x * x + y * y) / 2),
      grad: (x: number, y: number) => {
        const val = 4 * Math.exp(-(x * x + y * y) / 2);
        return { dx: -val * x, dy: -val * y };
      },
      bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },
      contourLevels: [0.2, 0.6, 1.2, 2.0, 2.8, 3.5],
    },
    waves: {
      name: "f(x, y) = sin(x) + cos(y) (Peaks & Pits)",
      f: (x: number, y: number) => Math.sin(x) + Math.cos(y),
      grad: (x: number, y: number) => ({ dx: Math.cos(x), dy: -Math.sin(y) }),
      bounds: { xmin: -4, xmax: 4, ymin: -4, ymax: 4 },
      contourLevels: [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5],
    },
  };

  const active = surfaces[preset];

  const probeRef = useRef({ x: probeX, y: probeY });
  probeRef.current = { x: probeX, y: probeY };

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { ...active.bounds, equal: true });
    plotRef.current = plot;

    const canvas = plot.canvas;
    let isDragging = false;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const w = plot.toWorld(sx, sy);
      const curScr = plot.toScreen(probeRef.current.x, probeRef.current.y);
      const dist = Math.hypot(sx - curScr.x, sy - curScr.y);

      if (dist < 25 || e.shiftKey) {
        isDragging = true;
        setProbeX(Math.max(plot.bounds.xmin, Math.min(plot.bounds.xmax, w.x)));
        setProbeY(Math.max(plot.bounds.ymin, Math.min(plot.bounds.ymax, w.y)));
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const w = plot.toWorld(sx, sy);
      setProbeX(Math.max(plot.bounds.xmin, Math.min(plot.bounds.xmax, w.x)));
      setProbeY(Math.max(plot.bounds.ymin, Math.min(plot.bounds.ymax, w.y)));
    };

    const handlePointerUp = () => {
      isDragging = false;
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
      plotRef.current.setBounds(active.bounds);
    }
  }, [preset]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const c = p.getColors();
      const ctx = p.ctx;

      // Draw elevation contours via implicit Marching-Grid
      const nx = 44;
      const ny = 44;
      const xmin = p.bounds.xmin;
      const xmax = p.bounds.xmax;
      const ymin = p.bounds.ymin;
      const ymax = p.bounds.ymax;
      const dx = (xmax - xmin) / nx;
      const dy = (ymax - ymin) / ny;

      // Sample grid
      const grid: number[][] = [];
      for (let i = 0; i <= nx; i++) {
        grid[i] = [];
        const xVal = xmin + i * dx;
        for (let j = 0; j <= ny; j++) {
          const yVal = ymin + j * dy;
          grid[i][j] = active.f(xVal, yVal);
        }
      }

      // Draw each contour level
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = c.line;
      ctx.globalAlpha = 0.85;

      for (const level of active.contourLevels) {
        for (let i = 0; i < nx; i++) {
          for (let j = 0; j < ny; j++) {
            const v00 = grid[i][j] - level;
            const v10 = grid[i + 1][j] - level;
            const v11 = grid[i + 1][j + 1] - level;
            const v01 = grid[i][j + 1] - level;

            const edges: { x: number; y: number }[] = [];

            // Bottom edge (j)
            if ((v00 > 0 && v10 <= 0) || (v00 <= 0 && v10 > 0)) {
              const t = -v00 / (v10 - v00);
              edges.push({ x: xmin + (i + t) * dx, y: ymin + j * dy });
            }
            // Right edge (i+1)
            if ((v10 > 0 && v11 <= 0) || (v10 <= 0 && v11 > 0)) {
              const t = -v10 / (v11 - v10);
              edges.push({ x: xmin + (i + 1) * dx, y: ymin + (j + t) * dy });
            }
            // Top edge (j+1)
            if ((v11 > 0 && v01 <= 0) || (v11 <= 0 && v01 > 0)) {
              const t = -v01 / (v11 - v01);
              edges.push({ x: xmin + (i + t) * dx, y: ymin + (j + 1) * dy });
            }
            // Left edge (i)
            if ((v01 > 0 && v00 <= 0) || (v01 <= 0 && v00 > 0)) {
              const t = -v00 / (v01 - v00);
              edges.push({ x: xmin + i * dx, y: ymin + (j + t) * dy });
            }

            if (edges.length === 2) {
              const pA = p.toScreen(edges[0].x, edges[0].y);
              const pB = p.toScreen(edges[1].x, edges[1].y);
              ctx.beginPath();
              ctx.moveTo(pA.x, pA.y);
              ctx.lineTo(pB.x, pB.y);
              ctx.stroke();
            }
          }
        }
      }
      ctx.restore();

      // Draw Gradient Ascent Path if active
      if (showAscentPath) {
        ctx.save();
        ctx.strokeStyle = c.cdd;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();

        let cx = probeX;
        let cy = probeY;
        const sp0 = p.toScreen(cx, cy);
        ctx.moveTo(sp0.x, sp0.y);

        const stepSize = 0.04;
        for (let s = 0; s < 120; s++) {
          const g = active.grad(cx, cy);
          const mag = Math.hypot(g.dx, g.dy);
          if (mag < 1e-3 || !isFinite(mag)) break;

          cx += (g.dx / mag) * stepSize;
          cy += (g.dy / mag) * stepSize;
          const sc = p.toScreen(cx, cy);
          ctx.lineTo(sc.x, sc.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw Gradient Vector ∇f at (probeX, probeY)
      const grad = active.grad(probeX, probeY);
      const gradMag = Math.hypot(grad.dx, grad.dy);
      const scale = 0.35; // visual vector scale

      const arrowEnd = {
        x: probeX + grad.dx * scale,
        y: probeY + grad.dy * scale,
      };

      // Vector line
      p.segment(probeX, probeY, arrowEnd.x, arrowEnd.y, c.accent, 3);

      // Arrowhead
      const pStart = p.toScreen(probeX, probeY);
      const pEnd = p.toScreen(arrowEnd.x, arrowEnd.y);
      const angle = Math.atan2(pEnd.y - pStart.y, pEnd.x - pStart.x);
      const headLen = 10;

      ctx.save();
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(pEnd.x, pEnd.y);
      ctx.lineTo(
        pEnd.x - headLen * Math.cos(angle - Math.PI / 6),
        pEnd.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        pEnd.x - headLen * Math.cos(angle + Math.PI / 6),
        pEnd.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Tangent direction (perpendicular to gradient, along level curve)
      if (gradMag > 1e-3) {
        const perpX = -grad.dy / gradMag;
        const perpY = grad.dx / gradMag;
        p.segment(
          probeX - perpX * 0.8,
          probeY - perpY * 0.8,
          probeX + perpX * 0.8,
          probeY + perpY * 0.8,
          c.cd,
          1.8,
          [4, 3]
        );
      }
      ctx.restore();

      // Probe point
      p.dot(probeX, probeY, 6, c.accent, "#ffffff");
    });
  }, [probeX, probeY, active, showAscentPath]);

  const fVal = active.f(probeX, probeY);
  const grad = active.grad(probeX, probeY);
  const gradMag = Math.hypot(grad.dx, grad.dy);
  const angleDeg = ((Math.atan2(grad.dy, grad.dx) * 180) / Math.PI + 360) % 360;

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Level Curves &amp; Gradient Vector ∇f
        </span>
        <button
          onClick={() => {
            setProbeX(initialX);
            setProbeY(initialY);
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
        className="relative w-full aspect-[16/9] min-h-[300px] bg-[var(--bg)] cursor-crosshair select-none"
      />

      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="flex items-center gap-3">
          <label className="font-mono text-xs text-[var(--muted)]">Surface</label>
          <select
            value={preset}
            onChange={(e) => {
              setPreset(e.target.value as any);
              setProbeX(1.2);
              setProbeY(1.0);
            }}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="paraboloid">f(x, y) = x² + y² [Bowl]</option>
            <option value="saddle">f(x, y) = x² - y² [Saddle]</option>
            <option value="gaussian">f(x, y) = 4·exp(-(x²+y²)/2) [Hill]</option>
            <option value="waves">f(x, y) = sin(x) + cos(y) [Waves]</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[var(--muted)]">
          <input
            type="checkbox"
            checked={showAscentPath}
            onChange={(e) => setShowAscentPath(e.target.checked)}
            className="rounded accent-[var(--accent)]"
          />
          Show Steepest Ascent Path
        </label>
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Probe (x, y)</div>
          <div className="font-mono text-sm font-semibold text-[var(--ink)] tabular-nums">
            ({probeX.toFixed(2)}, {probeY.toFixed(2)})
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Elevation f(x, y)</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">{fVal.toFixed(3)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Gradient ∇f (Red)</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">
            ⟨{grad.dx.toFixed(2)}, {grad.dy.toFixed(2)}⟩
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Steepness |∇f| · Angle</div>
          <div className="font-mono text-sm font-semibold text-[var(--cd,var(--ink))] tabular-nums">
            {gradMag.toFixed(2)} @ {angleDeg.toFixed(0)}°
          </div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        The red vector ∇f is strictly perpendicular to contour lines and points directly in the direction of steepest ascent. The dashed green line represents the contour tangent where directional derivative D_u f = 0.
      </figcaption>
    </figure>
  );
};
