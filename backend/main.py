import uvicorn
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from pymongo import MongoClient, DESCENDING
from pymongo.errors import ConnectionFailure
import hashlib

from backend.ai_service import ai_service
from backend.routes.image_scan import router as image_scan_router

# ─────────────────────────────────────────────
# MongoDB Atlas Setup
# ─────────────────────────────────────────────
MONGO_URI = "mongodb+srv://anmol:4328@scoreboard.nwyuwqt.mongodb.net/?retryWrites=true&w=majority"
DB_NAME   = "shieldx_ai"

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
fallback_history = [
    {
        "id": 1, "type": "URL",
        "target": "https://www.paypal.com",
        "threat_level": "safe", "confidence": 4.2,
        "timestamp": "2026-05-22T18:30:10Z"
    },
    {
        "id": 2, "type": "SMS",
        "target": "URGENT: Your Chase account is locked. Verify now at http://chase-banking-alert.net/verify",
        "threat_level": "dangerous", "confidence": 98.4,
        "timestamp": "2026-05-22T18:35:15Z"
    },
    {
        "id": 3, "type": "URL",
        "target": "http://netflix-verify-account.info/login",
        "threat_level": "dangerous", "confidence": 94.1,
        "timestamp": "2026-05-22T18:42:02Z"
    },
    {
        "id": 4, "type": "Email",
        "target": "Hey John, did you receive the PDF slides for our review meeting tomorrow?",
        "threat_level": "safe", "confidence": 12.5,
        "timestamp": "2026-05-22T18:50:40Z"
    }
]
fallback_counter = 5

# ─────────────────────────────────────────────
# Helper: read / write scan history
# ─────────────────────────────────────────────
def db_insert_scan(entry: dict):
    """Insert a scan record. Uses MongoDB if connected, else in-memory list."""
    global fallback_counter
    if scan_collection is not None:
        # MongoDB: strip _id so we don't serialize it later
        scan_collection.insert_one({**entry, "timestamp": datetime.now(timezone.utc).isoformat()})
    else:
        entry["id"] = fallback_counter
        fallback_counter += 1
        fallback_history.insert(0, entry)


def db_get_history(limit: int = 20) -> List[dict]:
    """Fetch latest scan records."""
    if scan_collection is not None:
        docs = []
        for doc in scan_collection.find().sort("timestamp", DESCENDING).limit(limit):
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            docs.append(doc)
        return docs
    return fallback_history[:limit]


def db_get_stats() -> dict:
    """Aggregate threat stats across all stored scans."""
    if scan_collection is not None:
        total = scan_collection.count_documents({})
        dangerous = scan_collection.count_documents({"threat_level": "dangerous"})
        warning   = scan_collection.count_documents({"threat_level": "warning"})
        safe      = scan_collection.count_documents({"threat_level": "safe"})
    else:
        total    = len(fallback_history)
        dangerous = sum(1 for x in fallback_history if x["threat_level"] == "dangerous")
        warning   = sum(1 for x in fallback_history if x["threat_level"] == "warning")
        safe      = sum(1 for x in fallback_history if x["threat_level"] == "safe")
    return {"total": total, "dangerous": dangerous, "warning": warning, "safe": safe}


# ─────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────
app = FastAPI(
    title="ShieldX AI – Scam & Phishing Detection System",
    description="FastAPI Backend powered by Scikit-learn NLP & Heuristics Engines + MongoDB Atlas",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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


@app.on_event("startup")
def startup_event():
    print("ShieldX AI: Initializing Model Engines...")
    try:
        ai_service.train_models()
        print("ShieldX AI: ML Models ready for inference.")
    except Exception as e:
        print(f"ShieldX AI: Model training error: {e}")

    connect_mongo()


@app.on_event("shutdown")
def shutdown_event():
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed.")


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

class TextScanRequest(BaseModel):
    text: str


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
        })
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
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scan-qr")
async def scan_qr(file: UploadFile = File(...)):
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
        })
        return {"filename": file.filename, "decoded_url": extracted_url, "scan_results": result}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR scan failed: {str(e)}")


@app.get("/threat-score")
def get_threat_score():
    stats = db_get_stats()
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

    if threat_index < 35:
        description = (
            f"ShieldX AI reports a LOW Security Threat Index of {threat_index}%. "
            f"The environment appears safe across {total} total scans. "
            "Domains inspected show valid SSL/TLS and no suspicious keyword signatures."
        )
    elif threat_index < 70:
        description = (
            f"ShieldX AI reports a MODERATE Security Threat Index of {threat_index}%. "
            f"{warning} medium-risk warnings detected across {total} scans. "
            "Review flagged URLs carefully before submitting credentials."
        )
    else:
        description = (
            f"ShieldX AI reports an ELEVATED Threat Index of {threat_index}%. "
            f"CRITICAL: {dangerous} dangerous targets detected out of {total} total scans. "
            "Lookalike domains and high-urgency SMS scams identified. Do NOT enter credentials on flagged sites."
        )

    return {
        "threat_score": threat_index,
        "total_scans": total,
        "metrics": {"safe": safe, "warning": warning, "dangerous": dangerous},
        "description": description,
        "history": db_get_history(10)
    }


# Aliases
@app.get("/threat-report")
def get_threat_report():
    return get_threat_score()

@app.get("/dashboard-stats")
def get_dashboard_stats():
    return get_threat_score()

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
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
