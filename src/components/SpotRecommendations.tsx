import type { RankedSpot, ForecastSlot } from "@/lib/types";

export default function SpotRecommendations({
  spots,
  bestWindow,
}: {
  spots: RankedSpot[];
  bestWindow: ForecastSlot | null;
}) {
  const hasBestWindow = bestWindow !== null;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-baseline justify-between mt-1.5 mb-2.5">
        <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold">
          Spot Recommendations
        </div>
        {hasBestWindow && (
          <div className="text-xs text-primary font-bold bg-primary-bg px-3 py-1 rounded-full">
            For {bestWindow.dayLabel} {bestWindow.timeLabel}
          </div>
        )}
      </div>

      {/* Spot grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(155px,1fr))] gap-2.5">
        {spots.map((spot) => {
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
              {hasBestWindow && (
                <div className="text-xs text-text-secondary mt-2 leading-[1.4] font-medium">
                  {spot.conditionText}
                </div>
              )}
              {hasBestWindow && spot.tag && (
                <div className="inline-block text-[9px] px-2.5 py-0.5 rounded-full mt-2 bg-primary-bg text-primary font-bold tracking-[0.3px]">
                  {spot.tag}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
