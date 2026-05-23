// ── AI Danger Kinetic - Screen & Chat Content Scanner ─────────────────────────────

(function () {
  // Inject CSS Styles for visual markings
  const injectStyles = () => {
    if (document.getElementById("adk-injected-styles")) return;
    const style = document.createElement("style");
    style.id = "adk-injected-styles";
    style.className = "adk-injected";
    style.textContent = `
      .adk-scam-highlight {
        outline: 2.5px dashed #ef4444 !important;
        outline-offset: 3px !important;
        background-color: rgba(239, 68, 68, 0.05) !important;
        box-shadow: 0 0 14px rgba(239, 68, 68, 0.25) !important;
        position: relative !important;
        transition: all 0.3s ease !important;
        border-radius: 8px !important;
      }
      .adk-scam-highlight.adk-warning {
        outline-color: #f59e0b !important;
        background-color: rgba(245, 158, 11, 0.05) !important;
        box-shadow: 0 0 14px rgba(245, 158, 11, 0.25) !important;
      }
      .adk-scam-badge {
        position: absolute !important;
        top: -14px !important;
        right: 8px !important;
        background: #ef4444 !important;
        color: #ffffff !important;
        padding: 3px 8px !important;
        border-radius: 4px !important;
        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        font-size: 9.5px !important;
        font-weight: 700 !important;
        letter-spacing: 0.03em !important;
        box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4) !important;
        pointer-events: auto !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        line-height: 1 !important;
        cursor: help !important;
      }
      .adk-scam-highlight.adk-warning .adk-scam-badge {
        background: #f59e0b !important;
        box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4) !important;
      }
      .adk-warning-banner {
        position: fixed !important;
        top: 14px !important;
        left: 50% !important;
        transform: translateX(-50%) translateY(-100px) !important;
        width: 90% !important;
        max-width: 580px !important;
        background: rgba(17, 24, 39, 0.95) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(239, 68, 68, 0.3) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.1) !important;
        border-radius: 14px !important;
        padding: 12px 18px !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        color: #f9fafb !important;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      }
      .adk-warning-banner.show {
        transform: translateX(-50%) translateY(0) !important;
      }
      .adk-banner-left {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
      }
      .adk-banner-icon {
        font-size: 16px !important;
        line-height: 1 !important;
      }
      .adk-banner-text {
        font-size: 13px !important;
        font-weight: 500 !important;
        color: #f3f4f6 !important;
        line-height: 1.45 !important;
      }
      .adk-banner-text strong {
        color: #f87171 !important;
        font-weight: 600 !important;
      }
      .adk-banner-btn-close {
        background: transparent !important;
        border: none !important;
        color: #9ca3af !important;
        cursor: pointer !important;
        font-size: 14px !important;
        padding: 4px !important;
        line-height: 1 !important;
        margin-left: 12px !important;
      }
      .adk-banner-btn-close:hover {
        color: #f9fafb !important;
      }
    `;
    document.head.appendChild(style);
  };

  // High-risk local indicators
  const countMatches = (text, list) => {
    let count = 0;
    list.forEach(kw => {
      if (text.includes(kw)) count++;
    });
    return count;
  };

  const localAnalyzeText = (text) => {
    const textLower = text.toLowerCase().trim();
    if (textLower.length < 15 || textLower.length > 1000) return null;

    // Technical Support scam signatures
    const supportRegex = /(microsoft|windows|apple|google|chrome|firewall|defender|os)\s+(support|technician|helpline|security\s+center|alert|warning|blocked|infected).*?(\d{1,4}[-\s]?\d{3}[-\s]?\d{3,4}|\d{10})/i;
    const techSupportKeywords = [
      "windows security center",
      "call microsoft support",
      "system infected",
      "computer locked",
      "ransomware detected",
      "critical threat detected",
      "support technician"
    ];

    let techSupportMatch = supportRegex.test(textLower);
    let techKWCount = 0;
    techSupportKeywords.forEach(kw => {
      if (textLower.includes(kw)) techKWCount++;
    });

    // Threat category keywords (Urgency, Financial, Credentials)
    const urgencyWords = ["urgent", "immediate", "suspicious", "alert", "locked", "expire", "action required", "warning", "suspend", "confirm"];
    const financialWords = ["bank", "card", "billing", "payment", "transfer", "tax", "refund", "cash", "lottery", "prize", "gift card", "crypto", "binance", "metamask", "wallet", "rewards", "money", "claim", "won"];
    const credentialWords = ["verify", "login", "signin", "password", "reset", "identity", "otp", "auth", "credential", "security code", "seed phrase"];

    const urgencyCount = countMatches(textLower, urgencyWords);
    const financialCount = countMatches(textLower, financialWords);
    const credentialCount = countMatches(textLower, credentialWords);

    let isSuspicious = false;
    let confidence = 0;
    let details = [];

    if (techSupportMatch || techKWCount >= 2) {
      isSuspicious = true;
      confidence = 90;
      details.push("Technical Support scam pattern detected (fake helpline request)");
    } else if (urgencyCount > 0 && financialCount > 0 && credentialCount > 0) {
      isSuspicious = true;
      confidence = 80;
      details.push("High-risk combination: Urgency, Financial, and Credential harvesting patterns.");
    } else if (urgencyCount > 0 && financialCount > 0) {
      isSuspicious = true;
      confidence = 65;
      details.push("Urgent financial request pattern detected.");
    } else if (urgencyCount > 0 && credentialCount > 0) {
      isSuspicious = true;
      confidence = 65;
      details.push("Urgent credential/identity verification request pattern detected.");
    }

    if (isSuspicious) {
      return { confidence, details };
    }
    return null;
  };

  // Show page banner warning
  const showWarningBanner = (threatLevel, confidence) => {
    let banner = document.getElementById("adk-global-warning-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "adk-global-warning-banner";
      banner.className = "adk-warning-banner adk-injected";

      const leftPart = document.createElement("div");
      leftPart.className = "adk-banner-left";

      const icon = document.createElement("div");
      icon.className = "adk-banner-icon";
      icon.textContent = "⚠️";

      const text = document.createElement("span");
      text.className = "adk-banner-text";
      text.innerHTML = `<strong>AI Danger Kinetic:</strong> Scam content detected on your screen! (${Math.round(confidence)}% confidence)`;

      leftPart.appendChild(icon);
      leftPart.appendChild(text);

      const closeBtn = document.createElement("button");
      closeBtn.className = "adk-banner-btn-close";
      closeBtn.textContent = "✕";
      closeBtn.addEventListener("click", () => {
        banner.classList.remove("show");
      });

      banner.appendChild(leftPart);
      banner.appendChild(closeBtn);

      document.body.appendChild(banner);

      setTimeout(() => {
        banner.classList.add("show");
      }, 10);
    } else {
      const textEl = banner.querySelector(".adk-banner-text");
      if (textEl) {
        textEl.innerHTML = `<strong>AI Danger Kinetic:</strong> Scam content detected on your screen! (${Math.round(confidence)}% confidence)`;
      }
      banner.classList.add("show");
    }
  };

  // Inject visual markup on scam element in DOM
  const markElementInDOM = (element, threatLevel, confidence, details) => {
    if (element.classList.contains("adk-scam-highlight")) return;

    element.classList.add("adk-scam-highlight");
    if (threatLevel === "dangerous") {
      element.classList.add("adk-danger");
    } else {
      element.classList.add("adk-warning");
    }

    // Create warning badge
    const badge = document.createElement("div");
    badge.className = "adk-scam-badge adk-injected";
    badge.innerHTML = `⚠️ SCAN DETECTED (${Math.round(confidence)}%)`;
    badge.title = `Warning: Potential Scam content detected.\nConfidence: ${Math.round(confidence)}%\nDetails:\n- ${details.join("\n- ")}`;

    if (window.getComputedStyle(element).position === "static") {
      element.style.position = "relative";
    }
    element.appendChild(badge);
  };

  // Core scan controller
  const scanScreen = async () => {
    // Check if guardian is enabled
    const settings = await chrome.storage.local.get({ isEnabled: true });
    if (!settings.isEnabled) return;

    injectStyles();

    const isWhatsApp = window.location.hostname === "web.whatsapp.com";

    // Select elements based on platform
    let listElements = [];
    if (isWhatsApp) {
      // Target WhatsApp message content elements specifically
      listElements = document.querySelectorAll("span.selectable-text.copyable-text, .copyable-text");
    } else {
      // General web pages
      listElements = document.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6, li, td, section, article");
    }

    const promises = [];
    const elementsToMark = [];

    for (let el of listElements) {
      // Ignore injected extension widgets, scripts, inputs, empty tags
      if (
        el.closest(".adk-injected") ||
        el.classList.contains("adk-scam-highlight") ||
        el.tagName.toLowerCase() === "script" ||
        el.tagName.toLowerCase() === "style" ||
        el.tagName.toLowerCase() === "noscript" ||
        el.tagName.toLowerCase() === "textarea" ||
        el.tagName.toLowerCase() === "input"
      ) {
        continue;
      }

      let text = "";
      if (isWhatsApp) {
        // For WhatsApp, we want the entire text content of the message bubble
        text = el.textContent.trim();
      } else {
        // For general web pages, check direct text nodes to avoid duplicate scanning of large parent containers
        let directText = "";
        for (let child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            directText += child.textContent;
          }
        }
        text = directText.trim();
      }

      if (text.length < 15) continue;

      // Extract links inside the text
      const foundUrls = [];
      
      // 1. Check anchor tags inside the element
      const anchors = el.querySelectorAll("a");
      anchors.forEach(a => {
        if (a.href && a.href.startsWith("http")) {
          foundUrls.push(a.href);
        }
      });
      
      // 2. Fallback regex to find URLs in raw text
      const urlRegex = /https?:\/\/[^\s]+/gi;
      const regexUrls = text.match(urlRegex) || [];
      regexUrls.forEach(u => {
        if (!foundUrls.includes(u)) foundUrls.push(u);
      });

      // Scan logic
      // Check if we need to scan URLs first (since links in chat are prime vectors for scams)
      if (foundUrls.length > 0) {
        foundUrls.forEach(url => {
          const p = new Promise((resolve) => {
            chrome.runtime.sendMessage(
              { action: "checkUrlScam", url: url },
              (response) => {
                if (response && (response.threat_level === "dangerous" || response.threat_level === "warning")) {
                  elementsToMark.push({
                    element: el,
                    threatLevel: response.threat_level,
                    confidence: response.confidence,
                    details: response.details || ["Scam URL detected in message link"]
                  });
                }
                resolve();
              }
            );
          });
          promises.push(p);
        });
      }

      // Check text content heuristics
      const localResult = localAnalyzeText(text);
      if (localResult) {
        const p = new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { action: "checkTextScam", text: text },
            (response) => {
              if (response && (response.threat_level === "dangerous" || response.threat_level === "warning")) {
                elementsToMark.push({
                  element: el,
                  threatLevel: response.threat_level,
                  confidence: response.confidence,
                  details: response.details || localResult.details
                });
              } else if (!foundUrls.length) {
                // Fallback to local heuristic only if we didn't query a URL
                const localLevel = localResult.confidence >= 75 ? "dangerous" : "warning";
                elementsToMark.push({
                  element: el,
                  threatLevel: localLevel,
                  confidence: localResult.confidence,
                  details: localResult.details
                });
              }
              resolve();
            }
          );
        });
        promises.push(p);
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);

      if (elementsToMark.length > 0) {
        let maxConfidence = 0;
        let finalThreatLevel = "warning";
        const allDetails = new Set();

        elementsToMark.forEach(item => {
          // Identify the message bubble if on WhatsApp Web to highlight the entire bubble!
          const bubbleElement = isWhatsApp ? (item.element.closest(".message-in, .message-out") || item.element) : item.element;
          
          markElementInDOM(bubbleElement, item.threatLevel, item.confidence, item.details);
          if (item.confidence > maxConfidence) {
            maxConfidence = item.confidence;
          }
          if (item.threatLevel === "dangerous") {
            finalThreatLevel = "dangerous";
          }
          item.details.forEach(d => allDetails.add(d));
        });

        // Show page banner
        showWarningBanner(finalThreatLevel, maxConfidence);

        // Send a single update to background script to sync icon badge and store tab stats
        chrome.runtime.sendMessage({
          action: "scamStatusUpdate",
          threat_level: finalThreatLevel,
          confidence: maxConfidence,
          details: Array.from(allDetails)
        });
      }
    }
  };

  // Setup debounce wrapper for mutation scanner
  let scanTimeout;
  const debouncedScan = () => {
    clearTimeout(scanTimeout);
    scanTimeout = setTimeout(scanScreen, 1200);
  };

  // Run scanner on start
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(scanScreen, 600);
  } else {
    window.addEventListener("DOMContentLoaded", () => setTimeout(scanScreen, 600));
  }

  // Monitor DOM for active screen text changes (infinite scroll, chats, SPA routing)
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (let m of mutations) {
      if (m.addedNodes.length > 0) {
        // Check if added nodes aren't extension injected elements
        const isExtensionNode = Array.from(m.addedNodes).some(n => 
          n.nodeType === Node.ELEMENT_NODE && (n.classList.contains("adk-injected") || n.closest(".adk-injected"))
        );
        if (!isExtensionNode) {
          shouldScan = true;
          break;
        }
      }
    }
    if (shouldScan) debouncedScan();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
