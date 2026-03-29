"use client";

// --- Constants ---

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS_COUNT = 24;

const INTENSITY_CLASSES = [
  "bg-[#060e20]",
  "bg-violet-900/40",
  "bg-violet-700/60",
  "bg-violet-500",
] as const;

/**
 * Deterministic pseudo-random intensity based on day + hour.
 * Uses a simple hash so the grid looks realistic but stays stable across renders.
 */
function getIntensity(dayIndex: number, hourIndex: number): number {
  const seed = (dayIndex * 31 + hourIndex * 17 + 7) % 23;
  if (seed < 6) return 0;
  if (seed < 12) return 1;
  if (seed < 18) return 2;
  return 3;
}

// --- Component ---

export function ActivityHeatmap() {
  return (
    <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl border border-[#4a4455]/15 p-8 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-[family-name:'Space_Grotesk'] text-lg font-bold text-[#dae2fd]">
          Activity Heatmap
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-[#958da1] font-mono">
          <span>Less</span>
          <div className="flex gap-1">
            {INTENSITY_CLASSES.map((cls, index) => (
              <div key={index} className={`w-3 h-3 rounded-sm ${cls}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex gap-1 mb-2 ml-12">
            {Array.from({ length: HOURS_COUNT }).map((_, hourIndex) => (
              <div key={hourIndex} className="w-4 text-center">
                {hourIndex % 6 === 0 && (
                  <span className="text-[9px] font-mono text-[#958da1]">
                    {String(hourIndex).padStart(2, "0")}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <span className="w-10 text-[10px] font-mono text-[#958da1] uppercase shrink-0">
                {day}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: HOURS_COUNT }).map((_, hourIndex) => {
                  const intensity = getIntensity(dayIndex, hourIndex);
                  return (
                    <div
                      key={hourIndex}
                      className={`w-4 h-4 rounded-sm ${INTENSITY_CLASSES[intensity]}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
