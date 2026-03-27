"use client";

import { useState, useEffect } from "react";
import { wetsuitRec } from "@/lib/utils";

export default function Summary({
  text,
  waterTempF,
  conditions,
}: {
  text: string;
  waterTempF: number | null;
  conditions: string;
}) {
  const [personaText, setPersonaText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch Old Salt summary on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conditions, personaId: "old-salt" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.text) setPersonaText(data.text);
      })
      .catch(() => {
        // Fallback to rule-based summary on error
        setPersonaText("");
      })
      .finally(() => setLoading(false));
  }, [conditions]);

  const displayText = personaText || text;

  return (
    <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] mb-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="text-primary text-[10px] uppercase tracking-[1.5px] font-bold mb-2">
        Today&apos;s Call
      </div>

      <div className="text-text-secondary text-sm leading-[1.7] font-medium">
        {loading ? (
          <div className="flex items-center gap-2 py-1">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-text-muted text-xs">
              Getting the vibe...
            </span>
          </div>
        ) : (
          displayText
        )}
      </div>

      {waterTempF !== null && (
        <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between">
          <span className="text-text-muted text-[10px] uppercase tracking-[1px] font-bold">
            Wetsuit
          </span>
          <span className="text-text text-[13px] font-semibold">
            {wetsuitRec(waterTempF)} · {waterTempF}°F
          </span>
        </div>
      )}
    </div>
  );
}
