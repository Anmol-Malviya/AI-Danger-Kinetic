import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/fi";

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

type AuthMode = "login" | "register";

const API_BASE = "http://127.0.0.1:8000";

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
          // Save session to localStorage
          localStorage.setItem("shieldx_user", username.trim());
          onLoginSuccess(username.trim());
        }
      }
    } catch {
      // Fallback: demo offline login
      const demoUsers: Record<string, string> = {
        admin: "admin",
        demo: "demo123",
        anmol: "4328",
      };
      if (mode === "login" && demoUsers[username.toLowerCase()] === password) {
        localStorage.setItem("shieldx_user", username.trim());
        onLoginSuccess(username.trim());
      } else if (mode === "register") {
        setSuccess("Account created (offline mode)! Switching to login...");
        setTimeout(() => {
          setMode("login");
          setSuccess(null);
        }, 1500);
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

      {/* Animated background grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
        }}
      />

      {/* Main login card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="glass-card p-8 border border-cyber-primary/20 shadow-[0_0_60px_rgba(6,182,212,0.08)]">

          {/* Logo & Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-cyber-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 bg-cyber-primary/10 border border-cyber-primary/30 rounded-full">
                <FiShield className="text-4xl text-cyber-primary" />
              </div>
            </div>

            <h1 className="text-2xl font-display font-extrabold tracking-widest text-white bg-gradient-to-r from-white to-cyber-primary bg-clip-text text-transparent">
              SHIELDX AI
            </h1>
            <p className="text-[11px] font-mono text-slate-500 tracking-widest mt-1 uppercase">
              Cyber Threat Intelligence Platform
            </p>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-cyber-success/10 border border-cyber-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-ping" />
              <span className="text-[10px] font-mono text-cyber-success">AI NODE ACTIVE — SECURE CHANNEL</span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-950 rounded-lg border border-cyber-border p-1 mb-6">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-display font-bold tracking-widest transition-all duration-200
                  ${mode === m
                    ? "bg-cyber-primary/15 text-cyber-primary border border-cyber-primary/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "text-slate-500 hover:text-slate-300"
                  }`}
              >
                {m === "login" ? <FiLogIn className="text-sm" /> : <FiUserPlus className="text-sm" />}
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">
                Operator ID
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-cyber-border rounded-lg text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-cyber-primary focus:shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">
                Access Key
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/60 border border-cyber-border rounded-lg text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-cyber-primary focus:shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">
                    Confirm Access Key
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-cyber-border rounded-lg text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-cyber-primary transition-all disabled:opacity-50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error / Success alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-cyber-danger/10 border border-cyber-danger/30 rounded-lg"
                >
                  <FiAlertCircle className="text-cyber-danger text-sm shrink-0" />
                  <span className="text-xs font-mono text-cyber-danger">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-cyber-success/10 border border-cyber-success/30 rounded-lg"
                >
                  <FiCheckCircle className="text-cyber-success text-sm shrink-0" />
                  <span className="text-xs font-mono text-cyber-success">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyber-primary text-slate-950 font-display font-extrabold tracking-widest rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:from-cyan-500 hover:to-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  {mode === "login" ? <FiLogIn /> : <FiUserPlus />}
                  {mode === "login" ? "INITIATE SESSION" : "CREATE ACCOUNT"}
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {mode === "login" && (
            <div className="mt-6 p-3 bg-slate-950/60 border border-cyber-border rounded-lg">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                Demo Credentials
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400 space-y-0.5">
                  <p><span className="text-slate-500">ID:</span> <span className="text-cyber-primary">admin</span></p>
                  <p><span className="text-slate-500">KEY:</span> <span className="text-cyber-primary">admin</span></p>
                </div>
                <button
                  onClick={useDemoLogin}
                  className="px-3 py-1.5 bg-cyber-primary/10 hover:bg-cyber-primary/20 border border-cyber-primary/30 text-cyber-primary text-[10px] font-mono font-bold rounded tracking-widest transition-all"
                >
                  USE DEMO
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] font-mono text-slate-600 mt-6">
            SHIELDX AI v2.0 · ENCRYPTED CHANNEL · NODE-X01
          </p>
        </div>
      </motion.div>
    </div>
  );
};
