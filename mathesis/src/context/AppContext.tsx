import React, { createContext, useContext, useEffect, useState } from "react";
import { Chapter, FlatLessonItem } from "../types/curriculum";
import { CHAPTERS, getFlatLessons } from "../data/chapters";

interface AppContextType {
  theme: "paper" | "board";
  toggleTheme: () => void;
  done: Record<string, boolean>;
  toggleLessonDone: (path: string) => boolean;
  isLessonDone: (path: string) => boolean;
  openChapters: Record<string, boolean>;
  toggleChapterOpen: (chapId: string) => void;
  lastVisited: string;
  setLastVisited: (path: string) => void;
  overallProgress: { pct: number; completed: number; total: number };
  getChapterProgress: (chap: Chapter) => { pct: number; done: number; total: number };
  toastMessage: string | null;
  showToast: (msg: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const STORAGE_KEY = "mathesis:v2";

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"paper" | "board">(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) return parsed.theme;
      }
      if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "board";
      }
    } catch (_) {}
    return "paper";
  });

  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.done || {};
      }
    } catch (_) {}
    return {};
  });

  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.open || { diff: true };
      }
    } catch (_) {}
    return { diff: true };
  });

  const [lastVisited, setLastVisitedState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.last || "diff/derivative";
      }
    } catch (_) {}
    return "diff/derivative";
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync theme to <html> data-theme attribute
  useEffect(() => {
    if (theme === "board") {
      document.documentElement.setAttribute("data-theme", "board");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    // trigger plot redraw
    window.dispatchEvent(new Event("themechange"));
  }, [theme]);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme,
          done,
          open: openChapters,
          last: lastVisited,
        }),
      );
    } catch (_) {}
  }, [theme, done, openChapters, lastVisited]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "paper" ? "board" : "paper"));
  };

  const toggleLessonDone = (path: string): boolean => {
    const nextState = !done[path];
    setDone((prev) => {
      const copy = { ...prev };
      if (nextState) copy[path] = true;
      else delete copy[path];
      return copy;
    });
    return nextState;
  };

  const isLessonDone = (path: string) => !!done[path];

  const toggleChapterOpen = (chapId: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapId]: !prev[chapId],
    }));
  };

  const setLastVisited = (path: string) => {
    setLastVisitedState(path);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 1800);
  };

  // Progress calculations
  const readyLessons = getFlatLessons();
  let doneCount = 0;
  for (const item of readyLessons) {
    if (done[item.path]) doneCount++;
  }
  const overallPct = readyLessons.length > 0 ? Math.round((doneCount / readyLessons.length) * 100) : 0;
  const overallProgress = {
    pct: overallPct,
    completed: doneCount,
    total: readyLessons.length,
  };

  const getChapterProgress = (chap: Chapter) => {
    if (chap.status === "soon") return { pct: 0, done: 0, total: 0 };
    let cDone = 0;
    for (const l of chap.lessons) {
      if (done[`${chap.id}/${l.id}`]) cDone++;
    }
    const pct = chap.lessons.length > 0 ? Math.round((cDone / chap.lessons.length) * 100) : 0;
    return { pct, done: cDone, total: chap.lessons.length };
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        done,
        toggleLessonDone,
        isLessonDone,
        openChapters,
        toggleChapterOpen,
        lastVisited,
        setLastVisited,
        overallProgress,
        getChapterProgress,
        toastMessage,
        showToast,
        searchOpen,
        setSearchOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
