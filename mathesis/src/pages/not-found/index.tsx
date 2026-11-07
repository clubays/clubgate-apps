import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "404 Not Found — Mathesis";
  }, []);

  return (
    <div className="py-24 px-6 text-center max-w-[540px] mx-auto">
      <div className="w-12 h-12 rounded-full border border-[var(--line)] bg-[var(--panel)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)]">
        <Compass className="w-6 h-6 animate-spin duration-1000" />
      </div>
      <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
        Error 404
      </div>
      <h1 className="font-serif font-bold text-3xl text-[var(--ink)] mt-2 mb-3">
        Nothing at this address
      </h1>
      <p className="font-serif text-[17px] text-[var(--muted)] leading-relaxed mb-6">
        The mathematical coordinates you entered do not exist on this calculus atlas.
      </p>
      <Link
        to="/"
        className="h-10 px-5 rounded bg-[var(--accent)] text-[var(--accent-ink)] text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        Back to course start
      </Link>
    </div>
  );
};

export default NotFoundPage;
