import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { HeroPlot } from "../../components/widgets/HeroPlot";
import { ChapterCard } from "../../components/curriculum/ChapterCard";
import { CHAPTERS, getFlatLessons } from "../../data/chapters";
import { useApp } from "../../context/AppContext";

export const HomePage: React.FC = () => {
  const { lastVisited } = useApp();

  useEffect(() => {
    document.title = "Mathesis — Interactive Calculus Atlas";
  }, []);

  const flat = getFlatLessons();
  const lastLessonItem = flat.find((l) => l.path === lastVisited);

  return (
    <div className="py-8 px-4 sm:px-8 md:px-12 max-w-[1240px]">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center pb-12 border-b border-[var(--line)]">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Interactive Course · Calculus Atlas
          </div>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--ink)] tracking-tight mt-3 mb-4 leading-[1.08]">
            Calculus, one idea at a time.
          </h1>
          <p className="font-serif text-lg text-[var(--muted)] leading-relaxed max-w-[48ch] mb-6">
            Start with how fast things change. Build up to how much accumulates. Every lesson is paired with interactive graphs you can push around and test live.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              to="/diff/derivative"
              className="h-11 px-6 rounded bg-[var(--accent)] text-[var(--accent-ink)] font-medium text-sm inline-flex items-center gap-2 hover:-translate-y-0.5 shadow-sm active:translate-y-0 transition-all"
            >
              <span>Start with Differentiation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/formulas"
              className="h-11 px-5 rounded border border-[var(--ink)] bg-[var(--panel)] text-[var(--ink)] font-medium text-sm inline-flex items-center gap-2 hover:-translate-y-0.5 hover:border-[var(--accent)] active:translate-y-0 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Formula Sheet</span>
            </Link>

            {lastLessonItem && (
              <Link
                to={`/${lastLessonItem.path}`}
                className="w-full sm:w-auto font-sans text-xs text-[var(--accent)] underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                Resume: {lastLessonItem.lesson.title}
              </Link>
            )}
          </div>
        </div>

        <div>
          <HeroPlot />
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="pt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif font-bold text-2xl text-[var(--ink)]">
              Curriculum Chapters
            </h2>
            <p className="font-serif text-sm text-[var(--muted)] mt-0.5">
              Follow sequentially from differentiation fundamentals to integral applications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 pb-16">
          {CHAPTERS.map((chap) => (
            <ChapterCard key={chap.id} chapter={chap} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
