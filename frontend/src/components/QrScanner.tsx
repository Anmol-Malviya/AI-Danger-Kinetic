import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiAlertTriangle,
  FiCheckCircle,
  FiLink,
  FiTerminal,
  FiAlertCircle,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";
import type { QrScanResult } from "../types";

interface QrScannerProps {
  onScanComplete: () => void;
}

const API_BASE = "http://127.0.0.1:8000";

export const QrScanner: React.FC<QrScannerProps> = ({ onScanComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QrScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadFile = (selected: File) => {
    if (!selected.type.startsWith("image/")) {
      setScanError("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setScanResult(null);
    setScanError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
  };

  // Drag-and-drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) loadFile(dropped);
  }, []);

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setScanError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/scan-qr`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend returned a clear error (e.g., 422 = no QR found)
        setScanError(data.detail || "QR scan failed. Try a clearer image.");
        setIsScanning(false);
        return;
      }

      // Success — small delay for laser animation to play out
      setTimeout(() => {
        setScanResult(data as QrScanResult);
        setIsScanning(false);
        onScanComplete();
      }, 1800);
    } catch {
      setScanError("Backend unavailable. Please make sure the server is running on port 8000.");
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setScanError(null);
  };

  const tlColor = (tl: string) => {
    if (tl === "safe") return "text-cyber-success border-cyber-success/30 bg-cyber-success/5";
    if (tl === "warning") return "text-cyber-warning border-cyber-warning/30 bg-cyber-warning/5";
    return "text-cyber-danger border-cyber-danger/30 bg-cyber-danger/5";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-cyber-border pb-4">
        <h2 className="text-2xl font-display font-extrabold text-white tracking-wide">
          AI DANGER KINETIC QR SCAM DETECTOR
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Upload a QR code image — AI will decode the embedded link and run a real-time phishing analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Upload Panel ── */}
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[320px]">
          {!previewUrl ? (
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all
                ${isDragging
                  ? "border-cyber-primary bg-cyber-primary/10 scale-[1.01]"
                  : "border-cyber-border bg-slate-900/20 hover:border-cyber-primary hover:bg-slate-900/40"
                }`}
            >
              <div className="flex flex-col items-center justify-center text-center px-4">
                <FiUploadCloud
                  className={`text-4xl mb-3 transition-colors ${isDragging ? "text-cyber-primary" : "text-slate-500"}`}
                />
                <p className="text-sm text-slate-300 font-bold font-display tracking-wide mb-1">
                  {isDragging ? "DROP IT!" : "DRAG & DROP QR IMAGE"}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  or click to browse — PNG, JPG, WEBP up to 10MB
                </p>
                <div className="mt-4 px-4 py-1.5 border border-cyber-primary/40 rounded text-[10px] font-mono text-cyber-primary tracking-widest">
                  SELECT FILE
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="flex flex-col items-center w-full gap-4">
              {/* QR preview with laser animation */}
              <div className="relative w-52 h-52 border border-cyber-border bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <img
                  src={previewUrl}
                  alt="QR Preview"
                  className={`max-w-full max-h-full object-contain rounded transition-all duration-300 ${isScanning ? "opacity-50 blur-[0.5px]" : ""}`}
                />
                {isScanning && (
                  <>
                    <div className="scanner-line" />
                    <div className="absolute inset-0 bg-cyber-primary/5 animate-pulse" />
                  </>
                )}
                {/* Corner brackets */}
                <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-cyber-primary/60 rounded-tl" />
                <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-cyber-primary/60 rounded-tr" />
                <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-cyber-primary/60 rounded-bl" />
                <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-cyber-primary/60 rounded-br" />
              </div>

              <p className="text-[11px] font-mono text-slate-500 max-w-[200px] text-center truncate">
                {file?.name}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-4 py-2 border border-cyber-border bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-50"
                >
                  <FiRefreshCw className="text-xs" /> RESET
                </button>
                <button
                  onClick={handleScan}
                  disabled={isScanning || scanResult !== null}
                  className="flex items-center gap-1.5 px-5 py-2 bg-cyber-primary hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-display font-extrabold tracking-widest shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      DECODING...
                    </>
                  ) : scanResult ? (
                    <><FiCheckCircle /> DONE</>
                  ) : (
                    "EXTRACT & SCAN"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Results Panel ── */}
        <div className="glass-card p-6 flex flex-col min-h-[320px]">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
            <FiTerminal className="text-cyber-primary" />
            <h3 className="text-xs font-display font-bold tracking-widest text-slate-300 uppercase">
              QR READ LOG
            </h3>
          </div>

          <AnimatePresence mode="wait">
            {/* Scanning animation */}
            {isScanning && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 font-mono text-xs text-slate-500"
              >
                <p className="text-cyber-primary animate-pulse">⚡ INITIALIZING VISUAL SCANNER MODULE...</p>
                <p>● Isolating QR finder patterns...</p>
                <p>● Reading bit matrix orientation...</p>
                <p>● Applying Reed-Solomon error correction...</p>
                <p>● Extracting embedded URL payload...</p>
                <p>● Running AI threat classification...</p>
              </motion.div>
            )}

            {/* Error state */}
            {!isScanning && scanError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center gap-4 py-6"
              >
                <FiXCircle className="text-4xl text-cyber-danger" />
                <div>
                  <p className="text-xs font-display font-bold text-cyber-danger tracking-wide mb-2">
                    SCAN FAILED
                  </p>
                  <p className="text-xs font-mono text-slate-400 max-w-xs">{scanError}</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-cyber-border text-left max-w-xs w-full">
                  <p className="text-[10px] font-mono text-slate-500 mb-1">TIPS:</p>
                  <ul className="text-[10px] font-mono text-slate-400 space-y-0.5">
                    <li>• Use a high-resolution, unblurred image</li>
                    <li>• Ensure good contrast (dark QR on white bg)</li>
                    <li>• Avoid screenshots of QR with overlays</li>
                    <li>• PNG format works best with OpenCV</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Success result */}
            {!isScanning && !scanError && scanResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Decoded URL */}
                <div className="p-3 bg-slate-950/60 rounded-lg border border-cyber-border space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <FiLink className="text-cyber-primary" /> DECODED LINK PAYLOAD:
                  </span>
                  <p className="text-xs font-mono text-slate-200 break-all">{scanResult.decoded_url}</p>
                </div>

                {/* Threat level badge */}
                <div className={`p-4 rounded-lg border flex items-center justify-between gap-3 ${tlColor(scanResult.scan_results.threat_level)}`}>
                  <div className="flex items-center gap-3">
                    {scanResult.scan_results.threat_level === "safe"
                      ? <FiCheckCircle className="text-2xl" />
                      : <FiAlertTriangle className="text-2xl" />}
                    <div>
                      <p className="text-xs font-mono font-bold uppercase">
                        {scanResult.scan_results.threat_level} LEVEL
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        AI Confidence: {scanResult.scan_results.confidence}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                {scanResult.scan_results.details?.length > 0 && (
                  <ul className="space-y-1.5">
                    {scanResult.scan_results.details.map((d, i) => (
                      <li key={i} className="text-[11px] font-mono text-slate-400 flex items-start gap-1.5">
                        <FiAlertCircle className="text-cyber-primary mt-0.5 shrink-0 text-xs" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {/* Empty state */}
            {!isScanning && !scanError && !scanResult && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-3"
              >
                <FiUploadCloud className="text-3xl text-slate-600" />
                <p className="text-slate-500 font-mono text-xs max-w-[180px]">
                  Upload a QR code image and click EXTRACT & SCAN to begin analysis.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* How it works footer */}
      <div className="glass-card p-4 flex flex-wrap gap-6 text-[11px] font-mono text-slate-500">
        <span><span className="text-cyber-primary font-bold">01.</span> Upload QR image</span>
        <span className="text-slate-700">→</span>
        <span><span className="text-cyber-primary font-bold">02.</span> OpenCV decodes the embedded URL</span>
        <span className="text-slate-700">→</span>
        <span><span className="text-cyber-primary font-bold">03.</span> AI analyses link for phishing patterns</span>
        <span className="text-slate-700">→</span>
        <span><span className="text-cyber-primary font-bold">04.</span> Threat verdict + confidence score returned</span>
      </div>
    </div>
  );
};
