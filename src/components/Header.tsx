"use client";

export default function Header({ updatedAt }: { updatedAt: string }) {
  return (
    <div className="flex items-center justify-between py-4 mb-[18px] border-b border-card-border">
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] bg-primary rounded-[10px] flex items-center justify-center text-white text-lg font-bold">
          ◈
        </div>
        <div>
          <div className="text-lg font-bold text-text">Maine Surf Report</div>
          <div className="text-xs text-text-muted font-medium">
            Southern Maine • Updated {updatedAt}
          </div>
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="font-sans bg-card border border-card-border rounded-[10px] text-text-secondary px-4 py-2 text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-surface hover:text-text"
      >
        ↻ Refresh
      </button>
    </div>
  );
}
