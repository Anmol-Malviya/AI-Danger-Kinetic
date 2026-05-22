import React from "react";
import { 
  FiCode, 
  FiLayers, 
  FiActivity
} from "react-icons/fi";

export const Docs: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-cyber-border pb-4">
        <h2 className="text-2xl font-display font-extrabold text-white tracking-wide">
          SYSTEM ARCHITECTURE & API REFERENCE
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          AI Danger Kinetic operates as a dual-engine classifier combining statistical machine learning and domain heuristics.
        </p>
      </div>

      {/* Model Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-l-2 border-l-cyber-primary">
          <div className="flex items-center gap-2 mb-3">
            <FiLayers className="text-cyber-primary text-xl" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              URL HEURISTIC & RF CLASSIFIER
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
            The URL Scan engine extracts a vector of 11 characteristics from the input string (entropy metrics, subdomain structure, keyword checks, SSL status, and IP presence) and runs a <strong>Random Forest Classifier</strong> trained on 400 sample domains.
          </p>
          <div className="bg-slate-950 p-3 rounded font-mono text-[10px] text-slate-400 border border-white/5 space-y-1">
            <p>● Input: URL String</p>
            <p>● Model: Random Forest (n_estimators=50)</p>
            <p>● Vector: [length, dots, hyphens, subdomains, SSL, ...]</p>
            <p>● Accuracy: ~97.4% on synthetic test split</p>
          </div>
        </div>

        <div className="glass-card p-6 border-l-2 border-l-cyber-primary">
          <div className="flex items-center gap-2 mb-3">
            <FiActivity className="text-cyber-primary text-xl" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              TEXT NLP & TF-IDF ENGINE
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
            The Message Scan engine processes text blocks using a term frequency-inverse document frequency (<strong>TF-IDF Vectorizer</strong>) pipeline coupled with a <strong>Logistic Regression</strong> classification head to flag SMS phishing and email scams.
          </p>
          <div className="bg-slate-950 p-3 rounded font-mono text-[10px] text-slate-400 border border-white/5 space-y-1">
            <p>● Input: Raw SMS/Email string</p>
            <p>● Vectorizer: TfidfVectorizer (ngram_range=(1,2))</p>
            <p>● Model: Logistic Regression (L2 penalty)</p>
            <p>● Flags: Urgency, Financial, & Credential matches</p>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <FiCode className="text-cyber-primary text-md" />
          <h3 className="text-xs font-display font-bold tracking-widest text-slate-300 uppercase">
            FASTAPI DEVELOPER ROUTES
          </h3>
        </div>

        {/* Route 1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/30 rounded text-[10px] font-mono font-bold">
              POST
            </span>
            <span className="text-xs font-mono font-bold text-white">/scan-url</span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Submit a URL destination object to extract features and predict phishing confidence.
          </p>
          <div className="bg-slate-950 p-3 rounded font-mono text-[10px] text-slate-300 border border-white/5">
            <p className="text-slate-500">// Request payload</p>
            <p>{"{"} "url": "http://secure-login-chase.com" {"}"}</p>
            <p className="text-slate-500 mt-2">// Response payload sample</p>
            <p>{"{"}</p>
            <p className="pl-4">"url": "http://secure-login-chase.com",</p>
            <p className="pl-4">"threat_level": "dangerous",</p>
            <p className="pl-4">"confidence": 94.1,</p>
            <p className="pl-4">"features": {"{ ... }"}</p>
            <p>{"}"}</p>
          </div>
        </div>

        {/* Route 2 */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/30 rounded text-[10px] font-mono font-bold">
              POST
            </span>
            <span className="text-xs font-mono font-bold text-white">/scan-text</span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Submit raw message content blocks to evaluate spam/scam semantic probability.
          </p>
          <div className="bg-slate-950 p-3 rounded font-mono text-[10px] text-slate-300 border border-white/5">
            <p className="text-slate-500">// Request payload</p>
            <p>{"{"} "text": "URGENT: Did you transfer $500?" {"}"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
