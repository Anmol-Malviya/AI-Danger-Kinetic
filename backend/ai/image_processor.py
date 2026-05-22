"""
AI Danger Kinetic — Image Preprocessor
Uses OpenCV to clean, enhance, and prepare screenshots for OCR.
Pipeline: grayscale → denoise → sharpen → OTSU threshold → CLAHE contrast
"""

import cv2
import numpy as np
from pathlib import Path
import uuid
import logging

logger = logging.getLogger("ai_danger_kinetic.image_processor")

# ─── Output directory ────────────────────────────────────────────────────────
PROCESSED_DIR = Path(__file__).parent.parent / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def preprocess_image(image_path: str) -> dict:
    """
    Full preprocessing pipeline.
    Returns a dict with the processed image path + metadata.
    """
    src = Path(image_path)
    if not src.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    img = cv2.imread(str(src))
    if img is None:
        raise ValueError("OpenCV could not decode the image. Check file format.")

    original_shape = img.shape  # (H, W, C)

    # ── Step 1: Resize for OCR sweet spot (max 2000px wide) ──────────────────
    h, w = img.shape[:2]
    max_w = 2000
    if w > max_w:
        scale = max_w / w
        img = cv2.resize(img, (max_w, int(h * scale)), interpolation=cv2.INTER_LANCZOS4)

    # ── Step 2: Grayscale ─────────────────────────────────────────────────────
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # ── Step 3: Noise reduction (Non-local Means) ─────────────────────────────
    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

    # ── Step 4: Sharpening (unsharp mask) ────────────────────────────────────
    blurred = cv2.GaussianBlur(denoised, (0, 0), 3)
    sharpened = cv2.addWeighted(denoised, 1.5, blurred, -0.5, 0)

    # ── Step 5: CLAHE contrast enhancement ───────────────────────────────────
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(sharpened)

    # ── Step 6: Adaptive threshold (works for both dark/light backgrounds) ───
    thresh = cv2.adaptiveThreshold(
        enhanced, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 10
    )

    # ── Save processed image ──────────────────────────────────────────────────
    out_name = f"processed_{uuid.uuid4().hex[:8]}.png"
    out_path = PROCESSED_DIR / out_name
    cv2.imwrite(str(out_path), thresh)

    # ── Save resized color image for high-accuracy OCR ────────────────────────
    ocr_name = f"ocr_{uuid.uuid4().hex[:8]}.png"
    ocr_path = PROCESSED_DIR / ocr_name
    cv2.imwrite(str(ocr_path), img)

    logger.info(f"Preprocessed image saved: {out_path}, OCR image saved: {ocr_path}")
    return {
        "processed_path": str(out_path),
        "processed_filename": out_name,
        "ocr_path": str(ocr_path),
        "ocr_filename": ocr_name,
        "original_size": f"{original_shape[1]}x{original_shape[0]}",
        "processed_size": f"{thresh.shape[1]}x{thresh.shape[0]}",
    }


def draw_threat_boxes(image_path: str, boxes: list[dict]) -> str:
    """
    Draw red/yellow bounding boxes around suspicious regions.
    boxes = [{"text": str, "bbox": (x, y, w, h), "level": "dangerous"|"warning"}]
    Returns path to annotated image.
    """
    img = cv2.imread(image_path)
    if img is None:
        return image_path  # fallback: return original

    COLOR_DANGEROUS = (0, 0, 255)   # BGR red
    COLOR_WARNING   = (0, 165, 255) # BGR orange
    COLOR_SAFE      = (0, 200, 100) # BGR green

    for box in boxes:
        x, y, w, h = box.get("bbox", (0, 0, 0, 0))
        level = box.get("level", "warning")
        text  = box.get("text", "")

        color = (
            COLOR_DANGEROUS if level == "dangerous"
            else COLOR_WARNING if level == "warning"
            else COLOR_SAFE
        )
        thickness = 2 if level == "dangerous" else 1

        # Draw rectangle
        cv2.rectangle(img, (x, y), (x + w, y + h), color, thickness)

        # Label above the box
        label = f"[{level.upper()}]"
        cv2.putText(
            img, label,
            (x, max(y - 6, 12)),
            cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1, cv2.LINE_AA
        )

    # Save annotated version
    out_name = f"annotated_{uuid.uuid4().hex[:8]}.png"
    out_path = PROCESSED_DIR / out_name
    cv2.imwrite(str(out_path), img)
    return str(out_path)
