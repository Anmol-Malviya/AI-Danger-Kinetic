import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShield, 
  FiGrid, 
  FiSearch, 
  FiMail, 
  FiCpu, 
  FiBookOpen, 
  FiChevronLeft, 
  FiChevronRight,
  FiMenu
} from "react-icons/fi";
import { Logo } from "./Logo";


interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FiGrid, color: "#06b6d4" },
    { id: "url", label: "URL Scanner", icon: FiSearch, color: "#06b6d4" },
    { id: "text", label: "SMS & Image", icon: FiMail, color: "#06b6d4" },
    { id: "qr", label: "QR Scanner", icon: FiCpu, color: "#06b6d4" },
    { id: "extension", label: "Extension Demo", icon: FiShield, color: "#06b6d4" },
    { id: "docs", label: "API & Models", icon: FiBookOpen, color: "#06b6d4" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-cyber-bg border-b border-cyber-border text-white sticky top-0 z-50"
        style={{ backdropFilter: "blur(12px)", background: "rgba(6,11,24,0.95)" }}
      >
        <div className="flex items-center gap-2">
          <Logo size={28} className="animate-pulse-cyan" />
          <span className="font-display font-bold tracking-wider text-md text-gradient-cyber">
            AI DANGER KINETIC
          </span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 border border-cyber-border rounded-md text-slate-300 hover:bg-slate-800 hover:border-cyber-primary/30 transition-all"
        >
          <FiMenu className="text-xl" />
        </button>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col border-r border-cyber-border text-white transition-all duration-300
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:relative lg:translate-x-0`}
        style={{
          background: "linear-gradient(180deg, rgba(8,14,28,0.97) 0%, rgba(6,11,24,0.97) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.5), inset -1px 0 0 rgba(6,182,212,0.05)"
        }}
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center justify-between p-5 border-b border-cyber-border h-20 relative overflow-hidden">
          {/* Subtle scanline on header */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(6,182,212,0.5) 3px, rgba(6,182,212,0.5) 4px)" }}
          />
          
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative group">
              {/* Expanding ring on logo */}
              <div className="absolute inset-0 rounded-lg border border-cyber-primary/20 animate-ping opacity-30" />
              <Logo size={isCollapsed ? 32 : 36} className="relative z-10" />
            </div>
            
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display font-bold tracking-widest text-sm text-gradient-cyber"
              >
                AI DANGER<br/>
                <span className="text-xs tracking-[0.3em] text-cyber-primary/80">KINETIC</span>
              </motion.span>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-500 hover:text-cyber-primary p-1.5 hover:bg-cyber-primary/10 rounded-md border border-transparent hover:border-cyber-primary/20 transition-all"
          >
            {isCollapsed ? <FiChevronRight className="text-sm" /> : <FiChevronLeft className="text-sm" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium transition-all relative overflow-hidden group
                  ${isActive 
                    ? "bg-cyber-primary/12 text-cyber-primary border border-cyber-primary/25" 
                    : "text-slate-500 hover:text-slate-200 border border-transparent hover:bg-white/[0.03]"
                  }`}
                style={isActive ? {
                  boxShadow: "0 0 15px rgba(6,182,212,0.1), inset 0 1px 0 rgba(6,182,212,0.1)"
                } : {}}
              >
                {/* Active left bar */}
                {isActive && (
                  <motion.div 
                    layoutId="activeBar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-cyber-primary"
                    style={{ boxShadow: "0 0 8px rgba(6,182,212,0.8)" }}
                  />
                )}

                {/* Hover background ripple */}
                {hoveredItem === item.id && !isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-primary/5 to-transparent pointer-events-none"
                  />
                )}
                
                {/* Icon with neon flash on hover */}
                <div className={`relative transition-all duration-200 flex-shrink-0
                  ${isActive ? "text-cyber-primary" : "text-slate-500 group-hover:text-slate-200"}
                `}>
                  <Icon className="text-lg" />
                  {/* Icon glow dot */}
                  {isActive && (
                    <div className="absolute -inset-1 rounded-full bg-cyber-primary/20 blur-sm -z-10" />
                  )}
                </div>
                
                {/* Label */}
                {!isCollapsed && (
                  <span className="text-sm tracking-wide font-sans whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                
                {/* Active indicator dot (collapsed) */}
                {isCollapsed && isActive && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyber-primary"
                    style={{ boxShadow: "0 0 6px rgba(6,182,212,0.9)" }}
                  />
                )}
                
                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="absolute left-full ml-3 px-3 py-1.5 bg-slate-950 border border-cyber-border rounded-lg text-xs whitespace-nowrap text-slate-200 pointer-events-none z-50 shadow-xl"
                        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.1)" }}
                      >
                        <span className="font-mono tracking-wider text-cyber-primary">{item.label}</span>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-slate-950" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-cyber-border">
          {!isCollapsed ? (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-600 font-mono tracking-widest text-center">CORE VERSION v1.0.0</p>
              <div className="flex items-center justify-center gap-2">
                {/* Heartbeat node */}
                <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyber-success/8 border border-cyber-success/15">
                  <div className="relative w-2 h-2 flex items-center justify-center">
                    <span className="absolute w-2 h-2 rounded-full bg-cyber-success animate-ping opacity-40" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-heartbeat"
                      style={{ boxShadow: "0 0 6px rgba(34,197,94,0.8)" }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-cyber-success tracking-widest">AI NODE ACTIVE</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative w-3 h-3 flex items-center justify-center" title="AI Node Active">
                <span className="absolute w-3 h-3 rounded-full bg-cyber-success animate-ping opacity-40" />
                <span className="w-2 h-2 rounded-full bg-cyber-success animate-heartbeat"
                  style={{ boxShadow: "0 0 6px rgba(34,197,94,0.8)" }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
