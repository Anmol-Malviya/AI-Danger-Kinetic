"""
ShieldX AI — Scam Detector (NLP + Regex)
Analyses OCR-extracted text for phishing/scam indicators.
Returns matched keywords, suspicious links, category labels, and annotated boxes.
"""

import re
import logging
from typing import Any

logger = logging.getLogger("shieldx.scam_detector")

# ─────────────────────────────────────────────────────────────────────────────
#  Keyword dictionaries (weighted by severity)
# ─────────────────────────────────────────────────────────────────────────────

DANGEROUS_KEYWORDS: dict[str, float] = {
    # OTP / credential theft
    "enter your otp": 1.0, "share your otp": 1.0, "otp is": 0.9,
    "one time password": 0.9, "verification code": 0.8,
    # Banking fraud
    "your account has been blocked": 1.0, "account suspended": 0.95,
    "unauthorized transaction": 0.95, "kyc expired": 0.9,
    "update kyc": 0.85, "bank account locked": 0.9,
    "debit card blocked": 0.9, "credit card expired": 0.85,
    # More Indian banking & suspension keywords
    "sbi bank": 0.95, "yono sbi": 1.0, "state bank of india": 0.95,
    "will be suspended": 0.9, "avoid suspension": 0.85,
    "avoid deactivation": 0.85, "permanently deactivated": 0.95,
    "verify account": 0.85, "unusual activity": 0.8,
    "suspicious activity": 0.8, "account deactivation": 0.9,
    "kyc verification": 0.9, "yono account": 0.95,
    # Password / login
    "reset your password": 0.8, "confirm your password": 0.8,
    "login attempt": 0.75, "unusual sign-in": 0.8,
    # Reward scams
    "you have won": 0.95, "congratulations you won": 1.0,
    "claim your prize": 0.95, "free iphone": 0.9,
    "lucky winner": 0.9, "you are selected": 0.85,
    # Urgency manipulation
    "act immediately": 0.85, "immediate action required": 0.9,
    "expires in 24 hours": 0.8, "last warning": 0.85,
    "account will be deleted": 0.85, "urgent": 0.6,
    # Government impersonation
    "income tax notice": 0.9, "aadhaar linked": 0.8,
    "pan card blocked": 0.85, "epf withdrawal": 0.75,
    # Fake support
    "call our helpline": 0.7, "customer care number": 0.65,
    "technical support": 0.6, "refund process": 0.7,
}

WARNING_KEYWORDS: dict[str, float] = {
    "click here": 0.5, "click the link": 0.55,
    "verify now": 0.55, "confirm now": 0.5,
    "limited time offer": 0.5, "offer expires": 0.45,
    "free gift": 0.55, "gift card": 0.5,
    "cash back": 0.4, "earn money": 0.45,
    "work from home": 0.4, "easy money": 0.5,
    "no investment": 0.45, "100% guaranteed": 0.5,
    "whatsapp": 0.3, "telegram": 0.3,
    "bank statement": 0.4, "pan card": 0.45, "aadhaar card": 0.45,
    "customer support": 0.4, "help desk": 0.4,
}

# URL / domain extraction
URL_PATTERN = re.compile(
    r'(?:https?://|www\.)'
    r'[a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=%]+'
)

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".online", ".site", ".tk",
    ".ml", ".ga", ".cf", ".gq", ".link", ".click",
}

LEGIT_DOMAINS = {
    "google.com", "facebook.com", "youtube.com", "amazon.com",
    "apple.com", "microsoft.com", "netflix.com", "instagram.com",
    "sbi.co.in", "hdfcbank.com", "icicibank.com", "paytm.com",
    "phonepe.com", "npci.org.in", "gov.in", "nic.in",
}

SUSPICIOUS_URL_KEYWORDS = {
    "login", "verify", "secure", "account", "update", "bank",
    "paypal", "signin", "confirm", "wallet", "free", "prize",
    "winner", "kyc", "otp", "reward", "claim",
}


# ─────────────────────────────────────────────────────────────────────────────
#  Core detection function
# ─────────────────────────────────────────────────────────────────────────────

def analyze_text(full_text: str, word_blocks: list[dict]) -> dict:
    """
    Analyse OCR text for scam indicators.
    word_blocks: [{"text": str, "confidence": float, "bbox": [x,y,w,h]}]
    """
    text_lower = full_text.lower()

    # ── 1. Match dangerous keywords ───────────────────────────────────────────
    dangerous_hits: list[dict[str, Any]] = []
    warning_hits: list[dict[str, Any]] = []

    for kw, weight in DANGEROUS_KEYWORDS.items():
        if kw in text_lower:
            dangerous_hits.append({"keyword": kw, "weight": weight, "level": "dangerous"})

    for kw, weight in WARNING_KEYWORDS.items():
        if kw in text_lower:
            warning_hits.append({"keyword": kw, "weight": weight, "level": "warning"})

    # ── 2. Extract URLs ───────────────────────────────────────────────────────
    found_urls = URL_PATTERN.findall(full_text)
    suspicious_links: list[dict] = []

    for url in found_urls:
        url_lower = url.lower()
        risk_flags = []

        # Suspicious TLD?
        for tld in SUSPICIOUS_TLDS:
            if url_lower.endswith(tld) or f"{tld}/" in url_lower:
                risk_flags.append(f"Suspicious TLD: {tld}")

        # HTTP instead of HTTPS?
        if url_lower.startswith("http://"):
            risk_flags.append("Insecure HTTP (no HTTPS)")

        # Suspicious keywords in URL?
        for kw in SUSPICIOUS_URL_KEYWORDS:
            if kw in url_lower:
                risk_flags.append(f"Phishing keyword in URL: '{kw}'")
                break

        # IP address instead of domain?
        if re.search(r'https?://\d{1,3}(\.\d{1,3}){3}', url_lower):
            risk_flags.append("IP address used as domain (common in phishing)")

        # Legitimate domain impersonation? e.g. paypal-login.com
        for legit in LEGIT_DOMAINS:
            base = legit.split(".")[0]
            if base in url_lower and legit not in url_lower:
                risk_flags.append(f"Possible domain spoofing: mimics '{legit}'")

        suspicious_links.append({
            "url": url,
            "risk_flags": risk_flags,
            "is_suspicious": len(risk_flags) > 0,
        })

    # ── 3. Build threat annotation boxes ─────────────────────────────────────
    annotation_boxes: list[dict] = []
    for block in word_blocks:
        block_text_lower = block["text"].lower()
        for hit in dangerous_hits:
            if hit["keyword"] in block_text_lower:
                annotation_boxes.append({
                    "text": block["text"],
                    "bbox": block["bbox"],
                    "level": "dangerous",
                })
                break
        else:
            for hit in warning_hits:
                if hit["keyword"] in block_text_lower:
                    annotation_boxes.append({
                        "text": block["text"],
                        "bbox": block["bbox"],
                        "level": "warning",
                    })
                    break

    # ── 4. Summarise categories ───────────────────────────────────────────────
    categories = _identify_categories(text_lower, dangerous_hits, suspicious_links)

    all_keywords = [h["keyword"] for h in dangerous_hits] + [h["keyword"] for h in warning_hits]

    return {
        "dangerous_keywords": [h["keyword"] for h in dangerous_hits],
        "warning_keywords": [h["keyword"] for h in warning_hits],
        "all_keywords": all_keywords,
        "suspicious_links": suspicious_links,
        "annotation_boxes": annotation_boxes,
        "categories": categories,
        "dangerous_weight_sum": round(sum(h["weight"] for h in dangerous_hits), 3),
        "warning_weight_sum":   round(sum(h["weight"] for h in warning_hits),   3),
    }


def _identify_categories(text_lower: str, dangerous_hits: list, links: list) -> list[str]:
    cats = []
    if any(k in text_lower for k in ("otp", "one time password", "verification code")):
        cats.append("OTP / Credential Theft")
    if any(k in text_lower for k in ("account blocked", "kyc", "bank", "debit card", "sbi", "yono", "hdfc", "icici", "suspension", "deactivation")):
        cats.append("Banking Fraud")
    if any(k in text_lower for k in ("won", "prize", "lucky winner", "congratulations")):
        cats.append("Reward / Lottery Scam")
    if any(k in text_lower for k in ("income tax", "aadhaar", "pan card", "epf")):
        cats.append("Government Impersonation")
    if any(k in text_lower for k in ("reset password", "login attempt", "unusual sign")):
        cats.append("Account Takeover")
    if any(lnk["is_suspicious"] for lnk in links):
        cats.append("Phishing Link")
    if not cats and dangerous_hits:
        cats.append("Generic Scam")
    return cats if cats else ["No Threat Detected"]
