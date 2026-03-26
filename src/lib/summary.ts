import type { Rating, ForecastSlot, DayForecast, RankedSpot } from "./types";
import { windQuality } from "./ratings";
import { compassDir } from "./utils";

export function generateSummary(
  currentRating: Rating,
  bestWindow: ForecastSlot | null,
  days: DayForecast[],
  topSpot: RankedSpot | null,
): string {
  if (!bestWindow) return "Check back shortly — data is temporarily unavailable.";

  const bw = bestWindow;
  const spotName = topSpot?.name ?? "your closest break";
  const swellStr = `${bw.swellHeightFt}ft @ ${bw.swellPeriodS}s`;
  const windDir = compassDir(bw.windDirDeg);
  const wq = windQuality(bw.windDirDeg, bw.windSpeedMph);
  const windStr = `${bw.windSpeedMph}mph ${windDir}`;

  switch (currentRating) {
    case "FLAT":
      return `Flat out there. ${swellStr} isn't doing anything. ${bw.dayLabel !== days[0]?.dayLabel ? `Best window looks like ${bw.dayLabel} ${bw.timeLabel.toLowerCase()} — ${swellStr} with ${windStr}.` : "Check back in a few days."}`;

    case "POOR": {
      const reason = wq.includes("onshore") || wq.includes("Choppy")
        ? `Onshore winds are making a mess of the ${swellStr} swell.`
        : `${swellStr} with short period — mostly chop.`;
      const nextGood = days.find(d => d.bestSlot.rating === "FAIR" || d.bestSlot.rating === "GOOD");
      const next = nextGood ? ` ${nextGood.dayLabel} ${nextGood.bestSlot.timeLabel.toLowerCase()} looks better — ${nextGood.bestSlot.swellHeightFt}ft with ${windQuality(nextGood.bestSlot.windDirDeg, nextGood.bestSlot.windSpeedMph).toLowerCase().replace(" (", ", ").replace(")", "")} winds.` : "";
      return `${reason}${next}`;
    }

    case "FAIR":
      return `${swellStr} from ${compassDir(bw.swellDirDeg)} with ${windStr} — ${wq.toLowerCase().replace(" (", ", ").replace(")", "")}. Hit ${spotName} ${bw.timeLabel === "Dawn" ? "at first light" : `around ${bw.timeLabel.toLowerCase()}`} ${bw.dayLabel !== days[0]?.dayLabel ? `on ${bw.dayLabel}` : ""}. ${bw.windSpeedMph && bw.windSpeedMph > 12 ? "Get there before the wind picks up." : ""}`.trim();

    case "GOOD":
      return `${swellStr} from ${compassDir(bw.swellDirDeg)} with clean ${windStr} offshore. ${spotName} is firing — ${bw.timeLabel === "Dawn" ? "dawn patrol" : bw.timeLabel.toLowerCase()} ${bw.dayLabel !== days[0]?.dayLabel ? `on ${bw.dayLabel}` : ""}. Go.`.trim();
  }
}
