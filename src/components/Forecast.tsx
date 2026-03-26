import type { DayForecast, ForecastSlot, Rating } from "@/lib/types";
import { compassDir } from "@/lib/utils";
import { windQuality } from "@/lib/ratings";

const badgeClasses: Record<Rating, string> = {
  GOOD: "text-primary bg-primary-bg",
  FAIR: "text-[#b8860b] bg-accent-bg",
  POOR: "text-poor bg-poor-bg",
  FLAT: "text-flat bg-flat-bg",
};

export default function Forecast({
  days,
  bestWindow,
}: {
  days: DayForecast[];
  bestWindow: ForecastSlot | null;
}) {
  if (days.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col max-h-[320px]">
        <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold mb-3.5">
          7-Day Forecast
        </div>
        <div className="text-text-muted text-sm font-medium py-8 text-center">
          Forecast unavailable
        </div>
      </div>
    );
  }

  const bestDate = bestWindow?.time.split("T")[0] ?? null;

  return (
    <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col max-h-[320px]">
      <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold mb-3.5">
        7-Day Forecast
      </div>
      <div className="overflow-y-auto overflow-x-hidden flex-1 mx-[-8px] px-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-card-border [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-text-muted">
        {days.map((day) => {
          const s = day.bestSlot;
          const isBest = day.date === bestDate;
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
              className={`flex items-center py-3 border-b border-surface last:border-b-0 ${
                isBest
                  ? "bg-primary-bg rounded-[10px] mx-[-12px] px-3"
                  : ""
              }`}
            >
              <div
                className={`w-[42px] text-[13px] font-bold ${
                  isBest ? "text-primary" : "text-text-secondary"
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
                {isBest && (
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
  );
}
