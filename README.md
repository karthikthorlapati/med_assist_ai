# MedAssist AI

AI-powered triage assistant for people who need to quickly decide: self-care, visit a facility, or call emergency services — with first-aid guidance and a nearby-hospital locator built into one flow.

**Idea2Impact Online Hackathon 2026 — Theme 3 (Crisis Management, HealthTech & Emergency Response)**

## Stack
- **M**ongoDB — stores triage session history
- **E**xpress — API server (triage logic, hospital locator)
- **R**eact — frontend (symptom input, voice input, results UI)
- **N**ode.js — runtime

## How it works
1. User describes symptoms (text or voice) in the React app.
2. Frontend calls `/api/triage` on the Express backend.
3. Backend calls Groq's API (free tier, no billing required) with a carefully designed prompt to classify urgency (`self-care` / `visit-facility` / `emergency`) and generate a first-aid response.
4. If tier is `visit-facility` or `emergency`, frontend calls `/api/hospitals` with the user's geolocation to find nearby facilities (via OpenStreetMap Overpass API — free, no key needed).
5. Every session is logged to MongoDB (symptom text, tier, timestamp) — useful for your demo video and shows real DB usage.

## Project structure
```
medassist-ai/
├── backend/          Express API + MongoDB models
└── frontend/          React app (Vite)
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI and GROQ_API_KEY in .env
npm run dev
```

**Getting a free Groq API key (no credit card needed):**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign in / create an account
3. Go to "API Keys" → "Create API Key"
4. Paste it into `GROQ_API_KEY` in your `.env`

Groq's free tier is generous and fast — more than enough for building, testing, and demoing.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`. The frontend is pre-configured to call the backend at `http://localhost:5000` in dev — update `frontend/src/utils/api.js` with your deployed backend URL before deploying.

## Deployment (for submission)
- **Backend:** Render or Railway (Node service). Add `MONGODB_URI` and `GROQ_API_KEY` as environment variables there.
- **Database:** MongoDB Atlas free tier — create a cluster, get the connection string, put it in `MONGODB_URI`.
- **Frontend:** Vercel — set `VITE_API_URL` to your deployed backend URL.

## What to highlight in your demo video
- The AI triage decision happening live (show all 3 tiers if you can — try a mild symptom, a moderate one, an emergency one).
- The first-aid guidance being *generated*, not hardcoded.
- The hospital locator pulling real nearby data based on location.
- (Bonus) Voice input working end-to-end.

## Important: this is a hackathon prototype, not a medical device
The AI gives guidance, not diagnosis. Say this explicitly in your problem statement / demo — judges will respect the honesty, and it's the responsible thing to do for a health tool.
