import { wetsuitRec } from "@/lib/utils";

export default function WetsuitBar({
  waterTempF,
}: {
  waterTempF: number | null;
}) {
  return (
    <div className="bg-card border border-card-border rounded-[14px] px-5 py-3.5 mb-3.5 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="text-[10px] text-text-muted uppercase tracking-[1px] font-bold">
        Wetsuit
      </div>
      <div className="text-[13px] text-text font-semibold">
        {wetsuitRec(waterTempF)}
      </div>
    </div>
  );
}
