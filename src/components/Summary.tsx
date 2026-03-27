import { wetsuitRec } from "@/lib/utils";

export default function Summary({ text, waterTempF }: { text: string; waterTempF: number | null }) {
  return (
    <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] mb-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="text-primary text-[10px] uppercase tracking-[1.5px] font-bold mb-2">
        Today&apos;s Call
      </div>
      <div className="text-text-secondary text-sm leading-[1.7] font-medium">
        {text}
      </div>
      {waterTempF !== null && (
        <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between">
          <span className="text-text-muted text-[10px] uppercase tracking-[1px] font-bold">Wetsuit</span>
          <span className="text-text text-[13px] font-semibold">{wetsuitRec(waterTempF)} · {waterTempF}°F</span>
        </div>
      )}
    </div>
  );
}
