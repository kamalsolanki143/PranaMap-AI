# PranaMap AI — Deployment Guide

Instructions for deploying PranaMap AI on Google Cloud Platform and running locally.

---

## 1. Local Development Setup

### Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- Git

### Quick Start
```bash
# 1. Clone & checkout redesign branch
git clone https://github.com/kamalsolanki143/PranaMap-AI.git
cd PranaMap-AI
git checkout feature/pranamap-platform-redesign

# 2. Configure Environment Variables
cp .env.example .env
# Edit .env to add your GEMINI_API_KEY (optional, fallback active if unset)

# 3. Start Backend Service
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Start Frontend Client (in a separate terminal)
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## 2. Google Cloud Deployment

### 2.1 Backend Deployment to Google Cloud Run
Cloud Run provides a scalable, containerized serverless environment for the FastAPI backend:

```bash
# Build & submit container image to Google Artifact Registry
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/pranamap-backend:latest ./backend

# Deploy to Cloud Run
gcloud run deploy pranamap-backend \
    --image gcr.io/$GOOGLE_CLOUD_PROJECT/pranamap-backend:latest \
    --platform managed \
    --region asia-south1 \
    --allow-unauthenticated \
    --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY,GEMINI_MODEL=gemini-2.5-flash,FIREBASE_PROJECT_ID=$GOOGLE_CLOUD_PROJECT
```

### 2.2 Frontend Deployment to Firebase Hosting or Vercel
```bash
cd frontend
npm run build
# Deploy static bundle to Firebase Hosting
firebase deploy --only hosting
```

---

## 3. Production Verification
After deployment, verify system health via:
```bash
curl https://<your-backend-url>/api/v1/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "PranaMap AI Backend",
  "version": "1.0.0",
  "gemini": "connected",
  "firestore": "connected"
}
```
