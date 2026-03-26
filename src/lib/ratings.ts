import type { Rating, ForecastSlot, DayForecast } from "./types";

export function windQuality(dirDeg: number | null, speedMph: number | null): string {
  if (speedMph !== null && speedMph < 8) return "Clean (light wind)";
  if (dirDeg === null) return "Unknown";
  const d = ((dirDeg % 360) + 360) % 360;
  if (d >= 270 || d < 45) return "Clean (offshore)";
  if (d >= 45 && d <= 135) return "Choppy (onshore)";
  return "Mixed (side-shore)";
}

export function swellQuality(periodS: number | null): string {
  if (periodS === null) return "Unknown";
  if (periodS >= 12) return "Excellent groundswell";
  if (periodS >= 10) return "Good groundswell";
  if (periodS >= 8) return "Decent — mixed swell";
  if (periodS >= 6) return "Wind swell (choppy)";
  return "Short period — not great";
}

export function calcRating(heightFt: number | null, periodS: number | null, windDir: number | null, windSpeed: number | null): { rating: Rating; score: number } {
  if (heightFt === null || heightFt < 1.5) return { rating: "FLAT", score: 0 };

  let score = 0;
  if (heightFt >= 4) score += 3;
  else if (heightFt >= 2.5) score += 2;
  else if (heightFt >= 1.5) score += 1;

  if (periodS !== null) {
    if (periodS >= 10) score += 3;
    else if (periodS >= 8) score += 2;
    else if (periodS >= 6) score += 1;
  }

  const wq = windQuality(windDir, windSpeed);
  if (wq.includes("Clean")) score += 2;
  else if (wq.includes("Mixed")) score += 1;

  let rating: Rating;
  if (score >= 7) rating = "GOOD";
  else if (score >= 4) rating = "FAIR";
  else if (score >= 2) rating = "POOR";
  else rating = "FLAT";

  return { rating, score };
}

export function buildDayForecasts(slots: ForecastSlot[]): DayForecast[] {
  const byDay = new Map<string, ForecastSlot[]>();
  for (const s of slots) {
    const date = s.time.split("T")[0];
    if (!byDay.has(date)) byDay.set(date, []);
    byDay.get(date)!.push(s);
  }

  const days: DayForecast[] = [];
  for (const [date, daySlots] of byDay) {
    const best = daySlots.reduce((a, b) => a.ratingScore >= b.ratingScore ? a : b);
    days.push({ dayLabel: best.dayLabel, date, bestSlot: best });
  }
  return days;
}

export function findBestWindow(slots: ForecastSlot[]): ForecastSlot | null {
  if (slots.length === 0) return null;
  return slots.reduce((a, b) => {
    if (a.ratingScore > b.ratingScore) return a;
    if (a.ratingScore < b.ratingScore) return b;
    return new Date(a.time) <= new Date(b.time) ? a : b;
  });
}
