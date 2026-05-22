import uvicorn
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from pymongo import MongoClient, DESCENDING  # type: ignore
from pymongo.errors import ConnectionFailure  # type: ignore
import hashlib

from backend.ai_service import ai_service
from backend.routes.image_scan import router as image_scan_router

# ─────────────────────────────────────────────
# MongoDB Atlas Setup
# ─────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://anmol:4328@scoreboard.nwyuwqt.mongodb.net/?retryWrites=true&w=majority")
DB_NAME   = "ai_danger_kinetic"

mongo_client: Optional[MongoClient] = None
db = None
scan_collection = None
users_collection = None

def _hash(password: str) -> str:
    """Simple SHA-256 hash for passwords."""
    return hashlib.sha256(password.encode()).hexdigest()


def connect_mongo():
    global mongo_client, db, scan_collection, users_collection
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_client.admin.command("ping")
        db = mongo_client[DB_NAME]
        scan_collection = db["scan_history"]
        scan_collection.create_index([("timestamp", DESCENDING)])
        users_collection = db["users"]
        users_collection.create_index("username", unique=True)
        # Seed default admin account if no users exist
        if users_collection.count_documents({}) == 0:
            users_collection.insert_many([
                {"username": "admin", "password_hash": _hash("admin"), "created_at": datetime.now(timezone.utc).isoformat()},
                {"username": "demo",  "password_hash": _hash("demo123"), "created_at": datetime.now(timezone.utc).isoformat()},
            ])
            print("[INFO] Seeded default users: admin/admin, demo/demo123")
        print(f"[OK] MongoDB connected -> database: '{DB_NAME}', collections: scan_history, users")
        return True
    except ConnectionFailure as e:
        print(f"[WARN] MongoDB connection failed: {e}. Falling back to in-memory storage.")
        return False

# ─────────────────────────────────────────────
# In-memory fallback (used if MongoDB is down)
# ─────────────────────────────────────────────
fallback_history: list = []
fallback_counter = 1

# ─────────────────────────────────────────────
# Helper: read / write scan history
# ─────────────────────────────────────────────
def db_insert_scan(entry: dict, user_id: str = None):
    """Insert a scan record. Uses MongoDB if connected, else in-memory list."""
    global fallback_counter
    if user_id:
        entry["user_id"] = user_id
        
    if scan_collection is not None:
        # MongoDB: strip _id so we don't serialize it later
        scan_collection.insert_one({**entry, "timestamp": datetime.now(timezone.utc).isoformat()})
    else:
        entry["id"] = fallback_counter
        fallback_counter += 1
        fallback_history.insert(0, entry)


def db_get_history(limit: int = 20, user_id: str = None) -> List[dict]:
    """Fetch latest scan records."""
    query = {"user_id": user_id} if user_id else {}
    if scan_collection is not None:
        docs = []
        for doc in scan_collection.find(query).sort("timestamp", DESCENDING).limit(limit):
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            docs.append(doc)
        return docs
        
    if user_id:
        filtered = [x for x in fallback_history if x.get("user_id") == user_id]
        return filtered[:limit]
    return fallback_history[:limit]


def db_get_stats(user_id: str = None) -> dict:
    """Aggregate threat stats across all stored scans."""
    query = {"user_id": user_id} if user_id else {}
    if scan_collection is not None:
        total = scan_collection.count_documents(query)
        dangerous = scan_collection.count_documents({**query, "threat_level": "dangerous"})
        warning   = scan_collection.count_documents({**query, "threat_level": "warning"})
        safe      = scan_collection.count_documents({**query, "threat_level": "safe"})
    else:
        filtered = [x for x in fallback_history if x.get("user_id") == user_id] if user_id else fallback_history
        total    = len(filtered)
        dangerous = sum(1 for x in filtered if x["threat_level"] == "dangerous")
        warning   = sum(1 for x in filtered if x["threat_level"] == "warning")
        safe      = sum(1 for x in filtered if x["threat_level"] == "safe")
    return {"total": total, "dangerous": dangerous, "warning": warning, "safe": safe}


# ─────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("AI Danger Kinetic: Initializing Model Engines...")
        ai_service.train_models()
        print("AI Danger Kinetic: ML Models ready for inference.")
    except Exception as e:
        print(f"AI Danger Kinetic: Model training error: {e}")

    try:
        print("AI Danger Kinetic: Checking Tesseract OCR availability...")
        from backend.ai.ocr_engine import is_tesseract_available
        if is_tesseract_available():
            print("[OK] Tesseract OCR is available.")
        else:
            print("[WARN] Tesseract OCR is not found. Please install Tesseract-OCR.")
    except Exception as e:
        print(f"[WARN] Tesseract availability check failed: {e}")

    connect_mongo()
    yield
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed.")

app = FastAPI(
    title="AI Danger Kinetic – Scam & Phishing Detection System",
    description="FastAPI Backend powered by Scikit-learn NLP & Heuristics Engines + MongoDB Atlas",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Image scan route ──────────────────────────────────────────────────────────
app.include_router(image_scan_router)

# ── Serve processed & uploaded images as static files ────────────────────────
_BASE = Path(__file__).parent
_UPLOADS_DIR   = _BASE / "uploads"
_PROCESSED_DIR = _BASE / "processed"
_UPLOADS_DIR.mkdir(exist_ok=True)
_PROCESSED_DIR.mkdir(exist_ok=True)
app.mount("/uploads",   StaticFiles(directory=str(_UPLOADS_DIR)),   name="uploads")
app.mount("/processed", StaticFiles(directory=str(_PROCESSED_DIR)), name="processed")





# ─────────────────────────────────────────────
# Auth Schemas
# ─────────────────────────────────────────────
class AuthRequest(BaseModel):
    username: str
    password: str

# ─────────────────────────────────────────────
# Auth Routes
# ─────────────────────────────────────────────
# Offline fallback user store (if MongoDB unavailable)
_offline_users: dict = {"admin": _hash("admin"), "demo": _hash("demo123")}

@app.post("/auth/register")
def register(request: AuthRequest):
    username = request.username.strip().lower()
    if not username or not request.password:
        raise HTTPException(status_code=400, detail="Username and password required.")
    if len(request.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")
    pw_hash = _hash(request.password)
    if users_collection is not None:
        if users_collection.find_one({"username": username}):
            raise HTTPException(status_code=409, detail="Username already exists.")
        users_collection.insert_one({
            "username": username,
            "password_hash": pw_hash,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    else:
        if username in _offline_users:
            raise HTTPException(status_code=409, detail="Username already exists.")
        _offline_users[username] = pw_hash
    return {"message": f"Account created for '{username}'. You can now log in."}


@app.post("/auth/login")
def login(request: AuthRequest):
    username = request.username.strip().lower()
    pw_hash = _hash(request.password)
    if users_collection is not None:
        user = users_collection.find_one({"username": username}, {"_id": 0})
        if not user or user.get("password_hash") != pw_hash:
            raise HTTPException(status_code=401, detail="Invalid username or password.")
    else:
        if _offline_users.get(username) != pw_hash:
            raise HTTPException(status_code=401, detail="Invalid username or password.")
    return {"message": "Login successful.", "username": username}


# ─────────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────────
class UrlScanRequest(BaseModel):
    url: str
    user_id: Optional[str] = None

class TextScanRequest(BaseModel):
    text: str
    user_id: Optional[str] = None


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
@app.post("/scan-url")
def scan_url(request: UrlScanRequest):
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    try:
        result = ai_service.predict_url(url)
        db_insert_scan({
            "type": "URL",
            "target": url if len(url) < 60 else url[:57] + "...",
            "threat_level": result["threat_level"],
            "confidence": result["confidence"],
        }, request.user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scan-text")
def scan_text(request: TextScanRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message text cannot be empty")

    try:
        result = ai_service.predict_text(text)
        scan_type = "Email" if len(text) > 160 else "SMS"
        db_insert_scan({
            "type": scan_type,
            "target": text if len(text) < 60 else text[:57] + "...",
            "threat_level": result["threat_level"],
            "confidence": result["confidence"],
        }, request.user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scan-qr")
async def scan_qr(file: UploadFile = File(...), user_id: Optional[str] = Form(None)):
    import cv2
    import numpy as np

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Could not read image. Upload a valid PNG/JPG/WEBP file.")

        extracted_url = None
        detector = cv2.QRCodeDetector()

        # Pass 1: decode the original image
        data, _, _ = detector.detectAndDecode(img)
        if data:
            extracted_url = data.strip()

        # Pass 2: grayscale + upscale + OTSU threshold (helps low-res QR codes)
        if not extracted_url:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            enlarged = cv2.resize(gray, (gray.shape[1] * 2, gray.shape[0] * 2), interpolation=cv2.INTER_CUBIC)
            _, thresh = cv2.threshold(enlarged, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            data2, _, _ = detector.detectAndDecode(thresh)
            if data2:
                extracted_url = data2.strip()

        if not extracted_url:
            raise HTTPException(
                status_code=422,
                detail="No QR code detected in the image. Upload a clear, well-lit QR code (PNG/JPG works best)."
            )

        result = ai_service.predict_url(extracted_url)
        db_insert_scan({
            "type": "QR Code",
            "target": f"QR: {extracted_url[:50]}..." if len(extracted_url) > 50 else f"QR: {extracted_url}",
            "threat_level": result["threat_level"],
            "confidence": result["confidence"],
        }, user_id)
        return {"filename": file.filename, "decoded_url": extracted_url, "scan_results": result}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR scan failed: {str(e)}")


@app.get("/threat-score")
def get_threat_score(user_id: Optional[str] = None):
    stats = db_get_stats(user_id)
    total    = stats["total"]
    dangerous = stats["dangerous"]
    warning   = stats["warning"]
    safe      = stats["safe"]

    if total == 0:
        return {
            "threat_score": 0.0, "total_scans": 0,
            "metrics": {"safe": 0, "warning": 0, "dangerous": 0},
            "description": "No scans performed yet.",
            "history": []
        }

    total_weights = (dangerous * 1.0) + (warning * 0.5)
    threat_index  = round((total_weights / total) * 100, 1)

    if threat_index < 30:
        description = (
            f"AI Danger Kinetic reports a LOW Security Threat Index of {threat_index}%. "
            f"No major anomalies were detected in the text semantics or URL structure."
        )
    elif threat_index < 70:
        description = (
            f"AI Danger Kinetic reports a MODERATE Security Threat Index of {threat_index}%. "
            f"Some warnings were triggered. Please exercise caution and verify the source."
        )
    else:
        description = (
            f"AI Danger Kinetic reports an ELEVATED Threat Index of {threat_index}%. "
            f"Multiple dangerous heuristics matched. Do not click links or provide sensitive information."
        )

    return {
        "threat_score": threat_index,
        "total_scans": total,
        "metrics": {"safe": safe, "warning": warning, "dangerous": dangerous},
        "description": description,
        "history": db_get_history(10, user_id)
    }


# Aliases
@app.get("/threat-report")
def get_threat_report(user_id: Optional[str] = None):
    return get_threat_score(user_id)

@app.get("/dashboard-stats")
def get_dashboard_stats(user_id: Optional[str] = None):
    return get_threat_score(user_id)

# Health check
@app.get("/health")
def health():
    mongo_ok = scan_collection is not None
    return {
        "status": "online",
        "mongodb": "connected" if mongo_ok else "fallback (in-memory)",
        "db": DB_NAME if mongo_ok else "N/A",
        "collection": "scan_history" if mongo_ok else "N/A"
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
