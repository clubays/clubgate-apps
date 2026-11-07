import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Chapter } from "../../types/curriculum";
import { ProgressRing } from "../common/ProgressRing";
import { useApp } from "../../context/AppContext";

interface ChapterCardProps {
  chapter: Chapter;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter }) => {
  const { getChapterProgress } = useApp();
  const cp = getChapterProgress(chapter);
  const isSoon = chapter.status === "soon";

  return (
    <Link
      to={`/${chapter.id}`}
      className={`group flex flex-col justify-between p-5 bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-sm hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-200 ${
        isSoon ? "opacity-60 pointer-events-auto" : ""
      }`}
    >
      <div>
        <div className="font-mono text-[10.5px] uppercase tracking-widest text-[var(--muted)]">
          Chapter {chapter.no}
        </div>
        <div className="font-serif font-bold text-xl text-[var(--ink)] mt-1 group-hover:text-[var(--accent)] transition-colors">
          {chapter.title}
        </div>
        <p className="font-serif text-sm text-[var(--muted)] mt-2 line-clamp-3 leading-relaxed">
          {chapter.blurb}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--line)]">
        <span className="font-mono text-xs text-[var(--muted)]">
          {isSoon ? "Coming soon" : `${chapter.lessons.length} lessons`}
        </span>

        {isSoon ? (
          <span className="font-mono text-[11px] text-[var(--muted)]">Locked</span>
        ) : (
          <div className="flex items-center gap-2">
            <ProgressRing size={26} pct={cp.pct}>
              {cp.pct}%
            </ProgressRing>
            <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
          </div>
        )}
      </div>
    </Link>
  );
};
