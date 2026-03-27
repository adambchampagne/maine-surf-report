"use client";

import { useState, useEffect } from "react";
import { wetsuitRec } from "@/lib/utils";
import { PERSONAS } from "@/data/personas";

export default function Summary({
  text,
  waterTempF,
  conditions,
}: {
  text: string;
  waterTempF: number | null;
  conditions: string;
}) {
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [personaText, setPersonaText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Restore persona selection from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("surf-persona");
    if (saved) setSelectedPersona(saved);
  }, []);

  // Fetch persona summary when selection changes
  useEffect(() => {
    if (!selectedPersona) {
      setPersonaText("");
      return;
    }

    localStorage.setItem("surf-persona", selectedPersona);
    setLoading(true);

    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conditions, personaId: selectedPersona }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.text) setPersonaText(data.text);
        else setPersonaText("");
      })
      .catch(() => setPersonaText(""))
      .finally(() => setLoading(false));
  }, [selectedPersona, conditions]);

  const handleChange = (id: string) => {
    if (id === "") {
      localStorage.removeItem("surf-persona");
      setSelectedPersona("");
      setPersonaText("");
    } else {
      setSelectedPersona(id);
    }
  };

  const displayText = selectedPersona && personaText ? personaText : text;

  return (
    <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] mb-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      {/* Header row with label and persona selector */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-primary text-[10px] uppercase tracking-[1.5px] font-bold">
          Today&apos;s Call
        </div>
        <div className="flex items-center gap-1.5">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                handleChange(selectedPersona === p.id ? "" : p.id)
              }
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors duration-150 cursor-pointer ${
                selectedPersona === p.id
                  ? "bg-primary text-white"
                  : "bg-surface text-text-muted hover:bg-card-border hover:text-text-secondary"
              }`}
              title={p.description}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary text */}
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

      {/* Wetsuit line */}
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
