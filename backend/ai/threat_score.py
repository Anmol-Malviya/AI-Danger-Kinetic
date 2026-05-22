"""
AI Danger Kinetic — Threat Score Engine
Computes a 0-100 risk score from scam detection signals.
0-30 → Safe  |  31-60 → Suspicious  |  61-100 → Dangerous
"""

import math
import logging

logger = logging.getLogger("ai_danger_kinetic.threat_score")


def compute_score(
    dangerous_weight_sum: float,
    warning_weight_sum: float,
    suspicious_link_count: int,
    text_length: int,
    categories: list[str],
    ml_confidence: float = 0.0,
) -> dict:
    """
    Compute a normalised threat score.
    All inputs come from scam_detector.analyze_text() and ML predictions.
    """

    # ── Base score from keywords ──────────────────────────────────────────────
    # Dangerous keywords contribute up to 70 points (soft cap via log curve)
    dangerous_score = min(70.0, dangerous_weight_sum * 25)

    # Warning keywords contribute up to 20 points
    warning_score = min(20.0, warning_weight_sum * 10)

    # ── Suspicious link bonus ─────────────────────────────────────────────────
    link_score = min(15.0, suspicious_link_count * 7)

    # ── Category multiplier ───────────────────────────────────────────────────
    HIGH_RISK_CATS = {"OTP / Credential Theft", "Banking Fraud", "Account Takeover", "Phishing Link"}
    cat_boost = 5.0 if any(c in HIGH_RISK_CATS for c in categories) else 0.0

    # ── Text length penalty (very short text = uncertain) ────────────────────
    if text_length < 20:
        uncertainty_penalty = 10.0  # reduce score: not enough text
    else:
        uncertainty_penalty = 0.0

    heuristics_raw = dangerous_score + warning_score + link_score + cat_boost - uncertainty_penalty
    heuristics_score = max(0, min(100, round(heuristics_raw)))

    # ── ML Score Combination ──────────────────────────────────────────────────
    ml_score = ml_confidence * 100.0
    if ml_confidence >= 0.75:
        # High ML confidence ensures dangerous classification, boosting lower heuristics
        score = max(heuristics_score, round(ml_score * 0.8 + heuristics_score * 0.2))
    elif ml_confidence >= 0.35:
        # Moderate ML confidence makes it at least suspicious
        score = max(heuristics_score, round(ml_score * 0.6 + heuristics_score * 0.4))
    else:
        # Low ML confidence: trust heuristics
        score = heuristics_score

    # Ensure score remains bounded
    score = max(0, min(100, score))

    # ── Classify ──────────────────────────────────────────────────────────────
    if score <= 30:
        level = "safe"
        verdict = "No significant scam indicators detected in this image."
    elif score <= 60:
        level = "suspicious"
        verdict = "Some suspicious patterns found. Exercise caution before clicking links or sharing information."
    else:
        level = "dangerous"
        verdict = "HIGH RISK: Multiple scam/phishing indicators detected. Do not share personal information or click any links."

    # ── Explanation paragraph ─────────────────────────────────────────────────
    explanation = _build_explanation(
        score, level, dangerous_weight_sum, warning_weight_sum,
        suspicious_link_count, categories
    )

    logger.info(f"Threat score computed: {score} ({level}) with ML confidence: {ml_confidence:.2f}")
    return {
        "score": score,
        "level": level,
        "verdict": verdict,
        "explanation": explanation,
        "breakdown": {
            "dangerous_keyword_score": round(dangerous_score, 1),
            "warning_keyword_score":   round(warning_score, 1),
            "suspicious_link_score":   round(link_score, 1),
            "category_boost":          round(cat_boost, 1),
            "ml_classifier_score":     round(ml_score, 1),
        },
    }


def _build_explanation(
    score: int, level: str,
    dw: float, ww: float,
    links: int, categories: list[str]
) -> str:
    parts = [f"AI Danger Kinetic assigned a threat score of {score}/100 ({level.upper()})."]

    if dw > 0:
        parts.append(
            f"High-severity scam phrases were detected (combined severity weight: {dw:.2f}), "
            "indicating a likely scam attempt."
        )
    if ww > 0:
        parts.append(
            f"Additionally, {ww:.2f} units of moderate-risk language was found, "
            "suggesting manipulative or urgency-based messaging."
        )
    if links > 0:
        parts.append(
            f"{links} suspicious link(s) were identified with phishing indicators such as "
            "insecure HTTP, suspicious TLDs, or domain spoofing."
        )
    if categories and categories != ["No Threat Detected"]:
        parts.append(f"Scam categories identified: {', '.join(categories)}.")

    if level == "safe":
        parts.append(
            "The content appears to be legitimate. No immediate action required."
        )
    elif level == "suspicious":
        parts.append(
            "We recommend verifying this message through official channels before responding."
        )
    else:
        parts.append(
            "Immediately delete this message, block the sender, and report it to cybercrime authorities."
        )

    return " ".join(parts)
