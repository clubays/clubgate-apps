import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { getLessonById, getFlatLessons } from "../../data/chapters";
import { BlockRenderer } from "../../components/curriculum/BlockRenderer";
import { useApp } from "../../context/AppContext";

export const LessonPage: React.FC = () => {
  const { chapterId, lessonId } = useParams();
  const { toggleLessonDone, isLessonDone, setLastVisited } = useApp();

  const data = getLessonById(chapterId || "", lessonId || "");
  const path = `${chapterId}/${lessonId}`;
  const isDone = isLessonDone(path);

  const prevPathRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (data?.lesson) {
      document.title = `${data.lesson.title} — Mathesis`;
      setLastVisited(path);

      // Only scroll to top when navigating to a new lesson, not during inside updates
      if (prevPathRef.current !== path) {
        prevPathRef.current = path;
        window.scrollTo(0, 0);
      }
    }
  }, [path, data?.lesson?.title, setLastVisited]);

  // Linear previous and next lesson links
  const flat = getFlatLessons();
  const currentIndex = flat.findIndex((item) => item.path === path);
  const prevLesson = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;

  // On page Table of Contents (from h2 blocks)
  const tocItems = useMemo(() => {
    if (!data?.lesson) return [];
    return data.lesson.blocks
      .map((b, idx) => (b.type === "h2" ? { title: b.x || "", id: `sec-${idx}` } : null))
      .filter((item): item is { title: string; id: string } => item !== null);
  }, [data]);

  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  useEffect(() => {
    if (tocItems.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );

    tocItems.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const handleToggleComplete = () => {
    const justCompleted = toggleLessonDone(path);
    if (justCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#c2371d", "#1d5fa8", "#2a7f62", "#b7791f"],
        });
      } catch (_) {}
    }
  };

  if (!data) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif font-bold text-3xl">Lesson Not Found</h1>
        <Link to="/" className="mt-4 inline-block text-[var(--accent)] underline">
          Return to course home
        </Link>
      </div>
    );
  }

  const { chapter, lesson } = data;
  const lessonNumber = `${chapter.no}.${lesson.no || chapter.lessons.indexOf(lesson) + 1}`;

  return (
    <div className="w-full flex justify-between">
      {/* Main Lesson Column */}
      <article className="flex-1 min-w-0 py-8 px-4 sm:px-8 md:px-12 max-w-[800px]">
        {/* Eyebrow & Title */}
        <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
          Chapter {chapter.no} · Lesson {lessonNumber}
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[44px] text-[var(--ink)] leading-[1.12] tracking-tight mt-2 mb-3.5">
          {lesson.title}
        </h1>

        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="font-mono text-[11px] px-2.5 py-1 rounded border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)]">
            {lesson.minutes} min read
          </span>
          <span className="font-mono text-[11px] px-2.5 py-1 rounded border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)]">
            {lesson.level}
          </span>
          <span className="font-mono text-[11px] px-2.5 py-1 rounded border border-[var(--accent)]/40 bg-[var(--panel)] text-[var(--accent)] font-medium">
            Interactive Figures
          </span>
        </div>

        {/* Content Blocks */}
        <div className="body-text">
          {lesson.blocks.map((block, idx) => (
            <BlockRenderer key={idx} block={block} index={idx} />
          ))}
        </div>

        {/* Complete Lesson Action */}
        <div className="mt-12 pt-6 border-t border-[var(--line)]">
          <button
            onClick={handleToggleComplete}
            className={`w-full h-12 rounded-lg font-serif font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200 border ${
              isDone
                ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] shadow-md"
                : "bg-[var(--panel)] text-[var(--ink)] border-[var(--ink)] hover:border-[var(--accent)] hover:-translate-y-0.5"
            }`}
          >
            <Check className="w-5 h-5" />
            <span>{isDone ? "Completed — Click to undo" : "Mark lesson complete"}</span>
          </button>
        </div>

        {/* Prev / Next Pagination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {prevLesson ? (
            <Link
              to={`/${prevLesson.path}`}
              className="flex items-center gap-3 p-4 rounded-lg bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-0.5 transition-all shrink-0" />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Previous Lesson
                </div>
                <div className="font-serif font-bold text-base text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {prevLesson.lesson.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              to={`/${nextLesson.path}`}
              className="flex items-center justify-end text-right gap-3 p-4 rounded-lg bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all group sm:col-start-2"
            >
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Next Lesson
                </div>
                <div className="font-serif font-bold text-base text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {nextLesson.lesson.title}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </article>

      {/* Right Rail Table of Contents */}
      {tocItems.length > 0 && (
        <aside className="hidden xl:block w-56 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-8 pr-6 shrink-0">
          <div className="font-mono text-[10.5px] uppercase tracking-widest text-[var(--muted)] font-semibold mb-3">
            On this page
          </div>
          <nav className="flex flex-col">
            {tocItems.map((item) => {
              const isActive = activeHeadingId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(item.id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`text-[12.5px] py-1.5 pl-3 border-l text-left transition-all duration-150 leading-snug cursor-pointer ${
                    isActive
                      ? "border-[var(--accent)] text-[var(--ink)] font-semibold -ml-[1px]"
                      : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
          </nav>
        </aside>
      )}
    </div>
  );
};

export default LessonPage;
