import React, { useState } from "react";
import { 
  FiShield, 
  FiGrid, 
  FiSearch, 
  FiMail, 
  FiCpu, 
  FiBookOpen, 
  FiChevronLeft, 
  FiChevronRight,
  FiMenu,
  FiImage
} from "react-icons/fi";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiGrid className="text-xl" /> },
    { id: "url", label: "URL Scanner", icon: <FiSearch className="text-xl" /> },
    { id: "text", label: "SMS & Email", icon: <FiMail className="text-xl" /> },
    { id: "image", label: "Image Shield", icon: <FiImage className="text-xl" /> },
    { id: "qr", label: "QR Scanner", icon: <FiCpu className="text-xl" /> },
    { id: "extension", label: "Extension Demo", icon: <FiShield className="text-xl" /> },
    { id: "docs", label: "API & Models", icon: <FiBookOpen className="text-xl" /> },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-cyber-bg border-b border-cyber-border text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <FiShield className="text-cyber-primary text-2xl animate-pulse" />
          <span className="font-display font-bold tracking-wider text-md bg-gradient-to-r from-white to-cyber-primary bg-clip-text text-transparent">SHIELDX AI</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 border border-cyber-border rounded-md text-slate-300 hover:bg-slate-800"
        >
          <FiMenu className="text-xl" />
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-slate-950/70 border-r border-cyber-border backdrop-blur-xl text-white transition-all duration-300
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:relative lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-cyber-border h-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-cyber-primary/10 rounded-lg border border-cyber-primary/30">
              <FiShield className="text-cyber-primary text-2xl animate-pulse" />
            </div>
            {!isCollapsed && (
              <span className="font-display font-bold tracking-widest text-lg bg-gradient-to-r from-white to-cyber-primary bg-clip-text text-transparent">
                SHIELDX AI
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-md"
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all group relative
                  ${isActive 
                    ? "bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50 border border-transparent"
                  }`}
              >
                {/* Active left indicator */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyber-primary rounded-r-full" />
                )}
                
                <div className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-cyber-primary" : "text-slate-400"}`}>
                  {item.icon}
                </div>
                
                {!isCollapsed && (
                  <span className="font-sans text-sm tracking-wide transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
                
                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-950 border border-cyber-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-6 border-t border-cyber-border text-center">
          {!isCollapsed ? (
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-mono">CORE VERSION v1.0.0</p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyber-success/10 text-cyber-success border border-cyber-success/20 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-ping" />
                AI NODE ACTIVE
              </div>
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-cyber-success mx-auto" title="AI Node Active" />
          )}
        </div>
      </aside>
    </>
  );
};
