# AI Danger Kinetic - Chrome Extension (Threat Guardian)

This browser extension implements real-time inline URL threat classification and interception for the **AI Danger Kinetic** suite, matching the cyberpunk design system and behavior simulated on the project dashboard.

## Features
- **Active Guardian Mode**: Real-time interceptor that blocks domains before the page begins loading/executing scripts.
- **AI Classification**: Integrates directly with the local FastAPI backend classifier (`http://localhost:8000/scan-url`).
- **Cyberpunk UI Popup**: Glassmorphic panel displaying safety level, threat score, and matched heuristic details for the current active tab.
- **Dynamic Badges**: Updates tab icons and colors dynamically (Green `SAFE`, Red `BLKD` for dangerous URLs, Orange `WARN` for warnings, Cyan `SCAN` during evaluation, and Slate `OFF` when disabled).
- **Temporary Whitelist Overrides**: Allows users to trust and whitelist domains directly from the popup or blocked warning screen.

---

## How to Install (Chrome / Edge / Brave / Chromium)

1. Open your browser and navigate to the Extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click the **Load unpacked** button (top-left corner).
4. Select the `extension` folder inside this project directory (`Projects/hackathon/extension`).
5. Pin the extension to your toolbar for easy access.

---

## Requirements

The extension queries the local AI Danger Kinetic FastAPI backend. Ensure the backend is running:
1. Double-click `run.bat` at the project root or run:
   ```bash
   cd backend
   python -m backend.main
   ```
2. The server should be live on `http://localhost:8000`.

---

## How to Test

1. **Test Safe Sites**:
   - Navigate to `https://www.google.com` or `https://github.com`.
   - Click the extension icon. It will display a green **SAFE** badge.
2. **Test Phishing Domains**:
   - Try visiting one of the simulation test links (e.g., `http://secure-login-paypal.com/login` or `http://chase-banking-alert.net/verify`).
   - The extension will intercept the request, cancel rendering, and redirect you to a custom **AI Danger Kinetic Blocked Page**.
   - Review the matched heuristic flags (e.g. "Insecure Connection (HTTP)", "Suspicious branding keywords (paypal) detected").
3. **Verify Safety Actions**:
   - Click **Go Back to Safety** on the block page to return to your previous page.
   - Try the link again, and click **Continue Anyway**. The extension will add the domain to your temporary whitelist and successfully load the page.
4. **Active Guardian Switch**:
   - Open the extension popup panel and toggle **Active Guardian Mode** to off.
   - The badge turns to `OFF`. Visit the phishing links; they will no longer be intercepted, showing that protection is disabled.
