import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiCheckCircle,
  FiLink,
  FiTerminal,
  FiXCircle,
  FiRefreshCw,
  FiEye,
  FiFileText,
} from "react-icons/fi";

interface ImageScanResult {
  success: boolean;
  filename: string;
  extracted_text: string;
  word_count: number;
  char_count: number;
  detected_keywords: string[];
  dangerous_keywords: string[];
  warning_keywords: string[];
  suspicious_links: {
    url: string;
    risk_flags: string[];
    is_suspicious: boolean;
  }[];
  categories: string[];
  threat_score: number;
  threat_level: "safe" | "suspicious" | "dangerous";
  verdict: string;
  explanation: string;
  score_breakdown: {
    dangerous_keyword_score: number;
    warning_keyword_score: number;
    suspicious_link_score: number;
    category_boost: number;
  };
  processed_image: string;
  annotated_image: string;
  original_image: string;
  image_metadata: {
    original_size: string;
    processed_size: string;
    file_size_mb: number;
  };
}

import { API_BASE_URL } from "../config";

interface ImageScannerProps {
  onScanComplete: () => void;
  userId: string | null;
  hideHeader?: boolean;
}

const API_BASE = API_BASE_URL;

export const ImageScanner: React.FC<ImageScannerProps> = ({ onScanComplete, userId, hideHeader }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ImageScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<"annotated" | "preprocessed">("annotated");

  const loadFile = (selected: File) => {
    if (!selected.type.startsWith("image/")) {
      setScanError("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
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
    if (userId) formData.append("user_id", userId);

    try {
      const res = await fetch(`${API_BASE}/scan-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setScanError(data.detail || "Image analysis failed. Please try a clearer screenshot.");
        setIsScanning(false);
        return;
      }

      setScanResult(data as ImageScanResult);
      setIsScanning(false);
      onScanComplete();
    } catch (err) {
      setScanError("Backend server is not responding. Please verify the FastAPI backend is running.");
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setScanError(null);
  };

  const getThreatColor = (level: string) => {
    if (level === "safe") return "text-cyber-success border-cyber-success/30 bg-cyber-success/5";
    if (level === "suspicious") return "text-cyber-warning border-cyber-warning/30 bg-cyber-warning/5";
    return "text-cyber-danger border-cyber-danger/30 bg-cyber-danger/5";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      {!hideHeader && (
        <div className="border-b border-cyber-border pb-4">
          <h2 className="text-2xl font-display font-extrabold text-white tracking-wide">
            AI DANGER KINETIC IMAGE SCANNER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Upload screenshots of WhatsApp chats, SMS, emails, or fake pages. OCR & AI will extract text, highlight suspicious regions, and predict threat scores.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Column (Upload & Previews) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[350px]">
            {!previewUrl ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${isDragging
                    ? "border-cyber-primary bg-cyber-primary/10 scale-[1.01]"
                    : "border-cyber-border bg-slate-900/20 hover:border-cyber-primary hover:bg-slate-900/40"
                  }`}
              >
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <FiUploadCloud
                    className={`text-5xl mb-3 transition-colors ${isDragging ? "text-cyber-primary" : "text-slate-500"}`}
                  />
                  <p className="text-sm text-slate-300 font-bold font-display tracking-wide mb-1">
                    {isDragging ? "DROP SCREENSHOT HERE" : "DRAG SCREENSHOT OR CHAT"}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    PNG, JPG, JPEG up to 15MB
                  </p>
                  <div className="mt-5 px-4 py-2 border border-cyber-primary/45 rounded text-xs font-mono text-cyber-primary tracking-widest bg-cyber-primary/5 hover:bg-cyber-primary/20 transition-all">
                    BROWSE STORAGE
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
                {/* Upload Image Frame */}
                <div className="relative w-full aspect-video border border-cyber-border bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <img
                    src={previewUrl}
                    alt="Source Preview"
                    className={`max-w-full max-h-full object-contain rounded transition-all duration-300 ${isScanning ? "opacity-50 blur-[1px]" : ""}`}
                  />
                  {isScanning && (
                    <>
                      <div className="scanner-line" />
                      <div className="absolute inset-0 bg-cyber-primary/10 animate-pulse flex items-center justify-center">
                        <span className="bg-slate-950/80 border border-cyber-primary px-3 py-1.5 rounded text-[10px] font-mono text-cyber-primary tracking-widest uppercase animate-bounce">
                          Running OCR & OpenCV pre-processing...
                        </span>
                      </div>
                    </>
                  )}
                  {/* Outer Tech Brackets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyber-primary/60" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyber-primary/60" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyber-primary/60" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyber-primary/60" />
                </div>

                <div className="flex justify-between w-full text-[10px] font-mono text-slate-500 border-b border-cyber-border pb-2">
                  <span>NAME: {file?.name}</span>
                  <span>SIZE: {((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    disabled={isScanning}
                    className="flex items-center gap-1.5 px-4 py-2 border border-cyber-border bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-50"
                  >
                    <FiRefreshCw /> RESET
                  </button>
                  <button
                    onClick={handleScan}
                    disabled={isScanning || scanResult !== null}
                    className="flex items-center gap-1.5 px-5 py-2 bg-cyber-primary hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-display font-extrabold tracking-widest shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        PROCESSING IMAGE...
                      </>
                    ) : scanResult ? (
                      <><FiCheckCircle /> VERIFIED</>
                    ) : (
                      "START AI ANALYSIS"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Column (Log Terminal & AI Outputs) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
              <div className="flex items-center gap-2">
                <FiTerminal className="text-cyber-primary" />
                <h3 className="text-xs font-display font-bold tracking-widest text-slate-300 uppercase">
                  AI Danger Kinetic Vision Terminal
                </h3>
              </div>
              {scanResult && (
                <div className="text-[10px] font-mono text-slate-400">
                  OCR Core: {scanResult.image_metadata.original_size} → {scanResult.image_metadata.processed_size}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isScanning && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2.5 font-mono text-xs text-slate-500"
                >
                  <p className="text-cyber-primary animate-pulse">⚡ LOADING AI DANGER KINETIC IMAGE ENGINES...</p>
                  <p>● Preprocessing screenshot: Converting to grayscale...</p>
                  <p>● Applying Non-Local Means denoising filter...</p>
                  <p>● Performing Unsharp mask image sharpening...</p>
                  <p>● Executing adaptive threshold (Gaussian C) & CLAHE contrast boost...</p>
                  <p className="text-cyber-success">✔ OpenCV Preprocessing module OK.</p>
                  <p>● Initializing OCR text segmentation...</p>
                  <p>● Parsing character sequence alignment...</p>
                  <p className="text-cyber-success">✔ Text elements extracted. Analyzing language...</p>
                  <p>● Matching threat patterns and suspicious URLs...</p>
                  <p>● Generating AI risk score breakdown...</p>
                </motion.div>
              )}

              {scanError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center gap-4 py-8"
                >
                  <FiXCircle className="text-5xl text-cyber-danger" />
                  <div>
                    <p className="text-sm font-display font-bold text-cyber-danger tracking-wide mb-1">
                      ANALYSIS FAILED
                    </p>
                    <p className="text-xs font-mono text-slate-400 max-w-sm">{scanError}</p>
                  </div>
                </motion.div>
              )}

              {scanResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Grid layout for Verdict & Image tabs */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Verdict Card */}
                    <div className="md:col-span-5 space-y-3">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">AI Security Verdict:</span>
                      <div className={`p-4 rounded-lg border text-center ${getThreatColor(scanResult.threat_level)}`}>
                        <p className="text-sm font-display font-extrabold uppercase tracking-widest">{scanResult.threat_level} threat</p>
                        <p className="text-3xl font-display font-black mt-2">{scanResult.threat_score}%</p>
                        <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">RISK INDEX INDEXED</p>
                      </div>

                      <div className="p-3 bg-slate-950/40 border border-cyber-border rounded-lg space-y-1.5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Verifications:</span>
                        <div className="text-[11px] font-mono text-slate-400 space-y-1">
                          <p>• Words Scan: {scanResult.word_count}</p>
                          <p>• Char count: {scanResult.char_count}</p>
                          <p>• Flags Count: {scanResult.detected_keywords.length + scanResult.suspicious_links.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Image Viewer Tabs & Output */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex border-b border-cyber-border">
                        <button
                          onClick={() => setActiveImageTab("annotated")}
                          className={`px-3 py-1.5 text-xs font-mono border-b-2 transition-all ${
                            activeImageTab === "annotated"
                              ? "border-cyber-primary text-cyber-primary font-bold"
                              : "border-transparent text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Annotated Scan (BBoxes)
                        </button>
                        <button
                          onClick={() => setActiveImageTab("preprocessed")}
                          className={`px-3 py-1.5 text-xs font-mono border-b-2 transition-all ${
                            activeImageTab === "preprocessed"
                              ? "border-cyber-primary text-cyber-primary font-bold"
                              : "border-transparent text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          OpenCV Binary output
                        </button>
                      </div>

                      <div className="relative aspect-video w-full bg-slate-950 border border-cyber-border rounded overflow-hidden flex items-center justify-center shadow-inner group">
                        <img
                          src={`${API_BASE}${activeImageTab === "annotated" ? scanResult.annotated_image : scanResult.processed_image}`}
                          alt="AI output preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <a
                          href={`${API_BASE}${activeImageTab === "annotated" ? scanResult.annotated_image : scanResult.processed_image}`}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute right-2 top-2 bg-slate-950/85 hover:bg-slate-900 border border-cyber-border p-1.5 rounded text-slate-300 hover:text-cyber-primary transition-all opacity-0 group-hover:opacity-100"
                          title="Open Full Image"
                        >
                          <FiEye className="text-sm" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Verdict explanations */}
                  <div className="p-4 bg-slate-950/50 rounded-lg border border-cyber-border space-y-2">
                    <span className="text-[10px] text-cyber-primary font-mono uppercase tracking-wider block font-bold">Heuristic Scan Analysis:</span>
                    <p className="text-xs font-sans text-slate-300 leading-relaxed">{scanResult.explanation}</p>
                    <p className="text-xs font-sans font-bold text-slate-200">{scanResult.verdict}</p>
                  </div>

                  {/* Links & Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Extracted suspicious keywords */}
                    <div className="p-3 bg-slate-950/40 border border-cyber-border rounded-lg space-y-2">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Threat Signatures Found:</span>
                      {scanResult.detected_keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {scanResult.dangerous_keywords.map((kw, i) => (
                            <span key={`dk-${i}`} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/25 uppercase font-bold">
                              {kw}
                            </span>
                          ))}
                          {scanResult.warning_keywords.map((kw, i) => (
                            <span key={`wk-${i}`} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyber-warning/10 text-cyber-warning border border-cyber-warning/25 uppercase font-bold">
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-slate-500">No threat keywords parsed.</p>
                      )}
                    </div>

                    {/* Suspicious links */}
                    <div className="p-3 bg-slate-950/40 border border-cyber-border rounded-lg space-y-2">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Suspicious Links Blocked:</span>
                      {scanResult.suspicious_links.length > 0 ? (
                        <div className="space-y-1.5">
                          {scanResult.suspicious_links.map((link, idx) => (
                            <div key={idx} className="text-[10px] font-mono p-1.5 border border-cyber-danger/20 rounded bg-cyber-danger/5 text-cyber-danger">
                              <p className="break-all font-bold flex items-center gap-1">
                                <FiLink className="shrink-0" /> {link.url}
                              </p>
                              {link.risk_flags.map((flag, fi) => (
                                <p key={fi} className="text-[9px] text-slate-400 mt-0.5 font-sans">• {flag}</p>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-slate-500">No external links found.</p>
                      )}
                    </div>
                  </div>

                  {/* OCR Full Text Extract drawer */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">OCR Text Extract Log:</span>
                    <div className="p-3 bg-slate-950 border border-cyber-border rounded font-mono text-[11px] text-slate-400 h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                      {scanResult.extracted_text || "No text could be extracted."}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {!isScanning && !scanError && !scanResult && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3"
                >
                  <FiFileText className="text-4xl text-slate-600 animate-pulse" />
                  <p className="text-slate-500 font-mono text-xs max-w-sm">
                    Drag and drop a screenshot or click to browse. AI Danger Kinetic will run an OCR scan to verify its contents.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
