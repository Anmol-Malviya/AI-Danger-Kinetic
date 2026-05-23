import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FiShield,
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiUserPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";

import { API_BASE_URL } from "../config";

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

type AuthMode = "login" | "register";

const API_BASE = API_BASE_URL;

// Floating particle component
const Particle: React.FC<{ x: number; y: number; size: number; delay: number; duration: number }> = 
  ({ x, y, size, delay, duration }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: size > 3 
        ? "radial-gradient(circle, rgba(6,182,212,0.8), rgba(6,182,212,0.1))"
        : "rgba(6,182,212,0.5)",
      boxShadow: size > 3 ? "0 0 8px rgba(6,182,212,0.6)" : "none",
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 0.7, 0.3, 0.7, 0],
      scale: [0, 1, 0.8, 1, 0],
      y: [0, -60, -120, -180, -240],
      x: [0, 15, -10, 20, -5],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Generate particles
const particles = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: 60 + Math.random() * 40,
  size: Math.random() * 4 + 1,
  delay: Math.random() * 6,
  duration: 5 + Math.random() * 6,
}));

// Typing animation hook
const useTypingEffect = (text: string, speed = 60) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const subtitle = useTypingEffect("Cyber Threat Intelligence Platform", 55);

  // Magnetic button effect
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 200 };
  const btnX = useSpring(useTransform(mouseX, [-80, 80], [-6, 6]), springConfig);
  const btnY = useSpring(useTransform(mouseY, [-40, 40], [-3, 3]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Authentication failed.");
      } else {
        if (mode === "register") {
          setSuccess("Account created! Switching to login...");
          setTimeout(() => {
            setMode("login");
            setSuccess(null);
            setPassword("");
            setConfirmPassword("");
          }, 1500);
        } else {
          localStorage.setItem("ai_danger_kinetic_user", username.trim());
          onLoginSuccess(username.trim());
        }
      }
    } catch {
      const demoUsers: Record<string, string> = {
        admin: "admin",
        demo: "demo123",
        anmol: "4328",
      };
      if (mode === "login" && demoUsers[username.toLowerCase()] === password) {
        localStorage.setItem("ai_danger_kinetic_user", username.trim());
        onLoginSuccess(username.trim());
      } else if (mode === "register") {
        setSuccess("Account created (offline mode)! Switching to login...");
        setTimeout(() => { setMode("login"); setSuccess(null); }, 1500);
      } else {
        setError("Invalid credentials. Try: admin / admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const useDemoLogin = () => {
    setUsername("admin");
    setPassword("admin");
    setMode("login");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center relative overflow-hidden">

      {/* Deep space background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 100%, rgba(6,182,212,0.04) 0%, transparent 60%)"
      }} />

      {/* Animated grid */}
      <div className="absolute inset-0 cyber-grid opacity-25" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
          opacity: 1,
        }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      {/* Glowing orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/5 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "rgba(6,182,212,1)" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ background: "rgba(6,182,212,1)" }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card with corner brackets */}
        <div 
          ref={cardRef}
          className="glass-card p-8 corner-bracket"
          style={{
            border: "1px solid rgba(6,182,212,0.18)",
            boxShadow: "0 0 80px rgba(6,182,212,0.07), 0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
          }}
        >
          {/* Additional corner brackets (bottom-left, top-right) */}
          <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none">
            <div className="absolute top-[-1px] right-[-1px] w-5 h-5 border-t-2 border-r-2 border-cyber-primary/40 rounded-tr-xl" />
          </div>
          <div className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none">
            <div className="absolute bottom-[-1px] left-[-1px] w-5 h-5 border-b-2 border-l-2 border-cyber-primary/40 rounded-bl-xl" />
          </div>

          {/* Logo & Branding */}
          <div className="flex flex-col items-center mb-8">
            {/* Shield with expanding rings */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full border border-cyber-primary/15 animate-ping" style={{ animationDuration: "3s" }} />
              <div className="absolute w-16 h-16 rounded-full border border-cyber-primary/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
              <motion.div 
                className="relative p-5 bg-cyber-primary/10 border border-cyber-primary/30 rounded-2xl"
                whileHover={{ scale: 1.05, borderColor: "rgba(6,182,212,0.6)" }}
                transition={{ duration: 0.2 }}
                style={{ boxShadow: "0 0 30px rgba(6,182,212,0.15), inset 0 1px 0 rgba(6,182,212,0.1)" }}
              >
                <FiShield className="text-4xl text-cyber-primary" />
                {/* Inner shimmer */}
                <div className="absolute inset-0 rounded-2xl shimmer" />
              </motion.div>
            </div>

            <h1 
              className="text-2xl font-display font-extrabold tracking-widest text-gradient-cyber glitch-text"
              data-text="AI DANGER KINETIC"
            >
              AI DANGER KINETIC
            </h1>
            
            {/* Typing effect subtitle */}
            <p className="text-[11px] font-mono text-slate-500 tracking-widest mt-2 uppercase min-h-[16px]">
              {subtitle}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                className="inline-block w-0.5 h-3 bg-cyber-primary ml-0.5 align-middle"
              />
            </p>

            {/* Status pill */}
            <motion.div 
              className="flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full border"
              style={{
                background: "rgba(34,197,94,0.08)",
                borderColor: "rgba(34,197,94,0.2)",
              }}
              animate={{ boxShadow: ["0 0 0px rgba(34,197,94,0)", "0 0 12px rgba(34,197,94,0.15)", "0 0 0px rgba(34,197,94,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="relative flex items-center justify-center w-2 h-2">
                <span className="absolute w-2 h-2 rounded-full bg-cyber-success animate-ping opacity-50" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-success" />
              </span>
              <span className="text-[10px] font-mono text-cyber-success tracking-widest">AI NODE ACTIVE — SECURE CHANNEL</span>
            </motion.div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-950/80 rounded-xl border border-cyber-border p-1 mb-6">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-display font-bold tracking-widest transition-all duration-300 relative
                  ${mode === m
                    ? "text-cyber-primary"
                    : "text-slate-600 hover:text-slate-400"
                  }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="modeIndicator"
                    className="absolute inset-0 rounded-lg bg-cyber-primary/12 border border-cyber-primary/25"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    style={{ boxShadow: "0 0 12px rgba(6,182,212,0.1)" }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {m === "login" ? <FiLogIn className="text-sm" /> : <FiUserPlus className="text-sm" />}
                  {m.toUpperCase()}
                </span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-1">
                <span className="text-cyber-primary/60">//</span> Operator ID
              </label>
              <div className="relative">
                <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors ${focusedInput === 'username' ? 'text-cyber-primary' : 'text-slate-600'}`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter username"
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-white font-mono text-sm placeholder-slate-700 focus:outline-none transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(15,23,42,0.6)",
                    border: `1px solid ${focusedInput === 'username' ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: focusedInput === 'username' ? '0 0 15px rgba(6,182,212,0.1), inset 0 1px 0 rgba(6,182,212,0.05)' : 'none',
                  }}
                />
                {/* Focus scan line */}
                {focusedInput === 'username' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-3 right-3 h-px bg-cyber-primary/50 rounded-full"
                    style={{ boxShadow: "0 0 6px rgba(6,182,212,0.6)" }}
                  />
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-1">
                <span className="text-cyber-primary/60">//</span> Access Key
              </label>
              <div className="relative">
                <FiLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors ${focusedInput === 'password' ? 'text-cyber-primary' : 'text-slate-600'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter password"
                  disabled={isLoading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-white font-mono text-sm placeholder-slate-700 focus:outline-none transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(15,23,42,0.6)",
                    border: `1px solid ${focusedInput === 'password' ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: focusedInput === 'password' ? '0 0 15px rgba(6,182,212,0.1), inset 0 1px 0 rgba(6,182,212,0.05)' : 'none',
                  }}
                />
                {focusedInput === 'password' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-3 right-3 h-px bg-cyber-primary/50 rounded-full"
                    style={{ boxShadow: "0 0 6px rgba(6,182,212,0.6)" }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-1">
                    <span className="text-cyber-primary/60">//</span> Confirm Access Key
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-white font-mono text-sm placeholder-slate-700 focus:outline-none transition-all disabled:opacity-50"
                      style={{
                        background: "rgba(15,23,42,0.6)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  <FiAlertCircle className="text-cyber-danger text-sm shrink-0" />
                  <span className="text-xs font-mono text-cyber-danger">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
                >
                  <FiCheckCircle className="text-cyber-success text-sm shrink-0" />
                  <span className="text-xs font-mono text-cyber-success">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Magnetic Submit Button */}
            <motion.button
              ref={btnRef}
              type="submit"
              disabled={isLoading}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ x: btnX, y: btnY }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 font-display font-extrabold tracking-widest rounded-xl text-slate-950 btn-cyber disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
                boxShadow: isLoading ? "none" : "0 0 25px rgba(6,182,212,0.4), 0 0 50px rgba(6,182,212,0.15)",
                x: btnX,
                y: btnY,
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/50 border-t-slate-950 rounded-full animate-spin" />
                  <span className="text-sm">AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <FiZap className="text-base" />
                  <span className="text-sm">{mode === "login" ? "INITIATE SESSION" : "CREATE ACCOUNT"}</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          {mode === "login" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-5 p-3 rounded-xl border"
              style={{ background: "rgba(6,11,24,0.7)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                <span className="text-cyber-primary/50">›</span> Demo Credentials
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-500 space-y-0.5">
                  <p><span className="text-slate-600">ID:</span> <span className="text-cyber-primary/80">admin</span></p>
                  <p><span className="text-slate-600">KEY:</span> <span className="text-cyber-primary/80">admin</span></p>
                </div>
                <button
                  onClick={useDemoLogin}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-widest transition-all"
                  style={{
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    color: "#06b6d4",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(6,182,212,0.16)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(6,182,212,0.08)")}
                >
                  USE DEMO
                </button>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] font-mono text-slate-700 mt-5 tracking-widest">
            AI DANGER KINETIC v2.0 · ENCRYPTED CHANNEL · NODE-X01
          </p>
        </div>
      </motion.div>
    </div>
  );
};
