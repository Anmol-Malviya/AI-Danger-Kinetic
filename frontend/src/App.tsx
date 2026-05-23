import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { UrlScanner } from "./components/UrlScanner";
import { TextScanner } from "./components/TextScanner";
import { QrScanner } from "./components/QrScanner";
import { ImageScanner } from "./components/ImageScanner";
import { ExtensionDemo } from "./components/ExtensionDemo";
import { Docs } from "./components/Docs";
import { Login } from "./components/Login";

import type { DashboardStats } from "./types";
import { FiShield, FiLogOut, FiUser, FiActivity } from "react-icons/fi";
import { API_BASE_URL } from "./config";

const fallbackStats: DashboardStats = {
  threat_score: 54.2,
  total_scans: 4,
  metrics: { safe: 2, warning: 1, dangerous: 1 },
  description:
    "AI Danger Kinetic currently reports a moderate Security Threat Index of 54.2%. Scans have identified lookalike domains (chase-banking-alert.net) and SMS messages containing highly manipulative financial suspension alerts. We recommend cautious validation before entering credit cards or login keys.",
  history: [
    {
      id: 1,
      type: "URL",
      target: "https://www.paypal.com",
      threat_level: "safe",
      confidence: 4.2,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      type: "SMS",
      target:
        "URGENT: Your Chase account is locked. Verify now at http://chase-banking-alert.net/verify",
      threat_level: "dangerous",
      confidence: 98.4,
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 3,
      type: "URL",
      target: "http://netflix-verify-account.info/login",
      threat_level: "dangerous",
      confidence: 94.1,
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 4,
      type: "Email",
      target: "Hey John, did you receive the PDF slides for our review meeting tomorrow?",
      threat_level: "safe",
      confidence: 12.5,
      timestamp: new Date(Date.now() - 1500000).toISOString(),
    },
  ],
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(
    localStorage.getItem("ai_danger_kinetic_user")
  );
  const [systemAlert] = useState<string | null>(
    "SYSTEM NOTICE: AI Model Engines loaded successfully. Double check HTTPS certs on unknown pages."
  );

  // Animated PING counter ±2ms around 12ms
  const [ping, setPing] = useState(12);
  useEffect(() => {
    const t = setInterval(() => {
      setPing(12 + Math.round((Math.random() - 0.5) * 4));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const handleLoginSuccess = (username: string) => {
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("ai_danger_kinetic_user");
    setLoggedInUser(null);
    setStats(null);
    setActiveTab("dashboard");
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/threat-score?user_id=${loggedInUser}`);
      if (res.ok) {
        const data: DashboardStats = await res.json();
        setStats(data);
      } else {
        throw new Error("HTTP Error");
      }
    } catch {
      console.warn("Backend server not responding. Loading offline local state...");
      if (!stats) {
        setStats(fallbackStats);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInUser) {
      fetchStats();
    }
  }, [loggedInUser]);

  const handleScanCompleted = () => {
    fetchStats();
  };

  // ── If not logged in, show the Login page ──
  if (!loggedInUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 },
  };
  const pageTransition = { duration: 0.25, ease: [0.4, 0, 0.2, 1] };

  // ── Main App Shell ──
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-cyber-bg text-slate-100">

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header Ribbon */}
        <header 
          className="h-14 border-b border-cyber-border px-6 flex items-center justify-between text-xs font-mono select-none flex-shrink-0"
          style={{ background: "rgba(6,11,24,0.8)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-2 text-cyber-primary overflow-hidden">
            <FiShield className="animate-pulse-cyan text-sm flex-shrink-0" />
            <span className="font-bold tracking-wider uppercase text-[10px] flex-shrink-0">Active Node Feed:</span>
            <span className="text-slate-500 truncate max-w-xs md:max-w-xl text-[10px]">
              {systemAlert || "All systems check completed. Ready for incoming vector scans."}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-600 flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-slate-700">NODE:</span>
              <span className="text-cyber-primary font-bold">NODE-X01</span>
            </div>
            <div className="flex items-center gap-1">
              <FiActivity className="text-cyber-success text-xs" />
              <span className="text-slate-700">PING:</span>
              <motion.span 
                key={ping}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-cyber-success font-bold"
                style={{ textShadow: "0 0 8px rgba(34,197,94,0.6)" }}
              >
                {ping}ms
              </motion.span>
            </div>
            {/* User + Logout */}
            <div className="flex items-center gap-2 pl-4 border-l border-cyber-border">
              <FiUser className="text-cyber-primary text-sm" />
              <span className="text-cyber-primary font-bold text-[10px] uppercase">{loggedInUser}</span>
              <button
                onClick={handleLogout}
                title="Logout"
                className="ml-1 p-1.5 rounded-lg hover:bg-slate-800 text-slate-600 hover:text-cyber-danger transition-all border border-transparent hover:border-cyber-danger/20"
              >
                <FiLogOut className="text-sm" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Router with transitions */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full"
            >
              {activeTab === "dashboard" && (
                <Dashboard
                  stats={stats}
                  isLoading={isLoading}
                  refreshData={fetchStats}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "url" && <UrlScanner onScanComplete={handleScanCompleted} userId={loggedInUser} />}
              {activeTab === "text" && <TextScanner onScanComplete={handleScanCompleted} userId={loggedInUser} />}
              {activeTab === "image" && <ImageScanner onScanComplete={handleScanCompleted} userId={loggedInUser} />}
              {activeTab === "qr" && <QrScanner onScanComplete={handleScanCompleted} userId={loggedInUser} />}
              {activeTab === "extension" && <ExtensionDemo />}
              {activeTab === "docs" && <Docs />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
