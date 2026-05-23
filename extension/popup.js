document.addEventListener("DOMContentLoaded", async () => {
  const brandDot     = document.getElementById("brand-dot");
  const domainEl     = document.getElementById("domain-name");
  const chipEl       = document.getElementById("chip");
  const toggleEl     = document.getElementById("toggle");
  const warningBlock = document.getElementById("warning-block");
  const barFill      = document.getElementById("bar-fill");
  const scoreVal     = document.getElementById("score-val");
  const reasons      = document.getElementById("reasons");
  const dashBtn      = document.getElementById("open-dashboard");

  dashBtn.addEventListener("click", () =>
    chrome.tabs.create({ url: "http://localhost:5173" })
  );

  // Load settings
  const { isEnabled = true } = await chrome.storage.local.get("isEnabled");
  setToggle(isEnabled);

  toggleEl.addEventListener("click", async () => {
    const cur = toggleEl.classList.contains("on");
    const next = !cur;
    await chrome.storage.local.set({ isEnabled: next });
    setToggle(next);
    chrome.runtime.sendMessage({ action: "toggleGuardian", isEnabled: next });
    await render();
  });

  function setToggle(on) {
    toggleEl.classList.toggle("on", on);
  }

  // Active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let hostname = "";
  try {
    hostname = new URL(tab?.url || "").hostname.replace(/^www\./, "");
  } catch (_) {}

  domainEl.textContent = hostname || "—";

  await render();

  async function render() {
    const { isEnabled = true, whitelist = [] } =
      await chrome.storage.local.get(["isEnabled", "whitelist"]);

    const url = tab?.url || "";
    const internal =
      !url ||
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1";

    if (internal)            return setState("safe",    0, []);
    if (!isEnabled)          return setState("disabled",0, []);
    if (whitelist.includes(hostname)) return setState("safe", 0, []);

    const data = (await chrome.storage.local.get(`tab_status_${tab.id}`))[`tab_status_${tab.id}`];
    if (!data)               return setState("scanning", 0, []);

    setState(data.threat_level, data.confidence || 0, data.details || []);
  }

  function setState(level, confidence, details) {
    // Reset
    brandDot.className = "brand-dot";
    domainEl.className = "domain";
    chipEl.className   = "chip";
    warningBlock.style.display = "none";

    const chipLabels = {
      safe:      "SAFE",
      warning:   "WARNING",
      dangerous: "DANGEROUS",
      disabled:  "OFF",
      scanning:  "SCANNING",
    };
    chipEl.textContent = chipLabels[level] || level.toUpperCase();

    if (level === "safe") {
      brandDot.classList.add("live");
      chipEl.classList.add("safe");

    } else if (level === "warning") {
      brandDot.classList.add("live");
      chipEl.classList.add("warn");
      domainEl.classList.add("warn-c");
      showWarning(confidence, details);

    } else if (level === "dangerous") {
      brandDot.classList.add("alert");
      chipEl.classList.add("danger");
      domainEl.classList.add("danger-c");
      showWarning(confidence, details);

    }
    // disabled / scanning: dots stay grey, warning stays hidden
  }

  function showWarning(confidence, details) {
    warningBlock.style.display = "flex";
    scoreVal.textContent = `${Math.round(confidence)}%`;
    setTimeout(() => { barFill.style.width = `${confidence}%`; }, 30);

    reasons.innerHTML = "";
    (details || []).slice(0, 3).forEach(d => {
      const li = document.createElement("li");
      li.textContent = d;
      reasons.appendChild(li);
    });
  }
});
