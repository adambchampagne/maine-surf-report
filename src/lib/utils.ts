export function metersToFeet(m: number | null): number | null {
  if (m === null || m === undefined) return null;
  return Math.round(m * 3.28084 * 10) / 10;
}

export function compassDir(deg: number | null): string {
  if (deg === null || deg === undefined) return "?";
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function todayYYYYMMDD(): string {
  const d = new Date();
  return `${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,"0")}${d.getDate().toString().padStart(2,"0")}`;
}

export function dayAbbr(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

export function wetsuitRec(waterTempF: number | null): string {
  if (waterTempF === null) return "Unknown — assume full winter gear";
  if (waterTempF < 45) return "5/4mm + hood, 7mm boots, 5mm gloves";
  if (waterTempF < 55) return "4/3mm + boots, gloves";
  if (waterTempF < 62) return "3/2mm + optional boots";
  if (waterTempF < 68) return "3/2mm";
  return "Spring suit or boardshorts";
}

export function wetsuitShort(waterTempF: number | null): string {
  if (waterTempF === null) return "N/A";
  if (waterTempF < 45) return "5/4 + hood";
  if (waterTempF < 55) return "4/3 + boots";
  if (waterTempF < 62) return "3/2mm";
  if (waterTempF < 68) return "3/2mm";
  return "Trunks";
}
