import type { BuoyData } from "@/lib/types";
import { compassDir, wetsuitShort } from "@/lib/utils";
import { windQuality } from "@/lib/ratings";

export default function CurrentConditions({
  buoy,
}: {
  buoy: BuoyData | null;
}) {
  const swellValue = buoy?.waveHeightFt ?? null;
  const swellUnit = "ft";
  const swellDetail =
    buoy && buoy.dominantPeriodS !== null
      ? `@ ${buoy.dominantPeriodS}s ${compassDir(buoy.waveDirDeg)}`
      : buoy
        ? "—"
        : "Offline";

  const windValue = buoy?.windSpeedMph ?? null;
  const windUnit = "mph";
  const windDetail = buoy
    ? buoy.windSpeedMph !== null
      ? `${compassDir(buoy.windDirDeg)} ${windQuality(buoy.windDirDeg, buoy.windSpeedMph).split(" (")[1]?.replace(")", "") ?? ""}`
      : "—"
    : "Offline";

  const waterValue = buoy?.waterTempF ?? null;
  const waterUnit = "°F";
  const waterDetail = buoy
    ? buoy.waterTempF !== null
      ? wetsuitShort(buoy.waterTempF)
      : "—"
    : "Offline";

  const stats = [
    { label: "Swell", value: swellValue, unit: swellUnit, detail: swellDetail },
    { label: "Wind", value: windValue, unit: windUnit, detail: windDetail },
    { label: "Water", value: waterValue, unit: waterUnit, detail: waterDetail },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-surface rounded-[10px] py-3.5 px-2 text-center"
        >
          <div className="text-text-muted text-[9px] uppercase tracking-[1px] font-bold">
            {s.label}
          </div>
          <div className="text-2xl font-bold text-text my-0.5">
            {s.value !== null ? (
              <>
                {s.value}
                <span className="text-[13px] font-semibold">{s.unit}</span>
              </>
            ) : (
              "--"
            )}
          </div>
          <div className="text-text-muted text-[11px] font-medium">
            {s.detail}
          </div>
        </div>
      ))}
    </div>
  );
}
