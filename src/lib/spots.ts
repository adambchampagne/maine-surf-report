import type { ForecastSlot, RankedSpot, SpotMeta, TidePoint } from "./types";
import { SPOTS } from "@/data/spots";

function angleDiff(a: number, b: number): number {
  const diff = Math.abs(((a - b + 180) % 360) - 180);
  return diff;
}

function spotWindQuality(windDir: number | null, windSpeed: number | null, spot: SpotMeta): number {
  if (windSpeed !== null && windSpeed < 8) return 2;
  if (windDir === null) return 1;
  const d = ((windDir % 360) + 360) % 360;
  const [lo, hi] = spot.bestWindDirRange;
  const inRange = lo <= hi ? (d >= lo && d <= hi) : (d >= lo || d <= hi);
  if (inRange) return 2;
  const midOffshore = lo <= hi ? (lo + hi) / 2 : ((lo + hi + 360) / 2) % 360;
  const diff = angleDiff(d, midOffshore);
  if (diff < 90) return 1;
  return 0;
}

function getTideState(tidePoints: TidePoint[]): string {
  const now = new Date();
  // Find the two tide points bracketing "now"
  for (let i = 0; i < tidePoints.length - 1; i++) {
    const curr = new Date(tidePoints[i].time);
    const next = new Date(tidePoints[i + 1].time);
    if (now >= curr && now < next) {
      const progress = (now.getTime() - curr.getTime()) / (next.getTime() - curr.getTime());
      const rising = tidePoints[i].type === "L"; // rising if last point was low
      if (progress < 0.3) return rising ? "Low rising" : "High falling";
      if (progress > 0.7) return rising ? "High rising" : "Low falling";
      return rising ? "Mid rising" : "Mid falling";
    }
  }
  return "Mid";
}

export function rankSpots(bestSlot: ForecastSlot | null, tidePoints?: TidePoint[] | null): RankedSpot[] {
  const tideState = tidePoints?.length ? getTideState(tidePoints) : "Mid";

  return SPOTS.map((spot) => {
    if (!bestSlot || bestSlot.swellHeightFt === null) {
      return { ...spot, score: 0, rideable: false, conditionText: "No forecast data available", tag: null };
    }

    const rideable = bestSlot.swellHeightFt >= spot.minRideableFt;

    // Swell direction match (0-3)
    let swellScore = 0;
    if (bestSlot.swellDirDeg !== null) {
      const diff = angleDiff(bestSlot.swellDirDeg, spot.bestSwellDirDeg);
      if (diff <= 22) swellScore = 3;
      else if (diff <= 45) swellScore = 2;
      else if (diff <= 67) swellScore = 1;
    }

    // Wind quality (0-2)
    const windScore = spotWindQuality(bestSlot.windDirDeg, bestSlot.windSpeedMph, spot);

    // Tide match (0-1)
    const tideScore = tideState.toLowerCase().includes(spot.bestTide.toLowerCase().split(" ")[0]) ? 1 : 0;

    const score = swellScore + windScore + tideScore;

    // Build condition text with actual data
    const ht = bestSlot.swellHeightFt;
    const per = bestSlot.swellPeriodS;
    let conditionText: string;
    if (!rideable) {
      conditionText = `Needs ${spot.minRideableFt}ft+ to break properly — not quite enough`;
    } else if (score >= 4) {
      conditionText = `${ht}ft @ ${per}s — great match for swell direction and wind`;
    } else if (score >= 2) {
      conditionText = `${ht}ft @ ${per}s — rideable, decent conditions`;
    } else {
      conditionText = `${ht}ft @ ${per}s — rideable but swell/wind direction not ideal`;
    }

    return { ...spot, score, rideable, conditionText, tag: null };
  }).sort((a, b) => {
    if (a.rideable !== b.rideable) return a.rideable ? -1 : 1;
    if (a.score !== b.score) return b.score - a.score;
    return a.driveMinutes - b.driveMinutes;
  }).map((spot, i, sorted) => {
    // Only tag the top spot as Best Pick, and a close runner-up as Close & Clean
    let tag: string | null = null;
    if (i === 0 && spot.rideable) {
      tag = "★ Best Pick";
    } else if (i === 1 && spot.rideable && spot.driveMinutes <= 20 && spot.score >= sorted[0].score - 1) {
      tag = "Close & Clean";
    }
    return { ...spot, tag };
  });
}
