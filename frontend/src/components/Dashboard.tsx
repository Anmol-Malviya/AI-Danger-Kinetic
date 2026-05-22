import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiShield, 
  FiAlertTriangle, 
  FiActivity, 
  FiDownload, 
  FiRefreshCw, 
  FiClock
} from "react-icons/fi";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";

import { ThreatMeter } from "./ThreatMeter";
import type { DashboardStats } from "../types";

// Register ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  refreshData: () => void;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  isLoading, 
  refreshData,
  setActiveTab
}) => {
  const [filter, setFilter] = useState<"all" | "safe" | "warning" | "dangerous">("all");
  const [expandedLogId, setExpandedLogId] = useState<string | number | null>(null);

  // Auto-refresh simulations
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate real-time backend updates
      refreshData();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="text-3xl text-cyber-primary animate-spin" />
          <p className="font-mono text-slate-400">CONNECTING TO SHIELDX SECURITY CORE...</p>
        </div>
      </div>
    );
  }

  // Set up chart data
  const chartData = {
    labels: ["Safe Scans", "Warnings", "Threats Blocked"],
    datasets: [
      {
        data: [stats.metrics.safe, stats.metrics.warning, stats.metrics.dangerous],
        backgroundColor: [
          "rgba(34, 197, 94, 0.75)",
          "rgba(245, 158, 11, 0.75)",
          "rgba(239, 68, 68, 0.75)"
        ],
        borderColor: [
          "#22c55e",
          "#f59e0b",
          "#ef4444"
        ],
        borderWidth: 1.5,
        hoverOffset: 12,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#94a3b8",
          font: {
            family: "Inter",
            size: 11
          },
          boxWidth: 12,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { family: "Orbitron" },
        bodyFont: { family: "Inter" },
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1
      }
    },
    cutout: "70%",
    maintainAspectRatio: false
  };

  const filteredHistory = stats.history.filter((item) => {
    if (filter === "all") return true;
    return item.threat_level === filter;
  });

  // PDF report downloader
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Set styling for header
    doc.setFillColor(15, 23, 42); // dark blue background
    doc.rect(0, 0, 210, 50, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(6, 182, 212); // Cyan
    doc.text("SHIELDX AI - SECURITY AUDIT REPORT", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    doc.text("ShieldX Detection System | Version 1.0.0", 20, 42);

    // Section 1: Dashboard Metrics
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Dark text
    doc.text("1. SECURITY ASSESSMENT STATUS", 20, 65);
    doc.line(20, 68, 190, 68);

    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Scans Performed: ${stats.total_scans}`, 20, 78);
    doc.text(`Threat Level Index Score: ${stats.threat_score}%`, 20, 85);
    
    // Status text explanation
    doc.setFontSize(10);
    doc.setFont("Helvetica", "oblique");
    const splitDesc = doc.splitTextToSize(stats.description, 170);
    doc.text(splitDesc, 20, 95);

    // Section 2: Metrics breakdown table
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("2. RISK PROFILE DISTRIBUTION", 20, 125);
    doc.line(20, 128, 190, 128);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Safe Elements Analyzed: ${stats.metrics.safe}`, 30, 138);
    doc.text(`Suspicious Warnings Flagged: ${stats.metrics.warning}`, 30, 145);
    doc.text(`Dangerous Threats Blocked: ${stats.metrics.dangerous}`, 30, 152);

    // Section 3: Scan Logs Table
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("3. LIVE ANALYSIS HISTORICAL LOG", 20, 170);
    doc.line(20, 173, 190, 173);

    // Draw Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(20, 178, 170, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text("TYPE", 25, 183);
    doc.text("TARGET", 50, 183);
    doc.text("CONFIDENCE", 135, 183);
    doc.text("STATUS", 165, 183);

    let yOffset = 192;
    stats.history.slice(0, 8).forEach((item) => {
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(item.type, 25, yOffset);
      
      const truncTarget = item.target.length > 40 ? item.target.substring(0, 37) + "..." : item.target;
      doc.text(truncTarget, 50, yOffset);
      doc.text(`${item.confidence}%`, 135, yOffset);
      
      // Color coded status
      if (item.threat_level === "safe") {
        doc.setTextColor(34, 197, 94);
      } else if (item.threat_level === "warning") {
        doc.setTextColor(245, 158, 11);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(item.threat_level.toUpperCase(), 165, yOffset);
      yOffset += 8;
    });

    // Save File
    doc.save("ShieldX_Security_Report.pdf");
  };

  return (
    <div className="space-y-8 cyber-grid p-2 min-h-full">
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-wider text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            SECURITY CONTROL CENTER
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Real-time Threat Monitoring & Scam Classifier Engines
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-cyber-border bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
            <span>FORCE REFRESH</span>
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyber-primary hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-lg text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all"
          >
            <FiDownload className="text-md" />
            <span>EXPORT PDF REPORT</span>
          </button>
        </div>
      </div>

      {/* Grid: Gauge + Distribution + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular Gauge Card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center border-l-2 border-l-cyber-primary">
          <h2 className="text-sm font-display font-bold tracking-widest text-slate-400 uppercase text-center mb-2">
            AI Threat Meter
          </h2>
          <ThreatMeter score={stats.threat_score} />
          <p className="text-xs text-slate-500 font-mono text-center mt-2">
            Combined ML Confidence & Heuristics Vectors
          </p>
        </div>

        {/* Explain Risk Card */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiShield className="text-cyber-primary text-xl" />
              <h2 className="text-sm font-display font-bold tracking-widest text-slate-300 uppercase">
                AI RISK EXPLANATION
              </h2>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {stats.description}
            </p>
          </div>

          <div className="pt-4 border-t border-cyber-border grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded bg-slate-900/40">
              <span className="text-[10px] text-slate-500 font-mono block">TOTAL SCANS</span>
              <span className="text-lg font-display font-bold text-white block">{stats.total_scans}</span>
            </div>
            <div className="text-center p-2 rounded bg-cyber-success/5 border border-cyber-success/15">
              <span className="text-[10px] text-cyber-success/70 font-mono block">SAFE INDEX</span>
              <span className="text-lg font-display font-bold text-cyber-success block">
                {stats.total_scans > 0 ? Math.round((stats.metrics.safe / stats.total_scans) * 100) : 0}%
              </span>
            </div>
            <div className="text-center p-2 rounded bg-cyber-danger/5 border border-cyber-danger/15">
              <span className="text-[10px] text-cyber-danger/70 font-mono block">THREAT INDEX</span>
              <span className="text-lg font-display font-bold text-cyber-danger block">
                {stats.total_scans > 0 ? Math.round((stats.metrics.dangerous / stats.total_scans) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-cyber-primary text-xl" />
            <h2 className="text-sm font-display font-bold tracking-widest text-slate-300 uppercase">
              RISK DISTRIBUTION
            </h2>
          </div>
          
          <div className="relative flex-1 min-h-[160px] flex items-center justify-center">
            {stats.total_scans === 0 ? (
              <p className="text-xs font-mono text-slate-500">No scanned items found.</p>
            ) : (
              <div className="w-full h-full max-h-[160px]">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Quick launch scanners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab("url")}
          className="glass-card p-4 hover:cyber-glow-cyan border border-white/5 cursor-pointer flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-white font-display">URL SCANNER</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Scan domain spoofing & SSL certs</p>
          </div>
          <div className="w-8 h-8 rounded bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center text-cyber-primary group-hover:scale-110 transition-transform">
            ➔
          </div>
        </div>
        <div 
          onClick={() => setActiveTab("text")}
          className="glass-card p-4 hover:cyber-glow-cyan border border-white/5 cursor-pointer flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-white font-display">SMS & EMAIL</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Analyze spam/scam textual intent</p>
          </div>
          <div className="w-8 h-8 rounded bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center text-cyber-primary group-hover:scale-110 transition-transform">
            ➔
          </div>
        </div>
        <div 
          onClick={() => setActiveTab("qr")}
          className="glass-card p-4 hover:cyber-glow-cyan border border-white/5 cursor-pointer flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-white font-display">QR SCANNER</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Unpack links hidden in QR codes</p>
          </div>
          <div className="w-8 h-8 rounded bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center text-cyber-primary group-hover:scale-110 transition-transform">
            ➔
          </div>
        </div>
      </div>

      {/* Live History logs */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FiClock className="text-cyber-primary text-xl" />
            <h2 className="text-sm font-display font-bold tracking-widest text-slate-300 uppercase">
              LIVE SCANNER HISTORY LOGS
            </h2>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-cyber-border">
            {(["all", "safe", "warning", "dangerous"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded text-xs font-mono tracking-wider transition-all
                  ${filter === type 
                    ? "bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/30" 
                    : "text-slate-500 hover:text-slate-300"
                  }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Listing */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-mono text-xs">
              NO SCAN RECORDS FOUND CORRESPONDING TO THIS FILTER.
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isExpanded = expandedLogId === item.id;
              const isSafe = item.threat_level === "safe";
              const isWarning = item.threat_level === "warning";
              
              return (
                <div 
                  key={item.id}
                  className={`border border-white/5 rounded-lg bg-slate-900/20 hover:bg-slate-900/50 transition-all overflow-hidden`}
                >
                  <div 
                    onClick={() => setExpandedLogId(isExpanded ? null : item.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-cyber-border text-[10px] font-mono text-slate-400">
                        {item.type}
                      </span>
                      <span className="text-sm text-slate-300 font-mono font-medium truncate max-w-xs sm:max-w-md md:max-w-lg">
                        {item.target}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-mono">CONFIDENCE:</span>
                        <span className="text-xs font-mono font-bold text-white">{item.confidence}%</span>
                      </div>
                      
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${isSafe ? "bg-cyber-success/10 text-cyber-success border border-cyber-success/20" : ""}
                        ${isWarning ? "bg-cyber-warning/10 text-cyber-warning border border-cyber-warning/20" : ""}
                        ${item.threat_level === "dangerous" ? "bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/20 animate-pulse" : ""}
                      `}>
                        {isSafe && <span className="w-1.5 h-1.5 rounded-full bg-cyber-success" />}
                        {isWarning && <span className="w-1.5 h-1.5 rounded-full bg-cyber-warning" />}
                        {item.threat_level === "dangerous" && <FiAlertTriangle className="text-xs" />}
                        {item.threat_level.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      className="px-4 pb-4 border-t border-white/5 bg-slate-950/40 text-xs font-mono text-slate-400 space-y-2 pt-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-500 mb-1 font-bold">ANALYSIS METRIC</p>
                          <div className="space-y-1.5">
                            <p>● ID: ShieldX-{item.id}</p>
                            <p>● Type: {item.type} Vector Classification</p>
                            <p>● Timestamp: {new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1 font-bold">DETECTION ENGINE SIGNATURE</p>
                          <p className="text-slate-300">
                            {isSafe && "No signature anomalies detected. Verified clean heuristics."}
                            {isWarning && "Moderate risks flagged. Review subdomains or character pattern configurations."}
                            {item.threat_level === "dangerous" && "CRITICAL WARNING: The content exhibits known high-urgency keywords or structural spoofing patterns matching malicious databases."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
