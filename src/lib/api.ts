import type { BuoyData, ForecastSlot, TidePoint, HourlyTide } from "./types";
import { metersToFeet, todayYYYYMMDD, dayAbbr } from "./utils";

const TIMEOUT = 10_000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// --- Open-Meteo Marine (swell forecast) ---
export async function fetchMarineForecast(): Promise<ForecastSlot[] | null> {
  try {
    const url = "https://marine-api.open-meteo.com/v1/marine?latitude=43.50&longitude=-70.30&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&forecast_days=7&timezone=America%2FNew_York";
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    if (!data.hourly) return null;

    const slots: ForecastSlot[] = [];
    const times: string[] = data.hourly.time;
    const heights = data.hourly.swell_wave_height ?? data.hourly.wave_height ?? [];
    const periods = data.hourly.swell_wave_period ?? data.hourly.wave_period ?? [];
    const dirs = data.hourly.swell_wave_direction ?? data.hourly.wave_direction ?? [];

    for (let i = 0; i < times.length; i++) {
      const dt = new Date(times[i]);
      const hour = dt.getHours();
      if (hour !== 6 && hour !== 12 && hour !== 15) continue;

      const timeLabel = hour === 6 ? "Dawn" : hour === 12 ? "Midday" : "Afternoon";
      slots.push({
        time: times[i],
        dayLabel: dayAbbr(times[i]),
        timeLabel,
        swellHeightFt: metersToFeet(heights[i]),
        swellPeriodS: periods[i] ?? null,
        swellDirDeg: dirs[i] ?? null,
        windSpeedMph: null, // filled by wind fetch
        windDirDeg: null,
        windGustsMph: null,
        rating: "FLAT",
        ratingScore: 0,
      });
    }
    return slots;
  } catch {
    return null;
  }
}

// --- Open-Meteo Weather (wind forecast) ---
export async function fetchWindForecast(): Promise<Map<string, { speed: number; dir: number; gusts: number }> | null> {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=43.50&longitude=-70.30&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&forecast_days=7&timezone=America%2FNew_York&wind_speed_unit=mph";
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    if (!data.hourly) return null;

    const map = new Map<string, { speed: number; dir: number; gusts: number }>();
    const times: string[] = data.hourly.time;
    const speeds = data.hourly.wind_speed_10m ?? [];
    const dirs = data.hourly.wind_direction_10m ?? [];
    const gusts = data.hourly.wind_gusts_10m ?? [];

    for (let i = 0; i < times.length; i++) {
      map.set(times[i], {
        speed: speeds[i] ?? 0,
        dir: dirs[i] ?? 0,
        gusts: gusts[i] ?? 0,
      });
    }
    return map;
  } catch {
    return null;
  }
}

// --- NDBC Buoy 44007 ---
export async function fetchBuoyData(): Promise<BuoyData | null> {
  try {
    const res = await fetchWithTimeout("https://www.ndbc.noaa.gov/data/realtime2/44007.txt");
    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 3) return null;

    const headers = lines[0].replace(/#/g, "").trim().split(/\s+/);
    const vals = lines[2].trim().split(/\s+/);
    if (vals.length < headers.length) return null;

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i]; });

    const parse = (key: string, invalid: string[]): number | null => {
      const v = row[key];
      if (!v || invalid.includes(v)) return null;
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    };

    const wvht = parse("WVHT", ["MM", "99.00"]);
    const wtmp = parse("WTMP", ["MM", "999.0"]);
    const atmp = parse("ATMP", ["MM", "999.0"]);

    return {
      waveHeightFt: wvht !== null ? Math.round(wvht * 3.28084 * 10) / 10 : null,
      dominantPeriodS: parse("DPD", ["MM", "99.00"]),
      waveDirDeg: parse("MWD", ["MM", "999"]),
      windSpeedMph: (() => {
        const mps = parse("WSPD", ["MM", "99.0"]);
        return mps !== null ? Math.round(mps * 2.237 * 10) / 10 : null;
      })(),
      windDirDeg: parse("WDIR", ["MM", "999"]),
      waterTempF: wtmp !== null ? Math.round((wtmp * 9/5 + 32) * 10) / 10 : null,
      airTempF: atmp !== null ? Math.round((atmp * 9/5 + 32) * 10) / 10 : null,
      timestamp: `${row["YY"]}-${row["MM"]}-${row["DD"]} ${row["hh"]}:${row["mm"]} UTC`,
    };
  } catch {
    return null;
  }
}

// --- NOAA CO-OPS Tides ---
export async function fetchTidePoints(): Promise<TidePoint[] | null> {
  try {
    const today = todayYYYYMMDD();
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${today}&range=168&station=8418150&product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&interval=hilo&format=json`;
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    if (!data.predictions) return null;

    return data.predictions.map((p: { t: string; v: string; type: string }) => ({
      time: p.t,
      height: parseFloat(p.v),
      type: p.type as "H" | "L",
    }));
  } catch {
    return null;
  }
}

export async function fetchHourlyTide(): Promise<HourlyTide[] | null> {
  try {
    const today = todayYYYYMMDD();
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${today}&range=24&station=8418150&product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&interval=h&format=json`;
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    if (!data.predictions) return null;

    return data.predictions.map((p: { t: string; v: string }) => ({
      time: p.t,
      height: parseFloat(p.v),
    }));
  } catch {
    return null;
  }
}
