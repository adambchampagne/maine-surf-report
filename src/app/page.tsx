import { fetchMarineForecast, fetchWindForecast, fetchBuoyData, fetchTidePoints, fetchHourlyTide } from "@/lib/api";
import { calcRating, buildDayForecasts, findBestWindow } from "@/lib/ratings";
import { rankSpots } from "@/lib/spots";
import { generateSummary } from "@/lib/summary";
import Header from "@/components/Header";
import RatingHero from "@/components/RatingHero";
import Summary from "@/components/Summary";
import ForecastWithSpots from "@/components/ForecastWithSpots";
import CurrentConditions from "@/components/CurrentConditions";
import TideChart from "@/components/TideChart";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [marineResult, windResult, buoyResult, tideResult, hourlyTideResult] = await Promise.allSettled([
    fetchMarineForecast(),
    fetchWindForecast(),
    fetchBuoyData(),
    fetchTidePoints(),
    fetchHourlyTide(),
  ]);

  const marineSlots = marineResult.status === "fulfilled" ? marineResult.value : null;
  const windMap = windResult.status === "fulfilled" ? windResult.value : null;
  const buoy = buoyResult.status === "fulfilled" ? buoyResult.value : null;
  const tidePoints = tideResult.status === "fulfilled" ? tideResult.value : null;
  const hourlyTide = hourlyTideResult.status === "fulfilled" ? hourlyTideResult.value : null;

  // Merge wind into marine slots and calculate ratings
  const slots = (marineSlots ?? []).map(slot => {
    const wind = windMap?.get(slot.time);
    const s = {
      ...slot,
      windSpeedMph: wind?.speed ?? null,
      windDirDeg: wind?.dir ?? null,
      windGustsMph: wind?.gusts ?? null,
    };
    const { rating, score } = calcRating(s.swellHeightFt, s.swellPeriodS, s.windDirDeg, s.windSpeedMph);
    return { ...s, rating, ratingScore: score };
  });

  const days = buildDayForecasts(slots);
  const bestWindow = findBestWindow(slots);

  // Current rating from buoy or best current slot
  const currentCalc = buoy
    ? calcRating(buoy.waveHeightFt, buoy.dominantPeriodS, buoy.windDirDeg, buoy.windSpeedMph)
    : (slots[0] ? { rating: slots[0].rating, score: slots[0].ratingScore } : { rating: "FLAT" as const, score: 0 });

  const rankedSpots = rankSpots(bestWindow, tidePoints);
  const summaryText = generateSummary(currentCalc.rating, bestWindow, days, rankedSpots[0] ?? null);
  const updatedAt = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <>
      <Header updatedAt={updatedAt} />
      <RatingHero
        rating={currentCalc.rating}
        buoy={buoy}
        bestWindow={bestWindow}
        topSpot={rankedSpots[0] ?? null}
      />
      <Summary text={summaryText} waterTempF={buoy?.waterTempF ?? null} />
      <ForecastWithSpots days={days} bestWindow={bestWindow} tidePoints={tidePoints}>
        <div className="flex flex-col gap-3.5">
          <CurrentConditions buoy={buoy} />
          <TideChart tidePoints={tidePoints} hourlyTide={hourlyTide} />
        </div>
      </ForecastWithSpots>

      <footer className="text-center py-6 mt-2 text-[11px] text-text-muted leading-relaxed font-medium">
        Data: NDBC Buoy 44007 · Open-Meteo Marine · NOAA CO-OPS<br />
        Forecast updates on page refresh
      </footer>
    </>
  );
}
