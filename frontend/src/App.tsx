import React, { useState, useEffect } from "react";
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
import { FiShield, FiLogOut, FiUser } from "react-icons/fi";

const API_BASE_URL = "http://127.0.0.1:8000";

const fallbackStats: DashboardStats = {
  threat_score: 54.2,
  total_scans: 4,
  metrics: { safe: 2, warning: 1, dangerous: 1 },
  description:
    "ShieldX AI currently reports a moderate Security Threat Index of 54.2%. Scans have identified lookalike domains (chase-banking-alert.net) and SMS messages containing highly manipulative financial suspension alerts. We recommend cautious validation before entering credit cards or login keys.",
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
    localStorage.getItem("shieldx_user")
  );
  const [systemAlert] = useState<string | null>(
    "SYSTEM NOTICE: AI Model Engines loaded successfully. Double check HTTPS certs on unknown pages."
  );

  const handleLoginSuccess = (username: string) => {
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("shieldx_user");
    setLoggedInUser(null);
    setStats(null);
    setActiveTab("dashboard");
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/threat-score`);
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

  // ── Main App Shell ──
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-cyber-bg text-slate-100">

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Header Ribbon */}
        <header className="h-14 bg-slate-950/40 border-b border-cyber-border px-6 flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-2 text-cyber-primary overflow-hidden">
            <FiShield className="animate-pulse text-sm" />
            <span className="font-bold tracking-wider uppercase text-[10px]">Active Node Feed:</span>
            <span className="text-slate-400 truncate max-w-xs md:max-w-xl">
              {systemAlert || "All systems check completed. Ready for incoming vector scans."}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-500">
            <div>
              <span>NODE: </span>
              <span className="text-cyber-primary font-bold">NODE-X01</span>
            </div>
            <div>
              <span>PING: </span>
              <span className="text-cyber-success font-bold">12ms</span>
            </div>
            {/* Logged-in user + Logout */}
            <div className="flex items-center gap-2 pl-4 border-l border-cyber-border">
              <FiUser className="text-cyber-primary text-sm" />
              <span className="text-cyber-primary font-bold text-xs font-mono uppercase">
                {loggedInUser}
              </span>
              <button
                onClick={handleLogout}
                title="Logout"
                className="ml-1 p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-cyber-danger transition-all"
              >
                <FiLogOut className="text-sm" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Router */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <Dashboard
              stats={stats}
              isLoading={isLoading}
              refreshData={fetchStats}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "url" && <UrlScanner onScanComplete={handleScanCompleted} />}
          {activeTab === "text" && <TextScanner onScanComplete={handleScanCompleted} />}
          {activeTab === "image" && <ImageScanner onScanComplete={handleScanCompleted} />}
          {activeTab === "qr" && <QrScanner onScanComplete={handleScanCompleted} />}
          {activeTab === "extension" && <ExtensionDemo />}
          {activeTab === "docs" && <Docs />}
        </main>
      </div>
    </div>
  );
};

export default App;
