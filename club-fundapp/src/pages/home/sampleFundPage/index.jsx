import { useState } from "react";
import { fundRecords2526, fundRecords2627 } from "@/data/fundData";
import FundPage from "./fundPage";

const SESSIONS = {
  "2026 - 2027": fundRecords2627,
  "2025 - 2026": fundRecords2526,
};

export const SampleFundPage = () => {
  const [session, setSession] = useState(() => {
    const s = new URLSearchParams(window.location.search).get("session");
    return s && SESSIONS[s] ? s : "2026 - 2027";
  });

  return (
    <div>
      <FundPage
        key={session}
        session={session}
        version={`0.1.3`}
        fundRecords={SESSIONS[session]}
      />

      <div className="flex items-center justify-center gap-3 bg-stone-100 pb-6 text-[10px] text-stone-400 print:hidden">
        <span>Session</span>
        {Object.keys(SESSIONS).map((s) => (
          <button
            key={s}
            onClick={() => setSession(s)}
            className={`transition hover:text-stone-700 ${
              session === s
                ? "font-medium text-stone-700 underline underline-offset-2"
                : ""
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
