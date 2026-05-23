const API_URL = "https://ai-danger-kinetic-backend.onrender.com/scan-url";

// Memory cache to prevent redundant scans within a short period
const scanCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedResult(url) {
  const cached = scanCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  return null;
}

function setCachedResult(url, result) {
  scanCache.set(url, {
    result,
    timestamp: Date.now()
  });
}

// Update the extension badge and icon based on tab status
async function updateBadge(tabId, status, confidence = 0) {
  let text = "";
  let color = "#64748b"; // default grey
  let iconPath = "default";

  if (status === "safe") {
    text = "SAFE";
    color = "#22c55e"; // green
    iconPath = "safe";
  } else if (status === "warning") {
    text = `${Math.round(confidence)}%`;
    color = "#f59e0b"; // warning orange
    iconPath = "warning";
  } else if (status === "dangerous") {
    text = "BLKD";
    color = "#ef4444"; // danger red
    iconPath = "danger";
  } else if (status === "scanning") {
    text = "SCAN";
    color = "#06b6d4"; // cyan
    iconPath = "default";
  } else if (status === "disabled") {
    text = "OFF";
    color = "#475569"; // dark grey
    iconPath = "default";
  }

  try {
    await chrome.action.setBadgeText({ tabId, text });
    await chrome.action.setBadgeBackgroundColor({ tabId, color });
    await chrome.action.setIcon({
      tabId,
      path: {
        "16": `icons/${iconPath}_16.png`,
        "32": `icons/${iconPath}_32.png`,
        "48": `icons/${iconPath}_48.png`,
        "128": `icons/${iconPath}_128.png`
      }
    });
  } catch (e) {
    // Tab might have been closed, ignore
  }
}

// Function to scan a URL using FastAPI backend
async function scanUrl(url) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error("AI Danger Kinetic: Backend offline or unreachable.", e);
  }
  return null;
}

// Listen to navigations
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only handle main frame navigations
  if (details.frameId !== 0) return;

  const url = details.url;
  if (!url || (!url.startsWith("http:") && !url.startsWith("https:"))) return;

  const urlObj = new URL(url);
  // Skip localhost, local IPs and extension pages
  if (
    urlObj.hostname === "localhost" ||
    urlObj.hostname === "127.0.0.1" ||
    urlObj.protocol === "chrome-extension:"
  ) {
    return;
  }

  const tabId = details.tabId;

  // Retrieve configurations
  const settings = await chrome.storage.local.get({ isEnabled: true, whitelist: [] });
  
  if (!settings.isEnabled) {
    await updateBadge(tabId, "disabled");
    await chrome.storage.local.remove(`tab_status_${tabId}`);
    return;
  }

  // Check if whitelisted
  if (settings.whitelist.includes(urlObj.hostname)) {
    await updateBadge(tabId, "safe");
    await chrome.storage.local.set({
      [`tab_status_${tabId}`]: { threat_level: "safe", confidence: 0, details: ["User Trusted Domain"] }
    });
    return;
  }

  // Check cache
  let scanResult = getCachedResult(url);
  
  if (!scanResult) {
    await updateBadge(tabId, "scanning");
    scanResult = await scanUrl(url);
    if (scanResult) {
      setCachedResult(url, scanResult);
    }
  }

  if (scanResult) {
    // Save current status for the tab so the popup can read it
    await chrome.storage.local.set({
      [`tab_status_${tabId}`]: scanResult
    });

    await updateBadge(tabId, scanResult.threat_level, scanResult.confidence);

    if (scanResult.threat_level === "dangerous") {
      // Redirect to block page
      const blockedUrl = chrome.runtime.getURL("blocked.html") +
        `?url=${encodeURIComponent(url)}` +
        `&threat=${encodeURIComponent(scanResult.threat_level)}` +
        `&confidence=${encodeURIComponent(scanResult.confidence)}` +
        `&details=${encodeURIComponent(JSON.stringify(scanResult.details))}`;

      chrome.tabs.update(tabId, { url: blockedUrl });
    }
  } else {
    // If backend is offline, default to safe and set status accordingly
    await updateBadge(tabId, "safe");
    await chrome.storage.local.set({
      [`tab_status_${tabId}`]: { threat_level: "safe", confidence: 0, details: ["Scanner Offline - Defaulting to Safety"] }
    });
  }
});

// Clean up stored tab status on close
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`tab_status_${tabId}`);
});

// Update badge when switching tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  const settings = await chrome.storage.local.get({ isEnabled: true });
  
  if (!settings.isEnabled) {
    await updateBadge(tabId, "disabled");
    return;
  }

  const statusKey = `tab_status_${tabId}`;
  const result = await chrome.storage.local.get(statusKey);
  const data = result[statusKey];

  if (data) {
    await updateBadge(tabId, data.threat_level, data.confidence);
  } else {
    // Check if the tab has a valid web URL
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab && tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
        const urlObj = new URL(tab.url);
        if (urlObj.hostname !== "localhost" && urlObj.hostname !== "127.0.0.1") {
          await updateBadge(tabId, "scanning");
          const scanResult = await scanUrl(tab.url);
          if (scanResult) {
            setCachedResult(tab.url, scanResult);
            await chrome.storage.local.set({ [statusKey]: scanResult });
            await updateBadge(tabId, scanResult.threat_level, scanResult.confidence);
          } else {
            await updateBadge(tabId, "safe");
          }
          return;
        }
      }
    } catch (e) {
      // Ignore errors when querying tab URL
    }
    await updateBadge(tabId, "safe");
  }
});

const TEXT_API_URL = "https://ai-danger-kinetic-backend.onrender.com/scan-text";

async function scanText(text) {
  try {
    const response = await fetch(TEXT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error("AI Danger Kinetic: Backend text scan error.", e);
  }
  return null;
}

// Listen to messages from popup or blocked pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleGuardian") {
    // Update badge for active tab
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        if (!message.isEnabled) {
          await updateBadge(tab.id, "disabled");
        } else {
          // Force rescan/badge update
          try {
            if (tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
              await updateBadge(tab.id, "scanning");
              const scanResult = await scanUrl(tab.url);
              if (scanResult) {
                setCachedResult(tab.url, scanResult);
                await chrome.storage.local.set({ [`tab_status_${tab.id}`]: scanResult });
                await updateBadge(tab.id, scanResult.threat_level, scanResult.confidence);
              }
            }
          } catch (e) {}
        }
      }
    })();
    return false;
  }
  
  if (message.action === "recheckTab") {
    (async () => {
      // Clear cache for this URL
      scanCache.delete(message.url);
      
      // If domain is whitelisted, redirect back to the original URL if they are currently on blocked page
      const urlObj = new URL(message.url);
      const settings = await chrome.storage.local.get({ whitelist: [] });
      
      if (settings.whitelist.includes(urlObj.hostname)) {
        await chrome.storage.local.set({
          [`tab_status_${message.tabId}`]: { threat_level: "safe", confidence: 0, details: ["User Trusted Domain"] }
        });
        await updateBadge(message.tabId, "safe");
        
        // If the current tab url is blocked.html, redirect back to the original URL
        try {
          const tab = await chrome.tabs.get(message.tabId);
          if (tab && tab.url && tab.url.includes("blocked.html")) {
            await chrome.tabs.update(message.tabId, { url: message.url });
          }
        } catch (e) {}
      }
    })();
    return false;
  }

  if (message.action === "checkUrlScam") {
    scanUrl(message.url)
      .then(result => {
        sendResponse(result);
      })
      .catch(err => {
        sendResponse({ error: err.message });
      });
    return true; // Keep channel open for async response
  }

  if (message.action === "checkTextScam") {
    scanText(message.text)
      .then(result => {
        sendResponse(result);
      })
      .catch(err => {
        sendResponse({ error: err.message });
      });
    return true; // Keep channel open for async response
  }

  if (message.action === "scamStatusUpdate") {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      chrome.storage.local.set({
        [`tab_status_${tabId}`]: {
          threat_level: message.threat_level,
          confidence: message.confidence,
          details: message.details
        }
      }).then(() => {
        updateBadge(tabId, message.threat_level, message.confidence);
      });
    }
    return false;
  }
});
