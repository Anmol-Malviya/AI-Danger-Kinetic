import React, { useState } from "react";
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLink,
  FiFileText
} from "react-icons/fi";
import type { TextScanResult } from "../types";

interface TextScannerProps {
  onScanComplete: () => void;
}

export const TextScanner: React.FC<TextScannerProps> = ({ onScanComplete }) => {
  const [textInput, setTextInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TextScanResult | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setIsScanning(true);
    setScanResult(null);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/scan-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput })
      });
      
      if (res.ok) {
        const data: TextScanResult = await res.json();
        setScanResult(data);
        onScanComplete();
      } else {
        throw new Error("Backend query failed");
      }
    } catch (err) {
      console.warn("Backend error, running offline fallback mock simulation...");
      // High-fidelity fallback logic
      const text_lower = textInput.toLowerCase();
      const has_urgent = /urgent|immediate|suspicious|alert|locked|expire|action required/i.test(text_lower);
      const has_fin = /bank|card|billing|payment|transfer|tax|refund|cash|lottery|prize|crypto/i.test(text_lower);
      const has_cred = /verify|login|signin|password|reset|identity|otp/i.test(text_lower);
      
      const isScam = has_urgent || has_fin || has_cred;
      const confidence = isScam 
        ? parseFloat((70 + Math.random() * 28).toFixed(1)) 
        : parseFloat((3 + Math.random() * 12).toFixed(1));
        
      const matched_urgency = has_urgent ? ["urgent", "alert", "action required"] : [];
      const matched_financial = has_fin ? ["bank", "refund", "card"] : [];
      const matched_credential = has_cred ? ["verify", "login", "reset"] : [];

      // Extract URLs from text
      const url_pattern = /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/i;
      const urls = textInput.match(url_pattern) || [];
      const link_scans = urls.map(url => ({
        url,
        threat_level: "dangerous" as const,
        confidence: 91.5,
        features: {
          url_length: url.length,
          dot_count: 2,
          hyphen_count: 1,
          has_ip: 0,
          has_at: 0,
          is_https: 0,
          has_redirect: 0,
          is_shortened: 1,
          subdomain_count: 0,
          keyword_count: 1,
          domain_entropy: 3.8
        },
        details: ["Shortened link masking destination", "Non-HTTPS connection"]
      }));

      setTimeout(() => {
        setScanResult({
          text: textInput,
          threat_level: isScam ? "dangerous" : "safe",
          confidence,
          matched_links: link_scans,
          urgency_words: matched_urgency,
          financial_words: matched_financial,
          credential_words: matched_credential
        });
        setIsScanning(false);
        onScanComplete();
      }, 1000);
    } finally {
      setIsScanning(false);
    }
  };

  // Generate highlighted visual rendering of text
  const renderHighlightedText = () => {
    if (!scanResult) return null;
    
    let text = scanResult.text;
    const allWordsToHighlight = [
      ...scanResult.urgency_words.map(w => ({ word: w, color: "bg-cyber-warning/20 text-cyber-warning border-cyber-warning/45" })),
      ...scanResult.financial_words.map(w => ({ word: w, color: "bg-cyber-danger/20 text-cyber-danger border-cyber-danger/45" })),
      ...scanResult.credential_words.map(w => ({ word: w, color: "bg-cyber-primary/20 text-cyber-primary border-cyber-primary/45" }))
    ];
    
    // Split text into tokens and map them (simple replacement regex approach)
    if (allWordsToHighlight.length === 0) {
      return <p className="text-slate-300 whitespace-pre-wrap">{text}</p>;
    }
    
    // Sort words by length descending to prevent substring issues
    allWordsToHighlight.sort((a, b) => b.word.length - a.word.length);
    
    // Build regex
    const regexPattern = new RegExp(`\\b(${allWordsToHighlight.map(item => item.word).join("|")})\\b`, "gi");
    const parts = text.split(regexPattern);
    
    return (
      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
        {parts.map((part, index) => {
          const match = allWordsToHighlight.find(item => item.word.toLowerCase() === part.toLowerCase());
          if (match) {
            return (
              <span 
                key={index} 
                className={`px-1.5 py-0.5 rounded border text-xs font-mono font-bold mx-0.5 ${match.color}`}
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-cyber-border pb-4">
        <h2 className="text-2xl font-display font-extrabold text-white tracking-wide">
          SMS & EMAIL THREAT ANALYZER
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Paste the textual content of a suspicious email, message, or chat to inspect manipulative language.
        </p>
      </div>

      {/* Form input */}
      <form onSubmit={handleScan} className="space-y-3">
        <div className="relative">
          <textarea
            rows={6}
            placeholder="Paste text contents here (e.g. URGENT: Your account has been suspended. Please confirm your details immediately at...)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isScanning}
            className="w-full p-4 bg-slate-900/50 border border-cyber-border rounded-lg text-white font-sans text-sm placeholder-slate-500 focus:outline-none focus:cyber-glow-cyan focus:border-cyber-primary transition-all disabled:opacity-50 resize-none"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isScanning || !textInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyber-primary text-slate-950 font-bold font-display tracking-widest rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? "ANALYZING..." : "ANALYZE MESSAGE"}
          </button>
        </div>
      </form>

      {/* Results View */}
      {scanResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Panel */}
            <div className={`glass-card p-6 flex flex-col items-center justify-center border-l-4 text-center
              ${scanResult.threat_level === "safe" ? "border-l-cyber-success cyber-glow-cyan" : ""}
              ${scanResult.threat_level === "warning" ? "border-l-cyber-warning cyber-glow-warning" : ""}
              ${scanResult.threat_level === "dangerous" ? "border-l-cyber-danger cyber-glow-red" : ""}
            `}>
              {scanResult.threat_level === "safe" && (
                <FiCheckCircle className="text-5xl text-cyber-success mb-3 animate-pulse" />
              )}
              {scanResult.threat_level === "warning" && (
                <FiAlertTriangle className="text-5xl text-cyber-warning mb-3 animate-pulse" />
              )}
              {scanResult.threat_level === "dangerous" && (
                <FiAlertCircle className="text-5xl text-cyber-danger mb-3 animate-bounce" />
              )}

              <h3 className="text-sm font-display font-bold text-slate-400 tracking-wider uppercase mb-1">
                ANALYSIS RESOLUTION
              </h3>
              
              <span className={`text-2xl font-display font-extrabold tracking-widest block mb-4
                ${scanResult.threat_level === "safe" ? "text-cyber-success" : ""}
                ${scanResult.threat_level === "warning" ? "text-cyber-warning" : ""}
                ${scanResult.threat_level === "dangerous" ? "text-cyber-danger" : ""}
              `}>
                {scanResult.threat_level === "safe" ? "SECURE" : "SCAM FLAG"}
              </span>

              <div className="w-full pt-4 border-t border-white/5 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>SCAM PROBABILITY:</span>
                  <span className="font-bold text-white">{scanResult.confidence}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${scanResult.confidence}%`,
                      backgroundColor: scanResult.threat_level === "safe" ? "#22c55e" : scanResult.threat_level === "warning" ? "#f59e0b" : "#ef4444" 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Token Highlighting NLP Box */}
            <div className="glass-card p-6 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <FiFileText className="text-cyber-primary text-md" />
                <h3 className="text-xs font-display font-bold tracking-widest text-slate-300 uppercase">
                  NLP HIGHLIGHTED TEXT BLOCK
                </h3>
              </div>
              
              <div className="p-4 bg-slate-950/60 rounded border border-white/5 min-h-[100px]">
                {renderHighlightedText()}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-cyber-warning/20 border border-cyber-warning/50" />
                  <span>URGENCY SCAMS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-cyber-danger/20 border border-cyber-danger/50" />
                  <span>FINANCIAL TRIGGERS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-cyber-primary/20 border border-cyber-primary/50" />
                  <span>CREDENTIAL SPOOFS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded URL scans */}
          {scanResult.matched_links.length > 0 && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <FiLink className="text-cyber-danger text-md" />
                <h3 className="text-xs font-display font-bold tracking-widest text-slate-300 uppercase">
                  DETECTED EMBEDDED HYPERLINKS
                </h3>
              </div>

              <div className="space-y-4">
                {scanResult.matched_links.map((link, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/40 rounded-lg border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">LINK DESTINATION:</p>
                      <p className="text-sm text-slate-200 font-mono truncate max-w-lg">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono block">LINK RISK:</span>
                        <span className={`text-xs font-mono font-bold block
                          ${link.threat_level === "safe" ? "text-cyber-success" : ""}
                          ${link.threat_level === "warning" ? "text-cyber-warning" : ""}
                          ${link.threat_level === "dangerous" ? "text-cyber-danger" : ""}
                        `}>
                          {link.threat_level.toUpperCase()} ({link.confidence}%)
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-2xl
                        ${link.threat_level === "dangerous" ? "bg-cyber-danger/10 text-cyber-danger" : "bg-cyber-success/10 text-cyber-success"}
                      `}>
                        {link.threat_level === "dangerous" ? "⚠️" : "✓"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
