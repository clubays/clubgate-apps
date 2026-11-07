import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, CornerDownLeft } from "lucide-react";
import { CHAPTERS } from "../../data/chapters";
import { useApp } from "../../context/AppContext";

export const SearchPalette: React.FC = () => {
  const { searchOpen, setSearchOpen } = useApp();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Build searchable corpus
  const searchIndex = useMemo(() => {
    const list: {
      title: string;
      chapTitle: string;
      chapNo: number;
      path: string;
      headings: string[];
      rawText: string;
    }[] = [];

    for (const chap of CHAPTERS) {
      if (chap.status === "soon") continue;
      for (const les of chap.lessons) {
        let text = "";
        const headings: string[] = [];
        for (const b of les.blocks) {
          if (b.type === "h2" && b.x) headings.push(b.x);
          else if ((b.type === "p" || b.type === "callout") && b.x) {
            text += " " + b.x.replace(/\$[^$]+\$/g, "");
          }
        }
        list.push({
          title: les.title,
          chapTitle: chap.title,
          chapNo: chap.no,
          path: `${chap.id}/${les.id}`,
          headings,
          rawText: text,
        });
      }
    }
    return list;
  }, []);

  // Filter results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);

    return searchIndex
      .map((item) => {
        const tLower = item.title.toLowerCase();
        const hLower = item.headings.join(" ").toLowerCase();
        const bLower = item.rawText.toLowerCase();

        let allMatch = true;
        for (const term of terms) {
          if (!tLower.includes(term) && !hLower.includes(term) && !bLower.includes(term)) {
            allMatch = false;
            break;
          }
        }
        if (!allMatch) return null;

        let score = 0;
        for (const term of terms) {
          if (tLower.includes(term)) score += 5;
          if (hLower.includes(term)) score += 3;
          if (bLower.includes(term)) score += 1;
        }

        // Snippet
        let snippet = "";
        const idx = bLower.indexOf(terms[0]);
        if (idx >= 0) {
          const start = Math.max(0, idx - 35);
          const end = Math.min(item.rawText.length, idx + 80);
          snippet = (start > 0 ? "…" : "") + item.rawText.slice(start, end).trim() + (end < item.rawText.length ? "…" : "");
        } else {
          snippet = item.headings.join(" · ");
        }

        return { item, score, snippet };
      })
      .filter((r): r is { item: typeof searchIndex[0]; score: number; snippet: string } => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);
  }, [query, searchIndex]);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Global hotkeys (Cmd+K, Ctrl+K, '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
        return;
      }
      if (
        e.key === "/" &&
        !searchOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const handleSelect = (path: string) => {
    setSearchOpen(false);
    navigate(`/${path}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].item.path);
      }
    }
  };

  if (!searchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-[12vh] px-4"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-[620px] bg-[var(--panel)] border border-[var(--line)] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-[var(--line)] bg-[var(--panel)]">
          <Search className="w-5 h-5 text-[var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-[16px] text-[var(--ink)] placeholder-[var(--muted)] outline-none"
            placeholder="Search lessons, theorems, rules, and examples…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="font-mono text-[10px] bg-[var(--chip)] px-1.5 py-0.5 rounded text-[var(--muted)] border border-[var(--line)]">
              ESC
            </kbd>
          )}
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin">
          {!query.trim() ? (
            <div className="py-8 text-center text-sm font-serif text-[var(--muted)]">
              Type keywords to search calculus lessons, definitions, and theorems.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm font-serif text-[var(--muted)]">
              No matching lessons or formulas found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((res, i) => {
                const isSelected = i === selectedIndex;
                return (
                  <div
                    key={res.item.path}
                    onClick={() => handleSelect(res.item.path)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`flex flex-col gap-0.5 px-3.5 py-2.5 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[var(--chip)] shadow-[inset_2px_0_0_var(--accent)]"
                        : "hover:bg-[var(--chip)]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[var(--ink)]">
                        {res.item.title}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider">
                        Ch. {res.item.chapNo}
                      </span>
                    </div>
                    <div className="font-mono text-[10.5px] text-[var(--muted)]">
                      {res.item.chapTitle}
                    </div>
                    {res.snippet && (
                      <div className="font-serif text-[12.5px] text-[var(--muted)] line-clamp-1 italic mt-0.5">
                        {res.snippet}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-[var(--chip)]/50 border-t border-[var(--line)] flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
          <span>Navigate with ↑ and ↓</span>
          <span className="flex items-center gap-1">
            Press <CornerDownLeft className="w-3 h-3 inline" /> to open
          </span>
        </div>
      </div>
    </div>
  );
};
