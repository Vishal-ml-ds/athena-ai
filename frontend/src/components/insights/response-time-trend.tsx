"use client";

// --- Component ---

export function ResponseTimeTrend() {
  return (
    <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl border border-[#4a4455]/15 p-8 rounded-xl h-[340px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline text-lg font-bold text-[#dae2fd]">
          Response Time Trend
        </h3>
        <div className="text-right">
          <span className="block text-2xl font-bold text-[#d2bbff] font-headline">
            1.1s
          </span>
          <span className="text-[10px] text-[#958da1] font-mono uppercase">Avg Latency</span>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="flex-1 relative mt-4">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 150"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="response-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Fill area */}
          <path
            d="M0,120 Q50,80 100,100 T200,60 T300,90 T400,40 V150 H0 Z"
            fill="url(#response-grad)"
            opacity="0.2"
          />
          {/* Line */}
          <path
            d="M0,120 Q50,80 100,100 T200,60 T300,90 T400,40"
            fill="none"
            stroke="#d2bbff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] font-mono text-[#958da1]/50">
          <span>01 OCT</span>
          <span>10 OCT</span>
          <span>20 OCT</span>
          <span>30 OCT</span>
        </div>
      </div>
    </div>
  );
}
