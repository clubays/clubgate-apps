import React, { useMemo, useState } from "react";
import * as math from "mathjs";
import { MathView } from "../common/MathView";

interface DerivLabWidgetProps {
  mode?: "derivative" | "antiderivative";
  preset?: string;
}

export const DerivLabWidget: React.FC<DerivLabWidgetProps> = ({
  mode = "derivative",
  preset,
}) => {
  const isAnti = mode === "antiderivative";
  const defaultTarget = preset || (isAnti ? "2*x*cos(x^2)" : "x^2*sin(x)");

  const [targetExpr, setTargetExpr] = useState(defaultTarget);
  const [userAnswer, setUserAnswer] = useState("");

  const checkStatus = useMemo(() => {
    if (!targetExpr.trim()) return { text: "Provide a target function", color: "var(--muted)" };
    if (!userAnswer.trim()) {
      return {
        text: "Type your answer above to check",
        color: "var(--muted)",
      };
    }

    try {
      const targetNode = math.parse(targetExpr);
      const compiledTarget = targetNode.compile();

      const ansNode = math.parse(userAnswer);
      const compiledAns = ansNode.compile();

      // Sample 25 points in [-2.5, 2.5]
      const samples: number[] = [];
      for (let i = 0; i < 25; i++) {
        const xVal = -2.4 + (i * 4.8) / 24;
        if (Math.abs(xVal) < 0.05) continue;
        samples.push(xVal);
      }

      let matches = true;
      let failSample: { x: number; got: number; expected: number } | null = null;

      if (!isAnti) {
        // user should have differentiated target
        const dNode = math.derivative(targetNode, "x");
        const compiledD = dNode.compile();
        for (const x of samples) {
          const expected = compiledD.evaluate({ x });
          const got = compiledAns.evaluate({ x });
          if (isNaN(expected) || !isFinite(expected)) continue;
          if (Math.abs(expected - got) > 1e-3) {
            matches = false;
            failSample = { x, got, expected };
            break;
          }
        }
      } else {
        // user's derivative should equal target
        const dAns = math.derivative(ansNode, "x");
        const compiledDAns = dAns.compile();
        for (const x of samples) {
          const expected = compiledTarget.evaluate({ x });
          const got = compiledDAns.evaluate({ x });
          if (isNaN(expected) || !isFinite(expected)) continue;
          if (Math.abs(expected - got) > 1e-3) {
            matches = false;
            failSample = { x, got, expected };
            break;
          }
        }
      }

      if (matches) {
        return { text: "✓ Matches perfectly! Excellent algebraic work.", color: "var(--c-d)" };
      } else if (failSample) {
        return {
          text: `✗ Discrepancy at x = ${failSample.x.toFixed(2)} (your answer gives ${failSample.got.toFixed(3)}, target expected ${failSample.expected.toFixed(3)})`,
          color: "var(--accent)",
        };
      }
    } catch (_) {
      return { text: "Expression incomplete or invalid syntax", color: "var(--accent)" };
    }

    return { text: "Enter an answer above", color: "var(--muted)" };
  }, [targetExpr, userAnswer, isAnti]);

  const exactFormulaTex = useMemo(() => {
    try {
      const node = math.parse(targetExpr);
      if (!isAnti) {
        const d = math.derivative(node, "x");
        return `f'(x) = ${d.toTex()}`;
      } else {
        return `\\int (${node.toTex()})\\,dx`;
      }
    } catch (_) {
      return "";
    }
  }, [targetExpr, isAnti]);

  return (
    <figure className="bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm overflow-hidden my-6">
      <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
          Interactive · {isAnti ? "Antiderivative Lab" : "Derivative Lab"}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3.5 bg-[var(--panel)]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)] w-24 shrink-0">Target f(x)</label>
          <input
            type="text"
            value={targetExpr}
            onChange={(e) => setTargetExpr(e.target.value)}
            className="flex-1 h-8.5 px-3 font-mono text-xs bg-[var(--bg)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="font-mono text-xs text-[var(--muted)] w-24 shrink-0">Your answer</label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={isAnti ? "e.g. sin(x^2)" : "e.g. 2*x*sin(x) + x^2*cos(x)"}
            className="flex-1 h-8.5 px-3 font-mono text-xs bg-[var(--bg)] border border-[var(--line)] rounded text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border-t border-[var(--line)] bg-[var(--panel)]">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">
            {isAnti ? "Target Antiderivative ∫ f(x) dx" : "Exact Derivative d/dx f(x)"}
          </div>
          <div className="min-h-[26px] mt-1 font-mono text-sm">
            {exactFormulaTex ? <MathView math={exactFormulaTex} /> : "—"}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--muted)]">Result Verification</div>
          <div
            className="font-mono text-xs font-semibold mt-1"
            style={{ color: checkStatus.color }}
          >
            {checkStatus.text}
          </div>
        </div>
      </div>

      <figcaption className="px-4 py-2 font-serif text-xs italic text-[var(--muted)] bg-[var(--panel)] border-t border-[var(--line)]">
        Test your algebra! The engine evaluates your answer across 25 sample points (ignoring arbitrary constant + C in integration mode).
      </figcaption>
    </figure>
  );
};
