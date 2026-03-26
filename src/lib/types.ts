export type Rating = "GOOD" | "FAIR" | "POOR" | "FLAT";

export interface BuoyData {
  waveHeightFt: number | null;
  dominantPeriodS: number | null;
  waveDirDeg: number | null;
  windSpeedMph: number | null;
  windDirDeg: number | null;
  waterTempF: number | null;
  airTempF: number | null;
  timestamp: string;
}

export interface ForecastSlot {
  time: string;        // ISO string
  dayLabel: string;    // "THU", "FRI", etc.
  timeLabel: string;   // "Dawn", "Midday", "Afternoon"
  swellHeightFt: number | null;
  swellPeriodS: number | null;
  swellDirDeg: number | null;
  windSpeedMph: number | null;
  windDirDeg: number | null;
  windGustsMph: number | null;
  rating: Rating;
  ratingScore: number;
}

export interface DayForecast {
  dayLabel: string;
  date: string;
  bestSlot: ForecastSlot;
}

export interface TidePoint {
  time: string;
  height: number;
  type: "H" | "L";
}

export interface HourlyTide {
  time: string;
  height: number;
}

export interface SpotMeta {
  name: string;
  location: string;
  driveTime: string;
  driveMinutes: number;
  faces: string;
  bestSwellDirDeg: number;
  bestWindDirRange: [number, number];
  bestTide: string;
  minRideableFt: number;
}

export interface RankedSpot extends SpotMeta {
  score: number;
  rideable: boolean;
  conditionText: string;
  tag: string | null;
}

export interface SurfData {
  buoy: BuoyData | null;
  forecast: DayForecast[];
  bestWindow: ForecastSlot | null;
  tidePoints: TidePoint[];
  hourlyTide: HourlyTide[];
  currentRating: Rating;
  currentRatingScore: number;
  updatedAt: string;
}
