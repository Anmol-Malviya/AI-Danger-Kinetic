document.addEventListener("DOMContentLoaded", async () => {
  const params        = new URLSearchParams(window.location.search);
  const blockedUrl    = params.get("url")        || "";
  const threat        = params.get("threat")      || "dangerous";
  const confidence    = parseFloat(params.get("confidence") || "0");
  const detailsStr    = params.get("details")    || "[]";

  // DOM refs
  const blockedUrlEl  = document.getElementById("blocked-url");
  const pillLevelEl   = document.getElementById("pill-level");
  const pillConfEl    = document.getElementById("pill-conf");
  const threatBadgeEl = document.getElementById("threat-badge");
  const trackFill     = document.getElementById("track-fill");
  const trackThumb    = document.getElementById("track-thumb");
  const trackVal      = document.getElementById("track-val");
  const reasonsWrap   = document.getElementById("reasons-wrap");
  const reasonsEl     = document.getElementById("reasons");
  const btnBack       = document.getElementById("btn-back");
  const btnBypass     = document.getElementById("btn-bypass");

  // Populate URL
  if (blockedUrlEl) {
    blockedUrlEl.textContent = blockedUrl || "Unknown Link";
    blockedUrlEl.title = blockedUrl;
  }

  // Threat badge/pills
  const displayThreat = threat.toUpperCase();
  if (pillLevelEl) pillLevelEl.textContent = displayThreat;
  if (threatBadgeEl) threatBadgeEl.textContent = displayThreat;

  // Animate threat track slider
  setTimeout(() => {
    if (trackFill) trackFill.style.width = `${confidence}%`;
    if (trackThumb) trackThumb.style.left = `${confidence}%`;
  }, 200);

  // Count-up animation for threat value
  let start = 0;
  const end = Math.round(confidence);
  const duration = 1200; // slightly faster animation
  const step = end / (duration / 16);
  const counter = setInterval(() => {
    start = Math.min(start + step, end);
    const displayVal = `${Math.round(start)}%`;
    if (trackVal) trackVal.textContent = displayVal;
    if (pillConfEl) pillConfEl.textContent = `${displayVal} confidence`;
    if (start >= end) clearInterval(counter);
  }, 16);

  // Parse and display reasons
  let details = [];
  try { details = JSON.parse(detailsStr); } catch (_) {}

  // Filter out empty/invalid elements
  details = details.filter(d => d && d.trim().length > 0);

  if (details.length > 0) {
    if (reasonsWrap) reasonsWrap.style.display = "block";
    if (reasonsEl) {
      reasonsEl.innerHTML = "";
      details.forEach(d => {
        const li = document.createElement("li");
        li.textContent = d;
        reasonsEl.appendChild(li);
      });
    }
  } else {
    if (reasonsWrap) reasonsWrap.style.display = "none";
  }

  // Go back action
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      if (history.length > 1) {
        history.back();
        setTimeout(() => { window.location.href = "https://www.google.com"; }, 300);
      } else {
        window.location.href = "https://www.google.com";
      }
    });
  }

  // Bypass action
  if (btnBypass) {
    btnBypass.addEventListener("click", async () => {
      if (!blockedUrl) return;
      try {
        const hostname = new URL(blockedUrl).hostname;
        const stored = await chrome.storage.local.get({ whitelist: [] });
        const whitelist = stored.whitelist;
        if (!whitelist.includes(hostname)) {
          whitelist.push(hostname);
          await chrome.storage.local.set({ whitelist });
        }
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          chrome.runtime.sendMessage({ action: "recheckTab", tabId: tab.id, url: blockedUrl });
        } else {
          window.location.href = blockedUrl;
        }
      } catch (e) {
        window.location.href = blockedUrl;
      }
    });
  }
});
