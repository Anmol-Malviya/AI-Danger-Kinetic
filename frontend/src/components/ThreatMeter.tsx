import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface ThreatMeterProps {
  score: number; // 0 to 100
}

export const ThreatMeter: React.FC<ThreatMeterProps> = ({ score }) => {
  // SVG circular properties
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

  // Animated display number (count-up)
  const [displayScore, setDisplayScore] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1400;
    const from = 0;
    const to = score;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [score]);

  // Determine colors based on threat score
  const getThreatColor = (val: number) => {
    if (val < 35) return { 
      text: "text-cyber-success", 
      stroke: "#22c55e", 
      secondStroke: "#06b6d4",
      glow: "rgba(34, 197, 94, 0.5)",
      glowSoft: "rgba(34, 197, 94, 0.15)",
      label: "SAFE STATUS",
      orbitColor: "rgba(34, 197, 94, 0.3)",
    };
    if (val < 70) return { 
      text: "text-cyber-warning", 
      stroke: "#f59e0b", 
      secondStroke: "#ef4444",
      glow: "rgba(245, 158, 11, 0.5)",
      glowSoft: "rgba(245, 158, 11, 0.15)",
      label: "SUSPICIOUS",
      orbitColor: "rgba(245, 158, 11, 0.3)",
    };
    return { 
      text: "text-cyber-danger", 
      stroke: "#ef4444", 
      secondStroke: "#7f1d1d",
      glow: "rgba(239, 68, 68, 0.6)",
      glowSoft: "rgba(239, 68, 68, 0.15)",
      label: "CRITICAL THREAT",
      orbitColor: "rgba(239, 68, 68, 0.4)",
    };
  };

  const threatStatus = getThreatColor(score);
  const isCritical = score >= 70;

  // Tick marks around the dial
  const totalTicks = 40;
  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    const angle = (i / totalTicks) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const outerR = 96;
    const innerR = score / 100 * i < totalTicks * 0.7 ? 90 : 88;
    const x1 = 100 + innerR * Math.cos(rad);
    const y1 = 100 + innerR * Math.sin(rad);
    const x2 = 100 + outerR * Math.cos(rad);
    const y2 = 100 + outerR * Math.sin(rad);
    const isActive = (i / totalTicks) * 100 <= score;
    return { x1, y1, x2, y2, isActive };
  });

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      {/* Outer ambient glow blob */}
      <div 
        className="absolute w-52 h-52 rounded-full blur-[70px] transition-all duration-1000 pointer-events-none" 
        style={{ backgroundColor: threatStatus.glowSoft, opacity: 0.6 }}
      />
      
      {/* SVG Ring container */}
      <div className="relative w-52 h-52 flex items-center justify-center">

        {/* Rotating orbit ring */}
        <div 
          className="absolute inset-0 animate-orbit pointer-events-none"
          style={{ animationDuration: isCritical ? "3s" : "8s" }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle
              cx="100" cy="100" r="96"
              stroke={threatStatus.orbitColor}
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 8"
              strokeLinecap="round"
            />
            {/* Orbit cursor dot */}
            <circle cx="100" cy="4" r="3" fill={threatStatus.stroke} style={{ filter: `drop-shadow(0 0 4px ${threatStatus.stroke})` }} />
          </svg>
        </div>

        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <defs>
            <filter id={`meter-glow-${score}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={threatStatus.stroke} />
              <stop offset="100%" stopColor={threatStatus.secondStroke} />
            </linearGradient>

            <linearGradient id="track-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(30,41,59,0.4)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0.6)" />
            </linearGradient>
          </defs>

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke={tick.isActive ? threatStatus.stroke : "rgba(30,41,59,0.5)"}
              strokeWidth={i % 5 === 0 ? "2" : "1"}
              strokeLinecap="round"
              opacity={tick.isActive ? 0.7 : 0.3}
            />
          ))}

          {/* Background Track */}
          <circle
            cx="100" cy="100" r={radius}
            stroke="rgba(15, 23, 42, 0.8)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Secondary track glow */}
          <circle
            cx="100" cy="100" r={radius}
            stroke="rgba(30,41,59,0.4)"
            strokeWidth={strokeWidth + 4}
            fill="transparent"
          />

          {/* Animated active arc */}
          <motion.circle
            cx="100" cy="100" r={radius}
            stroke={`url(#gradient-${score})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
            strokeLinecap="round"
            fill="transparent"
            style={{ filter: `url(#meter-glow-${score})` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-display font-semibold tracking-[0.2em] text-slate-500 mb-1 uppercase">
            Threat Index
          </span>
          
          <span 
            className={`text-5xl font-display font-extrabold tracking-tighter leading-none mb-1 animate-number-glow ${threatStatus.text}`}
          >
            {displayScore}%
          </span>
          
          <motion.span 
            key={threatStatus.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/5 ${threatStatus.text} ${isCritical ? "animate-danger-ring" : ""}`}
          >
            {threatStatus.label}
          </motion.span>
        </div>
      </div>
      
      {/* Threat spectrum indicators */}
      <div className="mt-4 flex gap-3 items-center justify-center">
        {[
          { label: "SAFE", color: "bg-cyber-success", shadow: "rgba(34,197,94,0.6)", active: score < 35 },
          { label: "WARN", color: "bg-cyber-warning", shadow: "rgba(245,158,11,0.6)", active: score >= 35 && score < 70 },
          { label: "CRIT", color: "bg-cyber-danger", shadow: "rgba(239,68,68,0.6)", active: score >= 70 },
        ].map(({ label, color, shadow, active }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div 
              className={`w-2 h-2 rounded-full transition-all duration-700 ${color} ${active ? "animate-heartbeat" : "opacity-25"}`}
              style={active ? { boxShadow: `0 0 8px ${shadow}` } : {}}
            />
            <span className={`text-[9px] font-mono tracking-wider transition-colors duration-500 ${active ? "text-slate-300" : "text-slate-600"}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
