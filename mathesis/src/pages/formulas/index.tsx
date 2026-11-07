import React, { useEffect, useState, useMemo } from "react";
import { Copy, Check, Filter } from "lucide-react";
import { CHAPTERS } from "../../data/chapters";
import { MathView } from "../../components/common/MathView";
import { useApp } from "../../context/AppContext";

export const FormulasPage: React.FC = () => {
  const { showToast } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Formula Sheet — Mathesis";
  }, []);

  const readyChaps = CHAPTERS.filter((c) => c.status !== "soon");

  const formulas = useMemo(() => {
    const list: {
      chapId: string;
      chapTitle: string;
      chapNo: number;
      lesTitle: string;
      name: string;
      math: string;
    }[] = [];

    for (const chap of readyChaps) {
      for (const les of chap.lessons) {
        for (const b of les.blocks) {
          if (
            (b.type === "callout" && (b.k === "definition" || b.k === "theorem") && b.x?.includes("$")) ||
            (b.type === "eq" && b.sheet)
          ) {
            list.push({
              chapId: chap.id,
              chapTitle: chap.title,
              chapNo: chap.no,
              lesTitle: les.title,
              name: b.name || b.title || "Formula",
              math: b.x || "",
            });
          }
        }
      }
    }
    return list;
  }, [readyChaps]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return formulas;
    return formulas.filter((f) => f.chapId === activeFilter);
  }, [formulas, activeFilter]);

  const handleCopy = async (mathStr: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(mathStr);
      setCopiedIndex(idx);
      showToast("LaTeX copied to clipboard");
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (_) {
      showToast("Could not access clipboard");
    }
  };

  return (
    <div className="py-8 px-4 sm:px-8 md:px-12 max-w-[1100px]">
      <div className="mb-8">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Course Reference Compendium
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)] mt-1 mb-2">
          Formula Sheet
        </h1>
        <p className="font-serif text-[17px] text-[var(--muted)]">
          Every core definition, derivative rule, and integration theorem in the curriculum, collected with one-click LaTeX copying.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${
              activeFilter === "all"
                ? "bg-[var(--ink)] text-[var(--panel)] border-[var(--ink)] font-medium"
                : "bg-[var(--panel)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)]"
            }`}
          >
            All Formulas ({formulas.length})
          </button>
          {readyChaps.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveFilter(c.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${
                activeFilter === c.id
                  ? "bg-[var(--ink)] text-[var(--panel)] border-[var(--ink)] font-medium"
                  : "bg-[var(--panel)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)]"
              }`}
            >
              Ch. {c.no}: {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-5 bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-xs hover:border-[var(--accent)] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] text-[var(--muted)]">
                <span>CH. {item.chapNo} · {item.lesTitle}</span>
              </div>
              <div className="font-serif font-bold text-[17px] text-[var(--ink)] mt-1 mb-3">
                {item.name}
              </div>
              <div className="py-2 overflow-x-auto text-center">
                <MathView math={item.math} block />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--line)]">
              <span className="font-mono text-[10.5px] text-[var(--muted)]">
                {item.chapTitle}
              </span>
              <button
                onClick={() => handleCopy(item.math, idx)}
                className="px-2 py-1 rounded border border-[var(--line)] bg-[var(--bg)] font-mono text-[11px] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] inline-flex items-center gap-1.5 transition-colors"
                title="Copy raw LaTeX code"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--c-d)]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy LaTeX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormulasPage;
