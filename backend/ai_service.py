import os
import re
import pickle
import urllib.parse
import numpy as np
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

# List of common URL shorteners
SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "adf.ly", 
    "bit.do", "ow.ly", "goo.gl", "rebrand.ly", "tiny.cc", "shorte.st"
}

# Suspicious words commonly used in phishing URLs/subdomains
SUSPICIOUS_KEYWORDS = {
    "login", "signin", "verify", "secure", "account", "billing", "update",
    "reset", "support", "bank", "card", "auth", "chase", "paypal", "apple",
    "netflix", "amazon", "google", "wellsfargo", "microsoft", "steam",
    "instagram", "binance", "metamask", "wallet", "ref", "rewards", "free",
    "giftcard", "giveaway", "win", "iphone", "claims", "portal", "tax",
    "refund", "delivery", "fedex", "dhl", "usps", "security"
}

# Keywords for text scam categorization
URGENCY_KEYWORDS = [
    "urgent", "immediate", "suspicious", "alert", "locked", "expire", 
    "action required", "warning", "today", "suspend", "confirm", "must"
]
FINANCIAL_KEYWORDS = [
    "bank", "card", "billing", "payment", "transfer", "tax", "refund", 
    "cash", "lottery", "prize", "gift card", "crypto", "binance", "metamask", 
    "wallet", "shares", "rewards", "money", "claim", "won"
]
CREDENTIAL_KEYWORDS = [
    "verify", "login", "signin", "password", "reset", "identity", "otp", 
    "auth", "credential", "security code", "seed phrase", "username"
]

def calculate_entropy(text: str) -> float:
    """Calculate character entropy of a string (helps detect auto-generated domains)."""
    if not text:
        return 0.0
    probabilities = [float(text.count(c)) / len(text) for c in set(text)]
    entropy = -sum(p * np.log2(p) for p in probabilities)
    return float(entropy)

def extract_url_features(url: str) -> dict:
    """Extract structural and semantic features from a URL."""
    # Clean and parse URL
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
        
    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.lower()
    query = parsed.query.lower()
    
    # Remove port if present
    if ":" in domain:
        domain = domain.split(":")[0]
        
    # Feature 1: URL length
    url_len = len(url)
    
    # Feature 2: Dot count
    dot_count = url.count(".")
    
    # Feature 3: Hyphen count in domain
    hyphen_count = domain.count("-")
    
    # Feature 4: Contains IP address
    has_ip = 1 if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain) else 0
    
    # Feature 5: Contains @ symbol
    has_at = 1 if "@" in url else 0
    
    # Feature 6: Uses HTTPS
    is_https = 1 if parsed.scheme == "https" else 0
    
    # Feature 7: Redirection using // in path
    has_redirect = 1 if "//" in path else 0
    
    # Feature 8: Shortened URL
    is_shortened = 1 if domain in SHORTENERS or any(s in domain for s in SHORTENERS) else 0
    
    # Feature 9: Subdomain count (e.g. login.secure.bank.com has 3 subdomains)
    subdomain_parts = domain.split(".")
    subdomain_count = max(0, len(subdomain_parts) - 2)
    
    # Feature 10: Suspicious keyword match count in domain/path
    keyword_count = 0
    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in domain or keyword in path or keyword in query:
            keyword_count += 1
            
    # Feature 11: Character entropy of domain name
    domain_entropy = calculate_entropy(domain)
    
    return {
        "url_length": url_len,
        "dot_count": dot_count,
        "hyphen_count": hyphen_count,
        "has_ip": has_ip,
        "has_at": has_at,
        "is_https": is_https,
        "has_redirect": has_redirect,
        "is_shortened": is_shortened,
        "subdomain_count": subdomain_count,
        "keyword_count": keyword_count,
        "domain_entropy": domain_entropy
    }

class AIDangerKineticModel:
    def __init__(self):
        self.url_model = None
        self.text_pipeline = None
        self.models_dir = os.path.dirname(os.path.abspath(__file__))
        
    def train_models(self):
        """Train models if they do not exist, or reload them."""
        url_model_path = os.path.join(self.models_dir, "url_model.pkl")
        text_model_path = os.path.join(self.models_dir, "text_model.pkl")
        
        # 1. URL Model Training
        loaded_url = False
        if os.path.exists(url_model_path):
            try:
                print("Loading pre-trained URL classifier...")
                with open(url_model_path, "rb") as f:
                    self.url_model = pickle.load(f)
                # Quick verification check using predict_proba to catch version mismatches
                _ = self.url_model.predict_proba([[0]*11])
                loaded_url = True
                print("[OK] URL classifier loaded successfully.")
            except Exception as e:
                print(f"[WARN] Failed to load pre-trained URL classifier: {e}. Retraining...")
                self.url_model = None

        if not loaded_url:
            import pandas as pd
            print("Training URL classifier...")
            dataset_path = os.path.join(os.path.dirname(self.models_dir), "dataset", "urls.csv")
            if not os.path.exists(dataset_path):
                raise FileNotFoundError(f"Dataset path {dataset_path} not found. Run dataset generator first.")
                
            df = pd.read_csv(dataset_path)
            # Extract features for all rows
            features_list = []
            for url in df["url"]:
                features = extract_url_features(url)
                features_list.append(list(features.values()))
                
            X = pd.DataFrame(features_list, columns=list(extract_url_features("test.com").keys()))
            y = df["label"]
            
            # Use Random Forest Classifier for URL structures
            model = RandomForestClassifier(n_estimators=50, random_state=42)
            model.fit(X, y)
            
            self.url_model = model
            try:
                with open(url_model_path, "wb") as f:
                    pickle.dump(model, f)
                print("URL classifier trained and saved.")
            except Exception as e:
                print(f"[WARN] Failed to save trained URL classifier: {e}")
            
        # 2. Text Model Training
        loaded_text = False
        if os.path.exists(text_model_path):
            try:
                print("Loading pre-trained text classifier...")
                with open(text_model_path, "rb") as f:
                    self.text_pipeline = pickle.load(f)
                # Quick verification check using predict_proba to catch version mismatches
                _ = self.text_pipeline.predict_proba(["test text"])
                loaded_text = True
                print("[OK] Text classifier loaded successfully.")
            except Exception as e:
                print(f"[WARN] Failed to load pre-trained text classifier: {e}. Retraining...")
                self.text_pipeline = None

        if not loaded_text:
            import pandas as pd
            print("Training text classifier...")
            dataset_path = os.path.join(os.path.dirname(self.models_dir), "dataset", "messages.csv")
            if not os.path.exists(dataset_path):
                raise FileNotFoundError(f"Dataset path {dataset_path} not found. Run dataset generator first.")
                
            df = pd.read_csv(dataset_path)
            
            # Simple TF-IDF + Logistic Regression pipeline
            pipeline = Pipeline([
                ("tfidf", TfidfVectorizer(max_features=1000, stop_words="english", ngram_range=(1, 2))),
                ("clf", LogisticRegression(random_state=42))
            ])
            pipeline.fit(df["text"], df["label"])
            
            self.text_pipeline = pipeline
            try:
                with open(text_model_path, "wb") as f:
                    pickle.dump(pipeline, f)
                print("Text classifier trained and saved.")
            except Exception as e:
                print(f"[WARN] Failed to save trained text classifier: {e}")

    def predict_url(self, url: str) -> dict:
        """Predict whether a URL is a scam/phishing attempt."""
        features = extract_url_features(url)
        X_features = [list(features.values())]
        
        # Calculate heuristics base score
        score_heuristics = 0.0
        details = []
        
        if features["is_https"] == 0:
            score_heuristics += 0.25
            details.append("Insecure Connection (HTTP rather than HTTPS)")
        else:
            details.append("Secure Connection (HTTPS verified)")
            
        if features["is_shortened"] == 1:
            score_heuristics += 0.20
            details.append("Shortened link service detected (obscures destination)")
            
        if features["keyword_count"] > 0:
            score_heuristics += min(0.40, features["keyword_count"] * 0.15)
            details.append(f"Suspicious branding keywords ({features['keyword_count']}) detected in domain/path")
            
        if features["has_ip"] == 1:
            score_heuristics += 0.30
            details.append("Uses raw IP address instead of registered domain")
            
        if features["subdomain_count"] >= 3:
            score_heuristics += 0.15
            details.append(f"High subdomain count ({features['subdomain_count']}) commonly used in URL spoofing")
            
        if features["domain_entropy"] > 4.2:
            score_heuristics += 0.15
            details.append("High character entropy detected (suspicious randomized domain)")

        # Run ML model prediction
        if self.url_model:
            prob = self.url_model.predict_proba(X_features)[0][1]
        else:
            prob = min(0.99, score_heuristics)
            
        # Combine heuristics and ML scores for robust results
        confidence = float(max(prob, min(0.95, score_heuristics)))
        
        # Determine threat level
        if confidence < 0.35:
            threat_level = "safe"
        elif confidence < 0.70:
            threat_level = "warning"
        else:
            threat_level = "dangerous"
            
        return {
            "url": url,
            "threat_level": threat_level,
            "confidence": round(confidence * 100, 1),
            "features": features,
            "details": details
        }

    def predict_text(self, text: str) -> dict:
        """Predict whether a message is scam/phishing."""
        if not text.strip():
            return {
                "text": text,
                "threat_level": "safe",
                "confidence": 0.0,
                "matched_links": [],
                "urgency_words": [],
                "financial_words": [],
                "credential_words": []
            }
            
        # Heuristics analysis (word matchers)
        text_lower = text.lower()
        matched_urgency = [w for w in URGENCY_KEYWORDS if w in text_lower]
        matched_financial = [w for w in FINANCIAL_KEYWORDS if w in text_lower]
        matched_credential = [w for w in CREDENTIAL_KEYWORDS if w in text_lower]
        
        # Extract URLs
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        extracted_urls = re.findall(url_pattern, text)
        
        link_scans = []
        for url in extracted_urls:
            link_scans.append(self.predict_url(url))

        # Run ML model prediction
        if self.text_pipeline:
            prob = self.text_pipeline.predict_proba([text])[0][1]
        else:
            # Fallback heuristic calculation
            heuristic_score = 0.0
            if len(matched_urgency) > 0:
                heuristic_score += 0.25 + min(0.2, (len(matched_urgency) - 1) * 0.1)
            if len(matched_financial) > 0:
                heuristic_score += 0.25 + min(0.2, (len(matched_financial) - 1) * 0.1)
            if len(matched_credential) > 0:
                heuristic_score += 0.20 + min(0.2, (len(matched_credential) - 1) * 0.1)
            if len(extracted_urls) > 0:
                heuristic_score += 0.15
            prob = min(0.99, heuristic_score)
            
        # If the links inside the message are dangerous, boost text scam probability
        if any(scan["threat_level"] == "dangerous" for scan in link_scans):
            prob = max(prob, 0.85)
        elif any(scan["threat_level"] == "warning" for scan in link_scans):
            prob = max(prob, 0.60)

        confidence = float(prob)
        
        if confidence < 0.35:
            threat_level = "safe"
        elif confidence < 0.70:
            threat_level = "warning"
        else:
            threat_level = "dangerous"
            
        return {
            "text": text,
            "threat_level": threat_level,
            "confidence": round(confidence * 100, 1),
            "matched_links": link_scans,
            "urgency_words": matched_urgency,
            "financial_words": matched_financial,
            "credential_words": matched_credential
        }

# Instantiate global models service
ai_service = AIDangerKineticModel()
