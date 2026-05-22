"""
ShieldX AI — Image Scan Route  (/scan-image)
Orchestrates: upload → preprocess → OCR → scam detect → threat score → annotate
"""

import os
import uuid
import logging
from pathlib import Path

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from backend.ai.image_processor import preprocess_image, draw_threat_boxes
from backend.ai.ocr_engine      import extract_text
from backend.ai.scam_detector   import analyze_text
from backend.ai.threat_score    import compute_score
from backend.ai_service         import ai_service

logger = logging.getLogger("shieldx.image_scan")

router = APIRouter(prefix="/scan-image", tags=["Image Scan"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_SIZE_MB   = 15


@router.post(
    "",
    summary="Scan screenshot for scams via OCR + AI",
    response_description="Full scam analysis result",
)
async def scan_image(file: UploadFile = File(...)):
    """
    Accept a screenshot (email / SMS / WhatsApp / phishing page),
    run OCR + NLP + threat scoring, and return a complete analysis.
    """

    # ── Validate content type ─────────────────────────────────────────────────
    ct = (file.content_type or "").lower()
    if ct not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ct}'. Upload JPG, PNG, or WEBP."
        )

    # ── Read & size-check ─────────────────────────────────────────────────────
    image_bytes = await file.read()
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum is {MAX_SIZE_MB} MB."
        )
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── Save original upload ──────────────────────────────────────────────────
    ext = Path(file.filename or "image.png").suffix or ".png"
    upload_name = f"upload_{uuid.uuid4().hex[:10]}{ext}"
    upload_path = UPLOAD_DIR / upload_name
    upload_path.write_bytes(image_bytes)
    logger.info(f"Saved upload: {upload_path}")

    try:
        # ── 1. Preprocess with OpenCV ─────────────────────────────────────────
        logger.info("Step 1: Preprocessing image...")
        preprocess_info = preprocess_image(str(upload_path))
        processed_path  = preprocess_info["processed_path"]
        ocr_path        = preprocess_info["ocr_path"]

        # ── 2. OCR text extraction ────────────────────────────────────────────
        logger.info("Step 2: Running OCR...")
        ocr_result  = extract_text(ocr_path)
        full_text   = ocr_result["full_text"]
        word_blocks = ocr_result["word_blocks"]

        if not full_text.strip():
            # OCR found nothing — try on original
            logger.warning("Processed image yielded no text, retrying on original...")
            ocr_result  = extract_text(str(upload_path))
            full_text   = ocr_result["full_text"]
            word_blocks = ocr_result["word_blocks"]

        # ── 3. Scam detection (NLP + Regex) ───────────────────────────────────
        logger.info("Step 3: Running scam detector...")
        detection = analyze_text(full_text, word_blocks)

        # ── 3b. ML text prediction ────────────────────────────────────────────
        logger.info("Step 3b: Running ML text classifier...")
        ml_result = ai_service.predict_text(full_text)
        ml_confidence = ml_result.get("confidence", 0.0) / 100.0  # normalize to 0.0 - 1.0

        # ── 4. Threat scoring ─────────────────────────────────────────────────
        logger.info("Step 4: Computing threat score...")
        threat = compute_score(
            dangerous_weight_sum  = detection["dangerous_weight_sum"],
            warning_weight_sum    = detection["warning_weight_sum"],
            suspicious_link_count = sum(1 for l in detection["suspicious_links"] if l["is_suspicious"]),
            text_length           = ocr_result["char_count"],
            categories            = detection["categories"],
            ml_confidence         = ml_confidence,
        )

        # ── 5. Annotate image with bounding boxes ────────────────────────────
        logger.info("Step 5: Drawing annotation boxes...")
        annotated_path = draw_threat_boxes(
            ocr_path,
            detection["annotation_boxes"]
        )

        # ── Build relative paths for frontend display ─────────────────────────
        annotated_filename  = Path(annotated_path).name
        processed_filename  = preprocess_info["processed_filename"]

        # ── 6. Log Scan to DB / Fallback History ──────────────────────────────
        try:
            from backend.main import db_insert_scan
            db_insert_scan({
                "type": "Screenshot",
                "target": file.filename or "uploaded_screenshot.png",
                "threat_level": "warning" if threat["level"] == "suspicious" else threat["level"],
                "confidence": float(threat["score"]),
            })
        except Exception as db_err:
            logger.error(f"Failed to log image scan to history: {db_err}")

        return JSONResponse({
            "success":    True,
            "filename":   file.filename,

            # OCR output
            "extracted_text": full_text,
            "word_count":     ocr_result["word_count"],
            "char_count":     ocr_result["char_count"],

            # Detection
            "detected_keywords":  detection["all_keywords"],
            "dangerous_keywords": detection["dangerous_keywords"],
            "warning_keywords":   detection["warning_keywords"],
            "suspicious_links":   detection["suspicious_links"],
            "categories":         detection["categories"],

            # Threat score
            "threat_score":  threat["score"],
            "threat_level":  threat["level"],
            "verdict":       threat["verdict"],
            "explanation":   threat["explanation"],
            "score_breakdown": threat["breakdown"],

            # Image paths (served via /uploads and /processed static routes)
            "processed_image":  f"/processed/{processed_filename}",
            "annotated_image":  f"/processed/{annotated_filename}",
            "original_image":   f"/uploads/{upload_name}",

            # Metadata
            "image_metadata": {
                "original_size":  preprocess_info["original_size"],
                "processed_size": preprocess_info["processed_size"],
                "file_size_mb":   round(size_mb, 2),
            },
        })

    except Exception as e:
        logger.exception(f"Image scan pipeline failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Scan failed: {str(e)}"
        )
    finally:
        # Always clean up the raw upload to save disk space
        try:
            upload_path.unlink(missing_ok=True)
        except Exception:
            pass
        # Clean up temporary OCR image as well
        try:
            if "preprocess_info" in locals() and "ocr_path" in preprocess_info:
                Path(preprocess_info["ocr_path"]).unlink(missing_ok=True)
        except Exception:
            pass
