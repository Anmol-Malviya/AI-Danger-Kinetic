import React from "react";

interface ThreatMeterProps {
  score: number; // 0 to 100
}

export const ThreatMeter: React.FC<ThreatMeterProps> = ({ score }) => {
  // SVG circular properties
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine colors based on threat score
  const getThreatColor = (val: number) => {
    if (val < 35) return { 
      text: "text-cyber-success", 
      stroke: "#22c55e", 
      glow: "rgba(34, 197, 94, 0.4)",
      label: "SAFE STATUS",
      bgClass: "from-cyber-success/5 to-transparent"
    };
    if (val < 70) return { 
      text: "text-cyber-warning", 
      stroke: "#f59e0b", 
      glow: "rgba(245, 158, 11, 0.4)",
      label: "SUSPICIOUS",
      bgClass: "from-cyber-warning/5 to-transparent"
    };
    return { 
      text: "text-cyber-danger", 
      stroke: "#ef4444", 
      glow: "rgba(239, 68, 68, 0.4)",
      label: "CRITICAL THREAT",
      bgClass: "from-cyber-danger/5 to-transparent"
    };
  };

  const threatStatus = getThreatColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-6 relative">
      {/* Outer Glow Background */}
      <div 
        className="absolute w-48 h-48 rounded-full blur-[60px] opacity-20 transition-all duration-700" 
        style={{ backgroundColor: threatStatus.stroke }}
      />
      
      {/* SVG Ring container */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <defs>
            {/* Dynamic Drop-shadow Glow filter */}
            <filter id={`meter-glow-${score}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Linear Gradient for border */}
            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={threatStatus.stroke} />
              <stop offset="100%" stopColor={score < 70 ? "#06b6d4" : "#991b1b"} />
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="rgba(30, 41, 59, 0.6)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Active Status Circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={`url(#gradient-${score})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ 
              transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `url(#meter-glow-${score})`
            }}
          />
        </svg>

        {/* Floating details inside the meter */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xs font-display font-semibold tracking-widest text-slate-400 mb-1">
            THREAT INDEX
          </span>
          <span className="text-5xl font-display font-extrabold text-white tracking-tighter leading-none mb-1">
            {score}%
          </span>
          <span className={`text-xs font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-900 border border-white/5 ${threatStatus.text}`}>
            {threatStatus.label}
          </span>
        </div>
      </div>
      
      {/* Visual threat spectrum ticks */}
      <div className="mt-4 flex gap-1 w-full max-w-[200px] justify-between px-2">
        <div className="flex flex-col items-center">
          <div className={`w-3 h-1.5 rounded-full ${score < 35 ? "bg-cyber-success" : "bg-slate-800"}`} />
          <span className="text-[9px] text-slate-500 font-mono mt-1">SAFE</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-3 h-1.5 rounded-full ${score >= 35 && score < 70 ? "bg-cyber-warning" : "bg-slate-800"}`} />
          <span className="text-[9px] text-slate-500 font-mono mt-1">WARN</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-3 h-1.5 rounded-full ${score >= 70 ? "bg-cyber-danger" : "bg-slate-800"}`} />
          <span className="text-[9px] text-slate-500 font-mono mt-1">CRIT</span>
        </div>
      </div>
    </div>
  );
};
