import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Plot } from "../../utils/plot";

interface MatrixTransformWidgetProps {
  initialPreset?: "rotation" | "shear" | "scale" | "reflection" | "projection";
}

export const MatrixTransformWidget: React.FC<MatrixTransformWidgetProps> = ({
  initialPreset = "shear",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);

  const [preset, setPreset] = useState<"rotation" | "shear" | "scale" | "reflection" | "projection" | "custom">(
    initialPreset
  );
  const [a, setA] = useState(1);
  const [b, setB] = useState(1.2);
  const [c, setC] = useState(0);
  const [d, setD] = useState(1);
  const [t, setT] = useState(1); // interpolation from I to A

  const applyPreset = (name: string) => {
    if (name === "rotation") {
      const angle = Math.PI / 4; // 45 deg
      setA(Math.cos(angle));
      setB(-Math.sin(angle));
      setC(Math.sin(angle));
      setD(Math.cos(angle));
    } else if (name === "shear") {
      setA(1);
      setB(1.2);
      setC(0);
      setD(1);
    } else if (name === "scale") {
      setA(1.6);
      setB(0);
      setC(0);
      setD(0.7);
    } else if (name === "reflection") {
      setA(0);
      setB(1);
      setC(1);
      setD(0);
    } else if (name === "projection") {
      setA(1);
      setB(0.5);
      setC(0);
      setD(0);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5, equal: true });
    plotRef.current = plot;

    const handleTheme = () => plot.requestDraw();
    window.addEventListener("themechange", handleTheme);

    return () => {
      window.removeEventListener("themechange", handleTheme);
      plot.destroy();
    };
  }, []);

  // Compute interpolated matrix M(t) = (1-t)I + tA
  const curA = (1 - t) * 1 + t * a;
  const curB = (1 - t) * 0 + t * b;
  const curC = (1 - t) * 0 + t * c;
  const curD = (1 - t) * 1 + t * d;

  const det = curA * curD - curB * curC;
  const trace = curA + curD;
  const disc = trace * trace - 4 * det;

  let eigenInfo = "Complex eigenvalues";
  let eig1: { val: number; vx: number; vy: number } | null = null;
  let eig2: { val: number; vx: number; vy: number } | null = null;

  if (disc >= 0) {
    const l1 = (trace + Math.sqrt(disc)) / 2;
    const l2 = (trace - Math.sqrt(disc)) / 2;
    eigenInfo = `λ₁ = ${l1.toFixed(2)}, λ₂ = ${l2.toFixed(2)}`;

    // Find eigenvector for l1
    const getEigVec = (l: number) => {
      if (Math.abs(curB) > 1e-4) return { vx: curB, vy: l - curA };
      if (Math.abs(curC) > 1e-4) return { vx: l - curD, vy: curC };
      return { vx: 1, vy: 0 };
    };
    const v1 = getEigVec(l1);
    const m1 = Math.hypot(v1.vx, v1.vy) || 1;
    eig1 = { val: l1, vx: v1.vx / m1, vy: v1.vy / m1 };

    const v2 = getEigVec(l2);
    const m2 = Math.hypot(v2.vx, v2.vy) || 1;
    eig2 = { val: l2, vx: v2.vx / m2, vy: v2.vy / m2 };
  }

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    plot.setRender((p) => {
      const colors = p.getColors();
      const ctx = p.ctx;

      // Transform function
      const trans = (x: number, y: number) => ({
        x: curA * x + curB * y,
        y: curC * x + curD * y,
      });

      // 1. Draw transformed grid lines
      ctx.save();
      ctx.strokeStyle = colors.gridStrong;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;

      for (let g = -5; g <= 5; g++) {
        if (g === 0) continue;
        // Vertical lines (fixed x=g, varying y)
        const vStart = trans(g, -5);
        const vEnd = trans(g, 5);
        const pVS = p.toScreen(vStart.x, vStart.y);
        const pVE = p.toScreen(vEnd.x, vEnd.y);
        ctx.beginPath();
        ctx.moveTo(pVS.x, pVS.y);
        ctx.lineTo(pVE.x, pVE.y);
        ctx.stroke();

        // Horizontal lines (fixed y=g, varying x)
        const hStart = trans(-5, g);
        const hEnd = trans(5, g);
        const pHS = p.toScreen(hStart.x, hStart.y);
        const pHE = p.toScreen(hEnd.x, hEnd.y);
        ctx.beginPath();
        ctx.moveTo(pHS.x, pHS.y);
        ctx.lineTo(pHE.x, pHE.y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw transformed unit square (parallelogram)
      const p00 = p.toScreen(0, 0);
      const p10 = p.toScreen(curA, curC);
      const p11 = p.toScreen(curA + curB, curC + curD);
      const p01 = p.toScreen(curB, curD);

      ctx.save();
      ctx.fillStyle = det >= 0 ? "rgba(29, 95, 168, 0.16)" : "rgba(194, 55, 29, 0.16)";
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = det >= 0 ? colors.cf : colors.accent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.restore();

      // 3. Draw Eigenvector lines if real
      if (eig1 && disc >= 0) {
        ctx.save();
        p.line(0, 0, eig1.vx, eig1.vy, colors.cdd, 1.5, [4, 4]);
        if (eig2 && Math.abs(eig1.vx * eig2.vy - eig1.vy * eig2.vx) > 1e-3) {
          p.line(0, 0, eig2.vx, eig2.vy, colors.cdd, 1.5, [4, 4]);
        }
        ctx.restore();
      }

      // 4. Draw transformed basis vectors i_hat (Red) and j_hat (Green)
      const drawArrow = (tx: number, ty: number, color: string, label: string) => {
        p.segment(0, 0, tx, ty, color, 3);
        const origin = p.toScreen(0, 0);
        const tip = p.toScreen(tx, ty);
        const angle = Math.atan2(tip.y - origin.y, tip.x - origin.x);
        const headLen = 11;

        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(
          tip.x - headLen * Math.cos(angle - Math.PI / 6),
          tip.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          tip.x - headLen * Math.cos(angle + Math.PI / 6),
          tip.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        ctx.font = `bold 12px ${colors.mono}`;
        ctx.fillText(label, tip.x + 8, tip.y - 6);
        ctx.restore();
      };

      drawArrow(curA, curC, colors.accent, "T(î)");
      drawArrow(curB, curD, colors.cd, "T(ĵ)");
    });
  }, [curA, curB, curC, curD, det, disc, eig1, eig2]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · Linear Transformation &amp; Determinant Area
        </span>
        <button
          onClick={() => {
            setPreset("shear");
            applyPreset("shear");
            setT(1);
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

      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="flex items-center gap-3">
          <label className="font-mono text-xs text-[var(--muted)]">Preset</label>
          <select
            value={preset}
            onChange={(e) => {
              const val = e.target.value as any;
              setPreset(val);
              applyPreset(val);
            }}
            className="h-8.5 px-2.5 text-xs bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="shear">Horizontal Shear</option>
            <option value="rotation">45° Rotation</option>
            <option value="scale">Non-Uniform Scale</option>
            <option value="reflection">Reflection (y = x)</option>
            <option value="projection">Rank-1 Projection</option>
            <option value="custom">Custom Matrix</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)] min-w-[70px]">
            Transform: <span className="font-bold text-[var(--ink)]">{(t * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            className="w-28 accent-[var(--accent)]"
          />
        </div>
      </div>

      {preset === "custom" && (
        <div className="px-4 py-2.5 bg-[var(--bg)] border-t border-[var(--line)] flex items-center gap-4 text-xs font-mono">
          <span className="text-[var(--muted)]">Entries:</span>
          <div className="flex items-center gap-1">
            <span>a:</span>
            <input
              type="number"
              step="0.1"
              value={a}
              onChange={(e) => setA(parseFloat(e.target.value) || 0)}
              className="w-14 px-1 py-0.5 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]"
            />
          </div>
          <div className="flex items-center gap-1">
            <span>b:</span>
            <input
              type="number"
              step="0.1"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value) || 0)}
              className="w-14 px-1 py-0.5 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]"
            />
          </div>
          <div className="flex items-center gap-1">
            <span>c:</span>
            <input
              type="number"
              step="0.1"
              value={c}
              onChange={(e) => setC(parseFloat(e.target.value) || 0)}
              className="w-14 px-1 py-0.5 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]"
            />
          </div>
          <div className="flex items-center gap-1">
            <span>d:</span>
            <input
              type="number"
              step="0.1"
              value={d}
              onChange={(e) => setD(parseFloat(e.target.value) || 0)}
              className="w-14 px-1 py-0.5 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 px-4 py-2.5 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Matrix A</div>
          <div className="font-mono text-xs font-semibold text-[var(--ink)] tabular-nums">
            [{curA.toFixed(2)}, {curB.toFixed(2)}; {curC.toFixed(2)}, {curD.toFixed(2)}]
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Determinant det(A)</div>
          <div className="font-mono text-sm font-semibold text-[var(--c-f)] tabular-nums">
            {det.toFixed(3)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Area Scale Factor</div>
          <div className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">
            {Math.abs(det).toFixed(3)} {det < 0 ? "(Flipped)" : ""}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Eigenvalues</div>
          <div className="font-mono text-xs font-semibold text-[var(--c-d)]">{eigenInfo}</div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)]">
        The columns of matrix A describe where basis vectors î (red) and ĵ (green) land. The shaded parallelogram is the transformed unit square; its signed area equals det(A).
      </figcaption>
    </figure>
  );
};
