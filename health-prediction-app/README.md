# MIRA Health — Patient Prediction Dashboard

> ⚠️ **Disclaimer**: This is a demo project built for a job assessment. It is **not a real medical tool** and is **not intended to provide medical advice**. All AI-generated predictions are for demonstration purposes only. Always consult a licensed healthcare professional for any health-related concerns.

---

## What This Is

**MIRA Health** is a full-stack health prediction web application that allows users to:

- Add, view, edit, and delete patient records (name, date of birth, email, lab values)
- Automatically generate AI-driven health remarks based on blood lab values (glucose, hemoglobin, cholesterol)
- View all records in real time via a live Firestore dashboard (no manual refresh needed)

The prediction engine combines:
1. **Rule-based interpretation** (local): standard clinical reference ranges flag elevated glucose, low hemoglobin, and high cholesterol
2. **Gemini API enrichment** (third-party): Google's Gemini AI generates a concise summary of the risks identified based on the specific lab values.

---

## Tech Stack & Rationale

| Technology | Role | Why |
|---|---|---|
| **Next.js 14 (App Router)** | Framework | Server components, API routes in one repo, Vercel-native |
| **Tailwind CSS** | Styling | Utility-first, rapid prototyping, responsive by default |
| **Firebase Firestore** | Database | Real-time `onSnapshot`, no-SQL flexibility, generous free tier |
| **Gemini API** | Health enrichment | Powerful language model to summarize clinical findings |
| **Vercel** | Deployment | Zero-config Next.js deployment, env var management built-in |

---

## Project Structure

```
health-prediction-app/
├── app/
│   ├── layout.js                  # Root layout, navbar, disclaimer banner
│   ├── page.js                    # Dashboard (real-time patient list)
│   ├── globals.css                # Global styles
│   ├── api/
│   │   └── predict/
│   │       └── route.js           # Server-side prediction API (Gemini API)
│   └── patient/
│       ├── new/page.js            # Add patient form
│       └── [id]/edit/page.js      # Edit patient form
├── components/
│   ├── PatientForm.js             # Shared form (create + edit)
│   ├── PatientCard.js             # Mobile card view
│   ├── PatientTable.js            # Desktop table view
│   └── ConfirmModal.js            # Delete confirmation dialog
├── lib/
│   └── firebase.js                # Firebase client init (env vars only)
├── firestore.rules                # Firestore security rules (for review)
├── .env.local.example             # Required env vars template
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd health-prediction-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
# Firebase — from Firebase Console → Project Settings → Web App → Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API — get one at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key
```

#### Getting Firebase credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use an existing one)
3. Enable **Firestore Database** (start in test mode or apply the rules from `firestore.rules`)
4. Go to **Project Settings → Your Apps → Web App** → copy the config object

#### Getting Gemini credentials
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Copy your key into `.env.local`

> **Note**: The app runs without a Gemini key — predictions will fall back to a generic fallback message.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket)
2. Go to [vercel.com](https://vercel.com/) → **New Project** → import your repo
3. In **Project Settings → Environment Variables**, add all the variables from `.env.local.example` with their real values
4. Click **Deploy**

No code changes are needed — Vercel detects Next.js automatically.

---

## How the Prediction Works

The `/api/predict` endpoint is **server-side only** (API credentials never reach the browser):

1. **AI PREDICTION LAYER (Google Gemini)**: We pass the lab values to the Gemini API with a strict system prompt to analyze the values based on standard clinical reference ranges. The model generates a 2-3 sentence summary of any potential risks.

2. **DISCLAIMER**: The output is always prefixed with a demo disclaimer to ensure it is not mistaken for real medical advice.

3. **Fallback**: If Gemini is unavailable or times out (10s), generic fallback remarks are used alone.

---

## Security Notes

- **No API keys in code**: All credentials are read from environment variables
- **Firebase config** (`NEXT_PUBLIC_*`) is intentionally client-exposed per Firebase's design — Firestore security rules control actual data access
- **Gemini credentials** are server-side only (`GEMINI_API_KEY`) — never in client bundles
- **`.env.local` is gitignored** — only `.env.local.example` (with empty values) is committed

---

## ⚠️ Disclaimer

This application is a **portfolio/assessment project**. It is **not a certified medical device**, **not validated for clinical use**, and **must not be used to make real health decisions**. All predictions are AI-generated demonstrations based on simplified rule sets and third-party condition metadata.

**Always consult a licensed healthcare professional for medical advice.**
