import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { ChevronRight, Lock, Check } from "lucide-react";
import { CHAPTERS } from "../../data/chapters";
import { useApp } from "../../context/AppContext";
import { ProgressRing } from "../common/ProgressRing";

interface SidebarProps {
  onLinkClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLinkClick }) => {
  const { chapterId, lessonId } = useParams();
  const { openChapters, toggleChapterOpen, getChapterProgress, isLessonDone } = useApp();

  return (
    <aside className="w-full h-full overflow-y-auto py-4 px-3 md:pl-5 md:pr-3 scrollbar-thin">
      <div className="flex flex-col gap-1.5 pb-8">
        {CHAPTERS.map((chap) => {
          const isSoon = chap.status === "soon";
          const isOpen = !!openChapters[chap.id] || chapterId === chap.id;
          const cp = getChapterProgress(chap);
          const totalMinutes = chap.lessons.reduce((acc, l) => acc + (l.minutes || 0), 0);

          return (
            <div key={chap.id} className={`rounded transition-opacity ${isSoon ? "opacity-60" : ""}`}>
              <button
                onClick={() => {
                  if (isSoon) return;
                  toggleChapterOpen(chap.id);
                }}
                className="w-full flex items-center gap-3 p-2 rounded text-left hover:bg-[var(--chip)] transition-colors group"
                aria-expanded={isOpen}
              >
                <ProgressRing size={22} pct={cp.pct} strokeWidth={1.8}>
                  {chap.no}
                </ProgressRing>

                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-[var(--ink)] flex items-center gap-1.5 truncate">
                    <span className="truncate">{chap.title}</span>
                    {isSoon && <Lock className="w-3 h-3 text-[var(--muted)] shrink-0" />}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                    {isSoon ? "Coming soon" : `${chap.lessons.length} lessons · ${totalMinutes} min`}
                  </div>
                </div>

                {!isSoon && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-90 text-[var(--ink)]" : ""
                    }`}
                  />
                )}
              </button>

              {!isSoon && isOpen && (
                <div className="flex flex-col gap-0.5 mt-1 ml-4 pl-3 border-l border-[var(--line)]">
                  {chap.lessons.map((lesson, idx) => {
                    const path = `${chap.id}/${lesson.id}`;
                    const isDone = isLessonDone(path);
                    const lessonNo = `${chap.no}.${lesson.no || idx + 1}`;

                    return (
                      <NavLink
                        key={lesson.id}
                        to={`/${path}`}
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 py-1.5 px-2.5 rounded text-[13px] leading-snug transition-colors ${
                            isActive
                              ? "bg-[var(--accent-tint)] text-[var(--ink)] font-medium shadow-[inset_2px_0_0_var(--accent)]"
                              : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--chip)]"
                          }`
                        }
                      >
                        <span className="font-mono text-[10.5px] w-6 shrink-0 opacity-70">
                          {lessonNo}
                        </span>
                        <span className="flex-1 truncate">{lesson.title}</span>
                        {isDone && (
                          <Check className="w-3.5 h-3.5 text-[var(--c-d)] shrink-0 ml-auto" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
