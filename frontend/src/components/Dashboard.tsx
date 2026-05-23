import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShield, 
  FiAlertTriangle, 
  FiActivity, 
  FiDownload, 
  FiRefreshCw, 
  FiClock,
  FiZap,
  FiSearch,
  FiMail,
  FiCpu,
  FiGlobe,
  FiMessageSquare,
  FiChevronDown,
  FiInbox,
  FiInfo
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
  const [searchQuery, setSearchQuery] = useState("");

  // Mouse-track glow for quick-launch cards
  const [mousePos, setMousePos] = useState<Record<string, { x: number; y: number }>>({});

  const handleCardMouseMove = useCallback((id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos(prev => ({ ...prev, [id]: { x: e.clientX - rect.left, y: e.clientY - rect.top } }));
  }, []);
  const handleCardMouseLeave = useCallback((id: string) => {
    setMousePos(prev => { const n = { ...prev }; delete n[id]; return n; });
  }, []);

  // Quick-launch scanner definitions
  const quickLaunch = [
    { id: "url", title: "URL SCANNER", desc: "Scan domain spoofing & SSL certs", icon: FiSearch },
    { id: "text", title: "SMS & EMAIL", desc: "Analyze spam/scam textual intent", icon: FiMail },
    { id: "qr", title: "QR SCANNER", desc: "Unpack links hidden in QR codes", icon: FiCpu },
  ];

  // Stagger animation variants
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
  };

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="text-3xl text-cyber-primary animate-spin" />
          <p className="font-mono text-slate-400">CONNECTING TO AI DANGER KINETIC SECURITY CORE...</p>
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
    const matchesFilter = filter === "all" ? true : item.threat_level === filter;
    const matchesSearch = searchQuery.trim() === "" 
      ? true 
      : item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
    doc.text("AI DANGER KINETIC - SECURITY AUDIT REPORT", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    doc.text("AI Danger Kinetic Detection System | Version 1.0.0", 20, 42);

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
    doc.save("AI_Danger_Kinetic_Security_Report.pdf");
  };


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 cyber-grid p-2 min-h-full"
    >
      {/* Title & Controls */}
      <motion.div variants={cardVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-6">
        <div>
          <h1 
            className="text-3xl font-display font-extrabold tracking-wider glitch-text text-gradient-cyber"
            data-text="SECURITY CONTROL CENTER"
          >
            SECURITY CONTROL CENTER
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            <span className="text-cyber-primary/50">›</span> Real-time Threat Monitoring & Scam Classifier Engines
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            onClick={refreshData}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 border border-cyber-border rounded-xl text-sm font-mono tracking-wider transition-all disabled:opacity-50 group"
            style={{ background: "rgba(15,23,42,0.6)", color: isLoading ? "#06b6d4" : "#94a3b8" }}
          >
            <FiRefreshCw className={`text-sm transition-transform ${isLoading ? "animate-spin text-cyber-primary" : "group-hover:rotate-180 duration-500"}`} />
            <span>FORCE REFRESH</span>
          </motion.button>
          
          <motion.button 
            onClick={handleDownloadPDF}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(6,182,212,0.5)" }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-950 font-display font-bold text-sm btn-cyber"
            style={{
              background: "linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)",
              boxShadow: "0 0 20px rgba(6,182,212,0.3)",
            }}
          >
            <FiDownload />
            <span>EXPORT PDF</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Grid: Gauge + Distribution + Breakdown */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular Gauge Card */}
        <motion.div variants={cardVariants} className="glass-card p-6 flex flex-col items-center justify-center" style={{ borderLeft: "2px solid rgba(6,182,212,0.6)", boxShadow: "inset 2px 0 20px rgba(6,182,212,0.05)" }}>
          <h2 className="text-xs font-display font-bold tracking-[0.2em] text-slate-500 uppercase text-center mb-2">
            AI Threat Meter
          </h2>
          <ThreatMeter score={stats.threat_score} />
          <p className="text-[10px] text-slate-600 font-mono text-center mt-1">
            Combined ML Confidence & Heuristics Vectors
          </p>
        </motion.div>

        {/* Explain Risk Card */}
        <motion.div variants={cardVariants} className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-cyber-primary/10 rounded-lg border border-cyber-primary/20">
                <FiShield className="text-cyber-primary text-base" />
              </div>
              <h2 className="text-xs font-display font-bold tracking-[0.15em] text-slate-400 uppercase">
                AI RISK EXPLANATION
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {stats.description}
            </p>
          </div>

          <div className="pt-4 border-t border-cyber-border grid grid-cols-3 gap-2">
            {[
              { label: "TOTAL SCANS", value: stats.total_scans, color: "text-white", bg: "bg-slate-900/40" },
              { label: "SAFE INDEX", value: `${stats.total_scans > 0 ? Math.round((stats.metrics.safe / stats.total_scans) * 100) : 0}%`, color: "text-cyber-success", bg: "bg-cyber-success/5 border border-cyber-success/15" },
              { label: "THREAT INDEX", value: `${stats.total_scans > 0 ? Math.round((stats.metrics.dangerous / stats.total_scans) * 100) : 0}%`, color: "text-cyber-danger", bg: "bg-cyber-danger/5 border border-cyber-danger/15" },
            ].map(({ label, value, color, bg }) => (
              <motion.div key={label} whileHover={{ scale: 1.04 }} className={`text-center p-2 rounded-lg ${bg}`}>
                <span className="text-[10px] text-slate-600 font-mono block">{label}</span>
                <span className={`text-lg font-display font-bold block ${color}`}>{value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chart Card */}
        <motion.div variants={cardVariants} className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-cyber-primary/10 rounded-lg border border-cyber-primary/20">
              <FiActivity className="text-cyber-primary text-base" />
            </div>
            <h2 className="text-xs font-display font-bold tracking-[0.15em] text-slate-400 uppercase">
              RISK DISTRIBUTION
            </h2>
          </div>
          <div className="relative flex-grow flex flex-col justify-between mt-2">
            {stats.total_scans === 0 ? (
              <div className="flex-1 flex items-center justify-center min-h-[160px]">
                <p className="text-xs font-mono text-slate-600">No scanned items found.</p>
              </div>
            ) : (
              <>
                <div className="w-full h-[140px] flex items-center justify-center">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
                <div className="mt-4 pt-3 border-t border-cyber-border space-y-2 font-mono text-[10px] text-slate-400">
                  <div className="flex justify-between items-center px-1">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyber-success" /> SAFE ELEMENTS</span>
                    <span className="font-bold text-slate-300">{stats.metrics.safe} ({stats.total_scans > 0 ? Math.round((stats.metrics.safe / stats.total_scans) * 100) : 0}%)</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyber-warning" /> SUSPICIOUS WARNINGS</span>
                    <span className="font-bold text-slate-300">{stats.metrics.warning} ({stats.total_scans > 0 ? Math.round((stats.metrics.warning / stats.total_scans) * 100) : 0}%)</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyber-danger" /> BLOCKED THREATS</span>
                    <span className="font-bold text-slate-300">{stats.metrics.dangerous} ({stats.total_scans > 0 ? Math.round((stats.metrics.dangerous / stats.total_scans) * 100) : 0}%)</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Quick launch scanners — mouse-reactive glow */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLaunch.map(({ id, title, desc, icon: Icon }) => (
          <motion.div
            key={id}
            variants={cardVariants}
            onClick={() => setActiveTab(id)}
            onMouseMove={(e) => handleCardMouseMove(id, e)}
            onMouseLeave={() => handleCardMouseLeave(id)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-5 cursor-pointer flex items-center justify-between group relative overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: mousePos[id] ? "0 0 20px rgba(6,182,212,0.12)" : "none",
            }}
          >
            {/* Mouse-track radial glow */}
            {mousePos[id] && (
              <div
                className="absolute pointer-events-none rounded-full"
                style={{
                  width: 200,
                  height: 200,
                  left: mousePos[id].x - 100,
                  top: mousePos[id].y - 100,
                  background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
                }}
              />
            )}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="text-cyber-primary text-sm" />
                <h3 className="text-sm font-bold text-white font-display tracking-wider">{title}</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">{desc}</p>
            </div>
            <motion.div 
              className="relative z-10 w-9 h-9 rounded-xl bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center text-cyber-primary flex-shrink-0"
              whileHover={{ rotate: 45, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <FiZap className="text-sm" />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Live History logs */}
      <motion.div variants={cardVariants} className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyber-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyber-primary/10 rounded-lg border border-cyber-primary/20">
              <FiClock className="text-cyber-primary text-base" />
            </div>
            <h2 className="text-xs font-display font-bold tracking-[0.15em] text-slate-400 uppercase">
              LIVE SCANNER HISTORY LOGS
            </h2>
            {/* Live dot */}
            <div className="flex items-center gap-1 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-ping opacity-60" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-success" style={{ boxShadow: "0 0 5px rgba(34,197,94,0.8)", marginLeft: -10 }} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-grow sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <FiSearch className="text-xs text-cyber-primary" />
              </span>
              <input
                type="text"
                placeholder="SEARCH SCANS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-cyber-border bg-slate-950/60 text-slate-200 font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-cyber-primary/60 focus:ring-1 focus:ring-cyber-primary/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500 hover:text-slate-300 font-mono text-[9px] font-bold"
                >
                  CLEAR
                </button>
              )}
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-cyber-border" style={{ background: "rgba(6,11,24,0.8)" }}>
              {(["all", "safe", "warning", "dangerous"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`relative px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all
                    ${filter === type 
                      ? "text-cyber-primary font-bold" 
                      : "text-slate-600 hover:text-slate-400"
                    }`}
                >
                  {filter === type && (
                    <motion.div
                      layoutId="filterBg"
                      className="absolute inset-0 rounded-lg bg-cyber-primary/15 border border-cyber-primary/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  <span className="relative z-10">{type.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-slate-600 font-mono text-xs gap-2"
              >
                <FiInbox className="text-2xl text-slate-700" />
                <span>NO SCAN RECORDS FOUND.</span>
              </motion.div>
            ) : (
              filteredHistory.map((item, index) => {
                const isExpanded = expandedLogId === item.id;
                const isSafe = item.threat_level === "safe";
                const isWarning = item.threat_level === "warning";
                const isDanger = item.threat_level === "dangerous";
                
                const borderColor = isSafe 
                  ? "rgba(34,197,94,0.15)" 
                  : isWarning 
                    ? "rgba(245,158,11,0.15)" 
                    : "rgba(239,68,68,0.2)";

                const hoverBorderColor = isSafe
                  ? "rgba(34,197,94,0.35)"
                  : isWarning
                    ? "rgba(245,158,11,0.35)"
                    : "rgba(239,68,68,0.45)";

                const getLogIcon = (type: string) => {
                  switch (type.toLowerCase()) {
                    case "url":
                      return <FiGlobe className="text-cyan-400 text-sm" />;
                    case "sms":
                      return <FiMessageSquare className="text-purple-400 text-sm" />;
                    case "email":
                      return <FiMail className="text-emerald-400 text-sm" />;
                    case "qr code":
                      return <FiCpu className="text-amber-400 text-sm" />;
                    default:
                      return <FiSearch className="text-slate-400 text-sm" />;
                  }
                };

                const logIcon = getLogIcon(item.type);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                    className="rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                    style={{ 
                      border: `1px solid ${borderColor}`, 
                      background: "rgba(15,23,42,0.4)" 
                    }}
                    whileHover={{ 
                      background: "rgba(15,23,42,0.75)",
                      borderColor: hoverBorderColor,
                      boxShadow: isDanger 
                        ? "0 0 15px rgba(239,68,68,0.06)" 
                        : isWarning 
                          ? "0 0 15px rgba(245,158,11,0.06)" 
                          : "0 0 15px rgba(6,182,212,0.06)"
                    }}
                    onClick={() => setExpandedLogId(isExpanded ? null : item.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                      <div className="flex items-center gap-3">
                        {/* Icon Container */}
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center border animate-pulse-cyan"
                          style={{
                            background: "rgba(6,11,24,0.8)",
                            borderColor: borderColor
                          }}
                        >
                          {logIcon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span 
                            className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase"
                          >
                            {item.type}
                          </span>
                          <span className="text-xs text-slate-300 font-mono truncate max-w-xs sm:max-w-sm md:max-w-md">
                            {item.target}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 justify-between sm:justify-end">
                        <div className="text-[10px] font-mono">
                          <span className="text-slate-600">CONF:</span>{" "}
                          <span className="text-white font-bold">{item.confidence}%</span>
                        </div>
                        
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono tracking-wider
                          ${isSafe ? "bg-cyber-success/10 text-cyber-success border border-cyber-success/20" : ""}
                          ${isWarning ? "bg-cyber-warning/10 text-cyber-warning border border-cyber-warning/20" : ""}
                          ${isDanger ? "bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/25" : ""}
                        `}
                        style={isDanger ? { animation: "pulse-cyan 1.5s infinite", boxShadow: "0 0 8px rgba(239,68,68,0.2)" } : {}}
                        >
                          {isSafe && <span className="w-1.5 h-1.5 rounded-full bg-cyber-success" />}
                          {isWarning && <span className="w-1.5 h-1.5 rounded-full bg-cyber-warning" />}
                          {isDanger && <FiAlertTriangle className="text-xs" />}
                          {item.threat_level.toUpperCase()}
                        </span>

                        {/* Chevron Expand Indicator */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-slate-500 hidden sm:block"
                        >
                          <FiChevronDown className="text-sm" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-white/5 text-[11px] font-mono text-slate-400 space-y-2 pt-3" style={{ background: "rgba(6,11,24,0.5)" }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
                                <p className="text-slate-500 mb-2 font-bold tracking-wider text-[10px]">ANALYSIS METRIC</p>
                                <div className="space-y-1 text-slate-400">
                                  <p><span className="text-cyber-primary/60 mr-1.5">›</span> <span className="text-slate-500">ID:</span> ADK-{item.id}</p>
                                  <p><span className="text-cyber-primary/60 mr-1.5">›</span> <span className="text-slate-500">TYPE:</span> {item.type} Vector</p>
                                  <p><span className="text-cyber-primary/60 mr-1.5">›</span> <span className="text-slate-500">CONFIDENCE:</span> {item.confidence}%</p>
                                  <p><span className="text-cyber-primary/60 mr-1.5">›</span> <span className="text-slate-500">TIMESTAMP:</span> {new Date(item.timestamp).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                                <div>
                                  <p className="text-slate-500 mb-2 font-bold tracking-wider text-[10px]">DETECTION ENGINE SIGNATURE</p>
                                  <p className="text-slate-300 leading-relaxed">
                                    {isSafe && "No signature anomalies detected. Heuristic scanning reports fully clean payload. Matches low-risk classification matrices."}
                                    {isWarning && "Moderate risks flagged. Detected warning indicators or suspicious TLD/formatting. Exercise validation caution before interaction."}
                                    {isDanger && "CRITICAL WARNING: The analyzed item matches high-risk heuristics or contains known urgency/lottery deception keywords."}
                                  </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-slate-500">
                                  <FiInfo className="text-cyber-primary text-xs" />
                                  <span>Dynamic Heuristics Scan Signature Verified</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
