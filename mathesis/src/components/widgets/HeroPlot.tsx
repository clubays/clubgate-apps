import React, { useEffect, useRef, useState } from "react";
import { Plot } from "../../utils/plot";

export const HeroPlot: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<Plot | null>(null);
  const [readout, setReadout] = useState("f′(x) = cos x = 0.54");

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = new Plot(containerRef.current, { xmin: -7, xmax: 7, ymin: -2, ymax: 2 });
    plotRef.current = plot;

    let animId: number;
    let t = 0;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function renderFrame() {
      const x = reducedMotion ? 1.0 : 5.5 * Math.sin(t * 0.35);
      const y = Math.sin(x);
      const slope = Math.cos(x);

      setReadout(`f′(x) = cos x = ${slope.toFixed(2)}`);

      plot.setRender((p) => {
        const c = p.getColors();
        p.curve(Math.sin, c.cf, 2);

        // Tangent +- 1.6 units
        const tLen = 1.6;
        const dx = tLen / Math.sqrt(1 + slope * slope);
        const dy = slope * dx;
        p.segment(x - dx, y - dy, x + dx, y + dy, c.accent, 2);

        // Dot
        p.dot(x, y, 5, c.accent);
      });

      if (!reducedMotion) {
        t += 0.02;
        animId = requestAnimationFrame(renderFrame);
      }
    }

    renderFrame();

    const handleTheme = () => plot.requestDraw();
    window.addEventListener("themechange", handleTheme);

    return () => {
      window.removeEventListener("themechange", handleTheme);
      cancelAnimationFrame(animId);
      plot.destroy();
    };
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden">
      {/* Corner drafting brackets */}
      <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t border-l border-[var(--line)] pointer-events-none" />
      <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r border-[var(--line)] pointer-events-none" />
      <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b border-l border-[var(--line)] pointer-events-none" />
      <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b border-r border-[var(--line)] pointer-events-none" />

      {/* Real-time readout badge */}
      <div className="absolute top-4 left-4 z-10 font-mono text-xs text-[var(--ink)] bg-[var(--panel)]/85 px-2 py-1 rounded border border-[var(--line)] shadow-xs">
        {readout}
      </div>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
