"""
ShieldX AI — OCR Engine
Wraps EasyOCR to extract text and bounding boxes from preprocessed images.
Supports English (extendable to Hindi, etc.)
"""

import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger("shieldx.ocr_engine")

# ── Lazy-load EasyOCR reader (heavy, only instantiate once) ──────────────────
_reader: Optional[object] = None

def _get_reader():
    global _reader
    if _reader is None:
        try:
            import easyocr
            logger.info("Loading EasyOCR model (first run may download weights)...")
            _reader = easyocr.Reader(
                ["en"],          # add "hi" for Hindi support
                gpu=False,       # set True if CUDA available
                verbose=False,
            )
            logger.info("EasyOCR model ready.")
        except ImportError:
            logger.error("EasyOCR not installed. Run: pip install easyocr")
            raise
    return _reader


def extract_text(image_path: str) -> dict:
    """
    Extract all visible text from an image using EasyOCR.

    Returns:
        {
            "full_text": str,        — all text joined with newlines
            "word_blocks": [         — each detected block
                {"text": str, "confidence": float, "bbox": [x, y, w, h]},
                ...
            ],
            "word_count": int,
            "char_count": int,
        }
    """
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    reader = _get_reader()

    # detail=1 returns (bbox, text, confidence)
    results = reader.readtext(str(path), detail=1, paragraph=False)

    word_blocks = []
    lines = []

    for (bbox_pts, text, confidence) in results:
        text = text.strip()
        if not text:
            continue

        # Convert EasyOCR polygon bbox → (x, y, w, h)
        xs = [int(p[0]) for p in bbox_pts]
        ys = [int(p[1]) for p in bbox_pts]
        x, y = min(xs), min(ys)
        w, h = max(xs) - x, max(ys) - y

        word_blocks.append({
            "text": text,
            "confidence": round(float(confidence), 3),
            "bbox": [x, y, w, h],
        })
        lines.append(text)

    full_text = "\n".join(lines)

    logger.info(f"OCR extracted {len(word_blocks)} blocks, {len(full_text)} chars.")
    return {
        "full_text": full_text,
        "word_blocks": word_blocks,
        "word_count": len(lines),
        "char_count": len(full_text),
    }
