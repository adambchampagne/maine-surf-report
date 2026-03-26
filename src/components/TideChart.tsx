"use client";

import type { TidePoint, HourlyTide } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export default function TideChart({
  tidePoints,
  hourlyTide,
}: {
  tidePoints: TidePoint[] | null;
  hourlyTide: HourlyTide[] | null;
}) {
  if (!hourlyTide || hourlyTide.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex-1">
        <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold mb-3.5">
          Tide — Portland, ME
        </div>
        <div className="text-text-muted text-sm font-medium py-8 text-center">
          Tide data unavailable
        </div>
      </div>
    );
  }

  // Build SVG path from hourlyTide data
  const svgW = 400;
  const svgH = 85;
  const padding = 4;

  const heights = hourlyTide.map((h) => h.height);
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  const range = maxH - minH || 1;

  const points = hourlyTide.map((h, i) => {
    const x = (i / (hourlyTide.length - 1)) * svgW;
    const y = svgH - padding - ((h.height - minH) / range) * (svgH - padding * 2);
    return { x, y };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const fillPath =
    `M${points[0].x},${svgH} ` +
    points.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${points[points.length - 1].x},${svgH} Z`;

  // NOW marker position
  const now = new Date();
  const startTime = new Date(hourlyTide[0].time).getTime();
  const endTime = new Date(hourlyTide[hourlyTide.length - 1].time).getTime();
  const totalSpan = endTime - startTime || 1;
  const nowFrac = Math.max(0, Math.min(1, (now.getTime() - startTime) / totalSpan));
  const nowX = nowFrac * svgW;

  // Interpolate Y at nowX
  const nowIdx = nowFrac * (hourlyTide.length - 1);
  const lo = Math.floor(nowIdx);
  const hi = Math.min(lo + 1, hourlyTide.length - 1);
  const frac = nowIdx - lo;
  const nowY = points[lo].y + (points[hi].y - points[lo].y) * frac;

  // Filter tide points to today only
  const todayStr = now.toISOString().split("T")[0];
  const todayTides = tidePoints?.filter(
    (tp) => tp.time.split("T")[0] === todayStr
  ) ?? [];

  return (
    <div className="bg-card border border-card-border rounded-[14px] px-5 py-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex-1">
      <div className="text-text-muted text-[10px] uppercase tracking-[1.5px] font-bold mb-3.5">
        Tide — Portland, ME
      </div>
      <svg
        width="100%"
        height="85"
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a9d8f" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#2a9d8f" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#tg)" />
        <polyline
          points={polyline}
          fill="none"
          stroke="#2a9d8f"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* NOW marker */}
        <line
          x1={nowX}
          y1={0}
          x2={nowX}
          y2={svgH}
          stroke="#2d2a24"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.15"
        />
        <circle cx={nowX} cy={nowY} r="5" fill="#2a9d8f" />
        <text
          x={nowX + 8}
          y={nowY - 3}
          fill="#2d2a24"
          fontSize="10"
          fontFamily="Quicksand, sans-serif"
          fontWeight="600"
          opacity="0.5"
        >
          NOW
        </text>
      </svg>

      {todayTides.length > 0 && (
        <div className="flex justify-between mt-2.5">
          {todayTides.map((tp, i) => (
            <div
              key={i}
              className={`text-[11px] leading-[1.4] font-medium ${
                tp.type === "H"
                  ? "text-primary font-bold"
                  : "text-text-muted"
              }`}
            >
              {tp.type === "H" ? "▲" : "▼"} {formatTime(tp.time)}
              <br />
              <span className="opacity-60 text-[10px]">{tp.height}ft</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
