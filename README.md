# SHIELDX AI - AI Cyber Security Suite (Real-Time Threat Intelligence)

**SHIELDX AI** is an advanced AI-powered cyber security platform that simulates real-time protection against phishing, malware, and hacking attempts. It features a sophisticated threat detection engine, predictive analytics, and a browser extension that blocks threats before they execute.

---

## 🚀 Live Demo

Experience the live threat detection in action:

**👉 [Launch SHIELDX AI](http://localhost:8000) 👈**

> The system runs locally. If the link doesn't open automatically, open your browser and go to `http://localhost:8000`.

---

## 🔧 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Cyberpunk Design System
- **Animation**: Framer Motion
- **Data Visualization**: Chart.js + react-chartjs-2
- **PDF Generation**: jsPDF
- **Icons**: React Icons

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: Scikit-learn, spaCy
- **NLP**: TF-IDF, Word2Vec
- **Data Processing**: Pandas, NumPy

### AI Models
- **URL Classifier**: Optimized Gradient Boosting Model (Phishing vs. Benign)
- **Text Classifier**: Multi-layer model for Email/SMS threats
- **URL Classifier**: Multi-layer model for Website threats
- **QR Code Analyzer**: Pattern recognition for malicious QR codes
- **Real-time Engine**: spaCy for Named Entity Recognition (NER)

---

## 📋 Project Structure

```
/frontend            # React + Tailwind UI
  src/
    components/      # Reusable UI components
      Dashboard.tsx    # Main security dashboard
      UrlScanner.tsx   # URL analysis tool
      TextScanner.tsx  # Text/Email scanner
      QrScanner.tsx    # QR code analyzer
      ExtensionDemo.tsx # Browser extension simulation
      Docs.tsx         # Documentation
    types.ts           # TypeScript interfaces
    App.tsx            # Main application container
    main.tsx           # Entry point

/backend             # FastAPI Backend
  main.py            # API endpoints and AI logic
  models.py          # Trained AI models
  data/              # Training datasets
  utils.py           # Helper functions

/dataset             # Raw ML datasets
  train.csv          # Training data
  test.csv           # Test data
  urls.csv           # URL samples
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Pip (Python package manager)

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the FastAPI server:
```bash
python main.py
```

The backend will start on `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm start
```

The application will open automatically at `http://localhost:3000`.

---

## 🎯 Key Features

### 🛡️ Advanced AI Threat Detection
- **Multi-Model Protection**: Uses multiple AI models for comprehensive security
- **Real-Time Analysis**: Instant detection of phishing, malware, and scams
- **Threat Score**: Dynamic score from 0-100 based on risk factors
- **Pattern Recognition**: Identifies malicious URL structures and text patterns

### 📊 Real-Time Dashboard
- **Live Threat Feed**: See detected threats in real-time
- **Interactive Charts**: Visual representation of threat distribution
- **Security Metrics**: Track safe vs. dangerous elements
- **PDF Reports**: Generate professional security audit reports

### 🔌 Browser Extension Simulation
- **Real-Time Protection**: Blocks malicious URLs before loading
- **Context Menu Integration**: Quick access to security features
- **AI Overlay**: Visual indicators on suspicious elements
- **Auto-Blocking**: Prevents access to high-risk sites

### 🛠️ Multi-Functional Tools
- **URL Scanner**: Analyze website URLs for phishing
- **Text Scanner**: Detect malicious content in emails or text
- **QR Code Scanner**: Analyze QR codes for hidden threats
- **Model Optimizer**: Continuously improve AI accuracy

---

## 🧪 Testing the System

### Test URLs
Use these URLs to test the threat detection:

**Phishing/Malicious URLs (should be detected as dangerous):**
- `http://secure-login-paypal.com/login`
- `http://chase-banking-alert.net/verify`
- `http://netflix-verify-account.info/signin`
- `http://update-facebook-security.org/account/security`

**Safe URLs (should be detected as safe):**
- `https://www.google.com`
- `https://www.github.com`
- `https://www.wikipedia.org`
- `https://openai.com`

### Test Text Patterns
Use these text samples to test the text scanner:

**Dangerous Text:**
- "Urgent: Your account has been compromised. Click here to verify immediately."
- "Your bank account has been suspended. Login now to avoid closure."
- "You've won a $1000 Amazon gift card! Click to claim your prize."

**Safe Text:**
- "Meeting scheduled for tomorrow at 10 AM."
- "The project deadline is Friday, please submit your reports."
- "Thank you for your purchase, your order will ship soon."

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Create an issue with detailed steps to reproduce
2. **Suggest Features**: Open an issue with your idea
3. **Improve Models**: Add more training data to the `dataset/` folder
4. **Enhance UI**: Suggest improvements to the design or components
5. **Add Integrations**: Propose new security tool integrations

---

## 📚 Documentation

Learn more about how the system works:

- **[View AI Architecture](http://localhost:8000/docs)** - Technical documentation
- **[API Endpoints](http://localhost:8000/docs#/default)** - API documentation

---

## 📞 Support

For issues or questions, please:
1. Check the **Troubleshooting** section in the app
2. Review the **Documentation** for technical details
3. Open an issue with a detailed description

---

## 📝 License

This project is for educational and demonstration purposes only.

---

**Built with ❤️ for Cyber Security Awareness**
