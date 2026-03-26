import type { Rating, BuoyData, ForecastSlot, RankedSpot } from "@/lib/types";
import { compassDir } from "@/lib/utils";
import { windQuality } from "@/lib/ratings";

const ratingColor: Record<Rating, string> = {
  GOOD: "text-primary",
  FAIR: "text-accent",
  POOR: "text-poor",
  FLAT: "text-flat",
};

export default function RatingHero({
  rating,
  buoy,
  bestWindow,
  topSpot,
}: {
  rating: Rating;
  buoy: BuoyData | null;
  bestWindow: ForecastSlot | null;
  topSpot: RankedSpot | null;
}) {
  const hasData = buoy || bestWindow;

  // Build detail line from buoy or bestWindow
  let detail: string | null = null;
  if (buoy && buoy.waveHeightFt !== null) {
    const dir = compassDir(buoy.waveDirDeg);
    const period = buoy.dominantPeriodS ?? "?";
    const windDir = compassDir(buoy.windDirDeg);
    const wq = windQuality(buoy.windDirDeg, buoy.windSpeedMph);
    const windLabel = wq.includes("offshore")
      ? "offshore winds"
      : wq.includes("onshore")
        ? "onshore winds"
        : "winds";
    detail = `${buoy.waveHeightFt}ft @ ${period}s from ${dir} • ${windDir} ${windLabel}`;
  } else if (bestWindow) {
    const dir = compassDir(bestWindow.swellDirDeg);
    const period = bestWindow.swellPeriodS ?? "?";
    const windDir = compassDir(bestWindow.windDirDeg);
    const wq = windQuality(bestWindow.windDirDeg, bestWindow.windSpeedMph);
    const windLabel = wq.includes("offshore")
      ? "offshore winds"
      : wq.includes("onshore")
        ? "onshore winds"
        : "winds";
    detail = `${bestWindow.swellHeightFt}ft @ ${period}s from ${dir} • ${windDir} ${windLabel}`;
  }

  // Best window pill
  let bestPill: string | null = null;
  if (bestWindow && topSpot) {
    bestPill = `★ Best window: ${bestWindow.dayLabel} ${bestWindow.timeLabel.toLowerCase()} at ${topSpot.name}`;
  } else if (bestWindow) {
    bestPill = `★ Best window: ${bestWindow.dayLabel} ${bestWindow.timeLabel.toLowerCase()}`;
  }

  return (
    <div className="bg-card border border-card-border rounded-[14px] p-8 text-center mb-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      {hasData ? (
        <>
          <div
            className={`text-[52px] font-bold tracking-[2px] ${ratingColor[rating]}`}
          >
            {rating}
          </div>
          {detail && (
            <div className="text-text-secondary text-[15px] mt-2 font-medium">
              {detail}
            </div>
          )}
          {bestPill && (
            <div className="inline-block mt-2.5 px-4 py-1.5 bg-primary-bg rounded-full text-primary text-[13px] font-bold">
              {bestPill}
            </div>
          )}
        </>
      ) : (
        <div className="text-text-muted text-[15px] font-medium py-4">
          Unable to load conditions
        </div>
      )}
    </div>
  );
}
