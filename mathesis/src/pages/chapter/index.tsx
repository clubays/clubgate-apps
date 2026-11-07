import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Check, Lock, BookOpen } from "lucide-react";
import { getChapterById } from "../../data/chapters";
import { useApp } from "../../context/AppContext";
import { ProgressRing } from "../../components/common/ProgressRing";

export const ChapterPage: React.FC = () => {
  const { chapterId } = useParams();
  const { isLessonDone, getChapterProgress } = useApp();

  const chapter = getChapterById(chapterId || "");

  useEffect(() => {
    if (chapter) {
      document.title = `${chapter.title} — Mathesis`;
    }
  }, [chapter]);

  if (!chapter) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif font-bold text-3xl">Chapter Not Found</h1>
        <Link to="/" className="mt-4 inline-block text-[var(--accent)] underline">
          Return to course home
        </Link>
      </div>
    );
  }

  const cp = getChapterProgress(chapter);
  const isSoon = chapter.status === "soon";

  return (
    <div className="py-8 px-4 sm:px-8 md:px-12 max-w-[840px]">
      <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
        Chapter {chapter.no} Overview
      </div>
      <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)] mt-1 mb-3">
        {chapter.title}
      </h1>
      <p className="font-serif text-[18px] text-[var(--muted)] leading-relaxed mb-8">
        {chapter.blurb}
      </p>

      {isSoon ? (
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--c-dd)] rounded-r-lg">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--c-dd)] font-bold mb-2">
            <Lock className="w-4 h-4" /> Coming Soon
          </div>
          <div className="font-serif text-[17px] leading-relaxed text-[var(--ink)]">
            This advanced module is currently being finalized. Interactive diagrams, derivations, and practice sets will become available in the next curriculum update.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-2 border-b border-[var(--line)] mb-2 font-mono text-xs text-[var(--muted)]">
            <span>{chapter.lessons.length} Lessons</span>
            <span>Progress: {cp.pct}%</span>
          </div>

          {chapter.lessons.map((lesson, idx) => {
            const path = `${chapter.id}/${lesson.id}`;
            const isDone = isLessonDone(path);
            const lessonNo = `${chapter.no}.${lesson.no || idx + 1}`;

            return (
              <Link
                key={lesson.id}
                to={`/${path}`}
                className="group flex items-center justify-between p-4 bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-xs hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-xs font-semibold text-[var(--muted)] w-8 shrink-0">
                    {lessonNo}
                  </span>
                  <div className="min-w-0">
                    <div className="font-serif font-bold text-lg text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {lesson.title}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--muted)] mt-0.5">
                      {lesson.minutes} min read · {lesson.level} · Interactive
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-4 flex items-center gap-3">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--c-d)]/10 text-[var(--c-d)] font-mono text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChapterPage;
