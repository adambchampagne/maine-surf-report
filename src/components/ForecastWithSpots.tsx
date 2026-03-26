"use client";

import { useState } from "react";
import type { DayForecast, ForecastSlot, TidePoint, Rating } from "@/lib/types";
import { rankSpots } from "@/lib/spots";
import { compassDir } from "@/lib/utils";
import { windQuality } from "@/lib/ratings";

const badgeClasses: Record<Rating, string> = {
  GOOD: "text-primary bg-primary-bg",
  FAIR: "text-[#b8860b] bg-accent-bg",
  POOR: "text-poor bg-poor-bg",
  FLAT: "text-flat bg-flat-bg",
};

export default function ForecastWithSpots({
  days,
  bestWindow,
  tidePoints,
  children,
}: {
  days: DayForecast[];
  bestWindow: ForecastSlot | null;
  tidePoints: TidePoint[] | null;
  children?: React.ReactNode;
}) {
  const bestDate = bestWindow?.time.split("T")[0] ?? null;
  const [selectedDate, setSelectedDate] = useState<string>(bestDate ?? days[0]?.date ?? "");

  const selectedDay = days.find((d) => d.date === selectedDate);
  const selectedSlot = selectedDay?.bestSlot ?? bestWindow;
  const rankedSpots = rankSpots(selectedSlot, tidePoints);

  if (days.length === 0) {
    return (
      <>
        <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col max-h-[320px]">
          <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold mb-3.5">
            7-Day Forecast
          </div>
          <div className="text-text-muted text-sm font-medium py-8 text-center">
            Forecast unavailable
          </div>
        </div>
        <div className="mt-4">
          <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold">
            Spot Recommendations
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Two-column grid: forecast left, children (stats + tide) right */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
      {/* Forecast Panel */}
      <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col max-h-[320px]">
        <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold mb-3.5">
          7-Day Forecast
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-1 mx-[-8px] px-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-card-border [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-text-muted">
          {days.map((day) => {
            const s = day.bestSlot;
            const isSelected = day.date === selectedDate;
            const isBestDay = day.date === bestDate;
            const dir = compassDir(s.swellDirDeg);
            const windDir = compassDir(s.windDirDeg);
            const wq = windQuality(s.windDirDeg, s.windSpeedMph);
            const windDesc = wq.includes("Clean")
              ? wq.includes("offshore")
                ? "offshore, clean"
                : "light"
              : wq.includes("Choppy")
                ? "onshore, choppy"
                : "side-shore";

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`flex items-center py-3 border-b border-surface last:border-b-0 cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? "bg-primary-bg rounded-[10px] mx-[-12px] px-3"
                    : "hover:bg-surface/50 rounded-[10px] mx-[-12px] px-3"
                }`}
              >
                <div
                  className={`w-[42px] text-[13px] font-bold ${
                    isSelected ? "text-primary" : "text-text-secondary"
                  }`}
                >
                  {day.dayLabel}
                </div>
                <div
                  className={`text-[10px] font-bold text-center py-1 px-2.5 rounded-[6px] min-w-[52px] ${badgeClasses[s.rating]}`}
                >
                  {s.rating}
                </div>
                <div className="flex-1 ml-3.5">
                  <div className="text-[13px] text-text font-semibold">
                    {s.swellHeightFt}ft @ {s.swellPeriodS}s from {dir}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5 font-medium">
                    {s.windSpeedMph}mph {windDir} — {windDesc}
                  </div>
                  {isBestDay && (
                    <div className="text-primary text-[11px] mt-0.5 font-bold">
                      ★ Best day — {s.timeLabel.toLowerCase()} patrol
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Right column (stats + tide) passed as children */}
      {children}
      </div>

      {/* Spot Recommendations */}
      <div>
        <div className="flex items-baseline justify-between mt-1.5 mb-2.5">
          <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold">
            Spot Recommendations
          </div>
          {selectedSlot && (
            <div className="text-xs text-primary font-bold bg-primary-bg px-3 py-1 rounded-full">
              For {selectedSlot.dayLabel} {selectedSlot.timeLabel}
            </div>
          )}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(155px,1fr))] gap-2.5">
          {rankedSpots.map((spot) => {
            const isBest = spot.tag !== null;
            return (
              <div
                key={spot.name}
                className={`rounded-[14px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-[border-color] duration-150 cursor-default ${
                  isBest
                    ? "border border-primary bg-gradient-to-b from-primary-bg to-card"
                    : "bg-card border border-card-border hover:border-[#ccc5b5]"
                }`}
              >
                <div
                  className={`text-sm font-bold mb-0.5 ${
                    isBest ? "text-primary" : "text-text"
                  }`}
                >
                  {spot.name}
                </div>
                <div className="text-[11px] text-text-muted font-medium">
                  {spot.location} • {spot.driveTime}
                </div>
                <div className="text-xs text-text-secondary mt-2 leading-[1.4] font-medium">
                  {spot.conditionText}
                </div>
                {spot.tag && (
                  <div className="inline-block text-[9px] px-2.5 py-0.5 rounded-full mt-2 bg-primary-bg text-primary font-bold tracking-[0.3px]">
                    {spot.tag}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
