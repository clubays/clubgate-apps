import React, { useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { Block, PracticeProblem } from "../../types/curriculum";
import { MathView, RichMathText } from "../common/MathView";
import { WidgetDispatcher } from "../widgets/WidgetDispatcher";

interface BlockRendererProps {
  block: Block;
  index: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, index }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [openSolutions, setOpenSolutions] = useState<Record<number, boolean>>({});

  const toggleSolution = (i: number) => {
    setOpenSolutions((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  switch (block.type) {
    case "h2":
      return (
        <h2
          id={`sec-${index}`}
          className="font-serif font-bold text-2xl text-[var(--ink)] mt-12 mb-3.5 pt-4 scroll-mt-20 border-t border-[var(--line)]/50 first:border-none first:pt-0"
        >
          {block.x}
        </h2>
      );

    case "p":
      return (
        <p className="font-serif text-[18px] leading-[1.75] text-[var(--ink)] my-3.5 text-pretty">
          <RichMathText text={block.x || ""} />
        </p>
      );

    case "callout": {
      const borderMap = {
        definition: "border-l-[var(--c-f)]",
        theorem: "border-l-[var(--accent)]",
        tip: "border-l-[var(--c-d)]",
        warning: "border-l-[var(--c-dd)]",
      };
      const titleColorMap = {
        definition: "text-[var(--c-f)]",
        theorem: "text-[var(--accent)]",
        tip: "text-[var(--c-d)]",
        warning: "text-[var(--c-dd)]",
      };
      const k = block.k || "definition";

      return (
        <div
          className={`bg-[var(--panel)] border border-[var(--line)] border-l-4 ${borderMap[k]} rounded-r-md p-4.5 my-6 shadow-xs`}
        >
          <div
            className={`font-mono text-[10.5px] uppercase tracking-wider font-semibold ${titleColorMap[k]} mb-1`}
          >
            {k === "warning" ? "Watch out" : k}
          </div>
          {block.title && (
            <div className="font-serif font-bold text-[17.5px] text-[var(--ink)] mb-1">
              {block.title}
            </div>
          )}
          <div className="font-serif text-[17px] leading-relaxed text-[var(--ink)]">
            <RichMathText text={block.x || ""} />
          </div>
        </div>
      );
    }

    case "eq":
      return <MathView math={block.x || ""} block className="my-5" />;

    case "widget":
      return (
        <div className="my-6">
          <WidgetDispatcher id={block.id || ""} props={block.props} />
        </div>
      );

    case "details":
      return (
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-md overflow-hidden my-6">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full px-4 py-3 text-left font-serif font-semibold text-[16.5px] text-[var(--ink)] flex items-center justify-between hover:bg-[var(--chip)]/50 transition-colors"
          >
            <span>{block.title}</span>
            <ChevronRight
              className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${
                detailsOpen ? "rotate-90" : ""
              }`}
            />
          </button>
          {detailsOpen && (
            <div className="p-4 pt-1 border-t border-[var(--line)] font-serif text-[16.5px] leading-relaxed text-[var(--ink)] bg-[var(--panel)]">
              <RichMathText text={block.x || ""} />
            </div>
          )}
        </div>
      );

    case "example":
      return (
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-lg p-5 my-6 shadow-xs">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-mono text-[10.5px] uppercase font-bold tracking-wider text-[var(--accent)]">
              Example
            </span>
            <div className="font-serif font-bold text-lg text-[var(--ink)]">
              {block.title}
            </div>
          </div>
          <div className="flex flex-col gap-3 my-3">
            {block.steps?.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-5.5 h-5.5 rounded-full border border-[var(--line)] bg-[var(--bg)] font-mono text-[11px] text-[var(--muted)] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="font-serif text-[17px] leading-relaxed flex-1">
                  <RichMathText text={step} />
                </div>
              </div>
            ))}
          </div>
          {block.answer && (
            <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                Answer
              </span>
              <div className="px-3 py-1 rounded border border-[var(--ink)] bg-[var(--bg)] font-serif text-[17px]">
                <MathView math={block.answer} />
              </div>
            </div>
          )}
        </div>
      );

    case "mistakes":
      return (
        <div className="bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--c-dd)] rounded-r-md p-4.5 my-6">
          <div className="font-mono text-[10.5px] uppercase tracking-wider font-semibold text-[var(--c-dd)] mb-2">
            Watch Out for Common Pitfalls
          </div>
          <div className="flex flex-col gap-2">
            {block.items?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 font-serif text-[16.5px] leading-relaxed">
                <span className="text-[var(--c-dd)] font-bold shrink-0">✕</span>
                <div className="flex-1">
                  <RichMathText text={item} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "practice":
      return (
        <div className="flex flex-col gap-4 my-6">
          {(block.items as PracticeProblem[])?.map((pr, idx) => {
            const isSolOpen = !!openSolutions[idx];
            return (
              <div
                key={idx}
                className="bg-[var(--panel)] border border-[var(--line)] rounded-lg p-4.5 shadow-xs"
              >
                <div className="font-serif text-[17.5px] leading-relaxed font-medium">
                  <strong>{idx + 1}. </strong>
                  <RichMathText text={pr.q} />
                </div>
                <button
                  onClick={() => toggleSolution(idx)}
                  className="mt-3 px-3 py-1.5 rounded border border-[var(--line)] bg-[var(--bg)] font-mono text-[11px] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] inline-flex items-center gap-1.5 transition-colors"
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isSolOpen ? "rotate-90" : ""
                    }`}
                  />
                  <span>{isSolOpen ? "Hide solution" : "Show step-by-step solution"}</span>
                </button>
                {isSolOpen && (
                  <div className="mt-3 pt-3 border-t border-dashed border-[var(--line)] flex flex-col gap-2">
                    {pr.steps.map((st, sIdx) => (
                      <div key={sIdx} className="font-serif text-[16.5px] leading-relaxed text-[var(--muted)]">
                        <RichMathText text={st} />
                      </div>
                    ))}
                    <div className="mt-2 inline-flex items-center gap-2">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
                        Answer
                      </span>
                      <div className="px-2.5 py-0.5 rounded border border-[var(--line)] bg-[var(--bg)] font-serif text-[16.5px]">
                        <MathView math={pr.a} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );

    case "recap":
      return (
        <div className="bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--accent)] rounded-r-md p-4.5 my-8">
          <div className="font-mono text-[10.5px] uppercase tracking-widest font-semibold text-[var(--accent)] mb-2">
            Quick recap
          </div>
          <ul className="list-disc list-inside font-serif text-[17px] leading-relaxed flex flex-col gap-1.5">
            {block.items?.map((it, idx) => (
              <li key={idx} className="marker:text-[var(--accent)]">
                <RichMathText text={it} />
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
};
