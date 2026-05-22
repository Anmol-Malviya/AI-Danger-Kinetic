"""
AI Danger Kinetic — OCR Engine (Tesseract)
Wraps pytesseract to extract text and bounding boxes from preprocessed images.
Optimized for ultra-low memory usage on constrained containers (e.g. Render Free Tier).
"""

import logging
import os
import shutil
from pathlib import Path
from typing import Optional
import pytesseract
from pytesseract import Output
from PIL import Image

logger = logging.getLogger("ai_danger_kinetic.ocr_engine")

# Check if tesseract is installed in the system PATH or common paths
_tesseract_available: Optional[bool] = None

def is_tesseract_available() -> bool:
    global _tesseract_available
    if _tesseract_available is None:
        cmd = shutil.which("tesseract")
        if cmd is not None:
            pytesseract.pytesseract.tesseract_cmd = cmd
            _tesseract_available = True
        else:
            # Check common Windows installation paths as fallback
            common_paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            ]
            local_appdata = os.getenv("LOCALAPPDATA")
            if local_appdata:
                common_paths.append(str(Path(local_appdata) / "Tesseract-OCR" / "tesseract.exe"))
            for path in common_paths:
                if Path(path).exists():
                    pytesseract.pytesseract.tesseract_cmd = path
                    _tesseract_available = True
                    break
            else:
                _tesseract_available = False
    return _tesseract_available


def extract_text(image_path: str) -> dict:
    """
    Extract all visible text from an image using Tesseract OCR.
    Reconstructs line-level word blocks and phrase bounding boxes for compatibility.

    Returns:
        {
            "full_text": str,        — all text joined with newlines
            "word_blocks": [         — each detected line block
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

    if not is_tesseract_available():
        logger.error("Tesseract OCR is not installed or not in system PATH.")
        raise RuntimeError("OCR Engine dependencies (Tesseract-OCR) are missing.")

    logger.info(f"Running Tesseract OCR on {image_path}...")
    try:
        # Load image via Pillow
        img = Image.open(path)
        
        # Get OCR data including bounding boxes, confidence, and line/word structure
        data = pytesseract.image_to_data(img, output_type=Output.DICT)
        
        # Ensure we have all required keys to prevent KeyError
        required_keys = ['text', 'conf', 'block_num', 'par_num', 'line_num', 'left', 'top', 'width', 'height']
        if not data or not all(k in data for k in required_keys):
            logger.warning("Pytesseract output dict is missing keys or empty.")
            return {
                "full_text": "",
                "word_blocks": [],
                "word_count": 0,
                "char_count": 0,
            }

        # Group words by line (block_num, par_num, line_num) to reconstruct lines and phrase-level bounding boxes
        n_boxes = len(data['text'])
        line_groups = {}
        for i in range(n_boxes):
            # Safe boundary check
            if any(len(data[k]) <= i for k in required_keys):
                continue

            text = str(data['text'][i]).strip()
            
            # Safe confidence conversion
            try:
                conf = float(data['conf'][i])
            except (ValueError, TypeError):
                conf = -1.0

            # Skip empty text or low-confidence boxes (Tesseract returns -1 for structural blocks)
            if not text or conf < 0:
                continue
                
            # Safe numeric conversion for coordinates
            try:
                block_num = int(data['block_num'][i])
                par_num = int(data['par_num'][i])
                line_num = int(data['line_num'][i])
                left = int(data['left'][i])
                top = int(data['top'][i])
                width = int(data['width'][i])
                height = int(data['height'][i])
            except (ValueError, TypeError):
                continue

            key = (block_num, par_num, line_num)
            if key not in line_groups:
                line_groups[key] = []
            line_groups[key].append({
                "text": text,
                "confidence": conf,
                "left": left,
                "top": top,
                "width": width,
                "height": height,
            })
            
        word_blocks = []
        lines = []
        
        for key in sorted(line_groups.keys()):
            words_in_line = line_groups[key]
            line_text = " ".join([w["text"] for w in words_in_line])
            
            # Calculate the bounding box for the entire line (minimum box containing all words)
            x_min = min(w["left"] for w in words_in_line)
            y_min = min(w["top"] for w in words_in_line)
            x_max = max(w["left"] + w["width"] for w in words_in_line)
            y_max = max(w["top"] + w["height"] for w in words_in_line)
            
            w_line = x_max - x_min
            h_line = y_max - y_min
            
            # Average confidence of words in the line
            avg_conf = sum(w["confidence"] for w in words_in_line) / len(words_in_line)
            
            word_blocks.append({
                "text": line_text,
                "confidence": round(avg_conf / 100.0, 3),
                "bbox": [x_min, y_min, w_line, h_line],
            })
            lines.append(line_text)
            
        full_text = "\n".join(lines)
        logger.info(f"Tesseract OCR extracted {len(word_blocks)} lines, {len(full_text)} chars.")
        
        return {
            "full_text": full_text,
            "word_blocks": word_blocks,
            "word_count": len(word_blocks),
            "char_count": len(full_text),
        }
    except Exception as e:
        logger.exception(f"Tesseract OCR failed: {e}")
        raise
