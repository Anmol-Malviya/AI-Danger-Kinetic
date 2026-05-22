import React, { useState } from "react";
import { 
  FiShield, 
  FiAlertOctagon,
  FiGlobe,
  FiSettings
} from "react-icons/fi";

export const ExtensionDemo: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [simulatedUrl, setSimulatedUrl] = useState("http://paypal-verification-login.com/secure");
  const [threatDetected, setThreatDetected] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-cyber-border pb-4">
        <h2 className="text-2xl font-display font-extrabold text-white tracking-wide">
          BROWSER EXTENSION INTEGRATION
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          ShieldX features a lightweight extension API that injects heuristics scanners inline to block domains before page load.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mock Browser Frame */}
        <div className="glass-card overflow-hidden border border-white/10 flex flex-col min-h-[380px] bg-slate-950/80">
          {/* Header Bar */}
          <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-white/5">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 max-w-md mx-auto bg-slate-950 rounded px-3 py-1 text-[11px] font-mono text-slate-400 flex items-center justify-between border border-white/5">
              <span className="truncate">{simulatedUrl}</span>
              <span className="text-cyber-danger text-[10px] animate-pulse">⚠️ BLOCKED BY SHIELDX</span>
            </div>
          </div>

          {/* Browser content rendering warnings */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-950/40 relative">
            {isEnabled && threatDetected ? (
              <div className="max-w-sm space-y-4 animate-pulse">
                <div className="inline-flex items-center justify-center p-3 bg-cyber-danger/10 border border-cyber-danger/30 rounded-full text-cyber-danger mb-2">
                  <FiAlertOctagon className="text-4xl" />
                </div>
                <h4 className="font-display font-bold text-white text-md tracking-wider">
                  SHIELDX BLOCKED A PHISHING ATTEMPT
                </h4>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  This website mimics PayPal branding and is hosted on a newly registered suspicious domain.
                </p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => setSimulatedUrl("https://www.google.com")}
                    className="px-4 py-2 bg-slate-900 border border-white/10 text-white rounded text-xs font-mono font-bold hover:bg-slate-800 transition-all"
                  >
                    GO BACK TO SAFETY
                  </button>
                  <button 
                    onClick={() => setThreatDetected(false)}
                    className="px-4 py-2 border border-cyber-danger/30 text-cyber-danger rounded text-xs font-mono font-bold hover:bg-cyber-danger/10 transition-all"
                  >
                    CONTINUE ANYWAY
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <FiGlobe className="text-4xl text-slate-600 mx-auto mb-2" />
                <h4 className="font-display font-bold text-slate-400 text-sm">WEBSITE CONTENT RENDERED</h4>
                <p className="text-xs text-slate-500 font-mono">No active threats detected or protection disabled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mock Extension Panel interface */}
        <div className="glass-card p-6 flex flex-col justify-between max-w-sm mx-auto bg-slate-950/80 border border-cyber-primary/20 shadow-[0_0_20px_rgba(6,182,212,0.05)] w-full">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FiShield className="text-cyber-primary text-xl" />
                <span className="font-display font-extrabold text-sm text-white tracking-widest">SHIELDX POPUP</span>
              </div>
              <FiSettings className="text-slate-400 hover:text-white cursor-pointer" />
            </div>

            {/* Toggle switch */}
            <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-white/5 mb-4">
              <div>
                <p className="text-xs font-bold text-white font-display">ACTIVE GUARDIAN MODE</p>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">Real-time inline tab scanning</p>
              </div>
              <button
                onClick={() => {
                  setIsEnabled(!isEnabled);
                  if (!isEnabled) setThreatDetected(true);
                }}
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center
                  ${isEnabled ? "bg-cyber-primary justify-end" : "bg-slate-800 justify-start"}`}
              >
                <span className="w-4 h-4 rounded-full bg-slate-950" />
              </button>
            </div>

            {/* Simulated Domain Status */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">CURRENT ACTIVE DOMAIN</span>
              
              <div className="p-3 bg-slate-900/20 border border-white/5 rounded-lg space-y-3 font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">DOMAIN NAME:</span>
                  <span className="text-white truncate max-w-[150px]">{simulatedUrl.split("/")[2] || simulatedUrl}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">STATUS:</span>
                  <span className={`font-bold
                    ${!isEnabled ? "text-slate-500" : threatDetected ? "text-cyber-danger animate-pulse" : "text-cyber-success"}
                  `}>
                    {!isEnabled ? "DISABLED" : threatDetected ? "DANGEROUS" : "SAFE"}
                  </span>
                </div>

                {isEnabled && threatDetected && (
                  <div className="pt-2 border-t border-white/5 text-[9px] text-cyber-danger space-y-1">
                    <p>● HEURISTIC: Looking like PayPal spoofing</p>
                    <p>● SSL: Missing valid HTTPS cert</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="pt-6 border-t border-white/5 flex gap-2">
            <button 
              onClick={() => {
                setSimulatedUrl("https://www.paypal.com");
                setThreatDetected(false);
              }}
              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded text-[10px] font-mono font-bold transition-all"
            >
              SIMULATE SAFE
            </button>
            <button 
              onClick={() => {
                setSimulatedUrl("http://paypal-verification-login.com/secure");
                setThreatDetected(true);
              }}
              className="flex-1 py-2 bg-cyber-danger/10 hover:bg-cyber-danger/20 border border-cyber-danger/30 text-cyber-danger rounded text-[10px] font-mono font-bold transition-all"
            >
              SIMULATE SCAM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
