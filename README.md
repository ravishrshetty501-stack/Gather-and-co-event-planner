# 🎉 Celebration & Event Planner

> An AI-powered event planning studio that crafts personalized, budget-conscious event plans for birthdays, weddings, college fests, anniversaries, and other celebrations.

---

## 🌟 Demo & Deployment Links

- 🌐 **Public Deployment URL:** `[PLACEHOLDER: Add your deployment URL here, e.g. https://your-event-planner.vercel.app]`
- 🎥 **Demo Video:** `[PLACEHOLDER: Add your YouTube / Loom demo video link here]`

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack & Architecture](#technology-stack--architecture)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Configuring the Gemini API Key](#configuring-the-gemini-api-key)
7. [Running Locally](#running-locally)
8. [Building & Testing](#building--testing)
9. [Deployment Guide](#deployment-guide)
10. [Current Limitations & Roadmap](#current-limitations--roadmap)
11. [Project Structure](#project-structure)

---

## 📖 Project Overview

Planning any event — whether an intimate birthday party, a large wedding reception, or a college festival — is often stressful, chaotic, and hard to budget accurately.

**Celebration & Event Planner** solves this by leveraging **Google Gemini** through a secure Node.js backend. Users simply provide their event details (type, guest count, budget in ₹, city, theme, dietary requirements, and special notes), and receive a comprehensive 8-pillar event plan:

1. **Event Concept & Theme:** Visual mood, color palette, aesthetic direction, and thematic integration.
2. **Event Day Schedule:** Chronological timeline with specific time slots from setup to wrap-up.
3. **Detailed Budget Breakdown in INR (₹):** Itemized estimates across venue, catering, decor, sound/DJ, photography, stationery, and contingency buffer (~10–15%).
4. **Food & Menu Plan:** Welcome drinks, multi-course vegetarian and non-vegetarian menus, allergy-safe callouts, and desserts.
5. **Decorations & Setup:** Entrance styling, focal stage design, table arrangements, lighting scheme, and photo booth concepts.
6. **Prioritized Preparation Checklist:** Structured timeline with deadlines (6–8 weeks out, 4–6 weeks, 2 weeks, final week, event day).
7. **Invitation Message:** Culturally attuned, ready-to-copy WhatsApp/digital invitation text with emoji styling.
8. **Risks & Backup Plans:** Contingency protocols for weather, vendor no-shows, budget overruns, and unexpected guest count fluctuations.

---

## ✨ Key Features

- **Built-in Interactive Demo Mode:** Explore the entire dashboard and all 8 plan sections immediately without needing an API key upfront.
- **Form Input Validation:** Interactive form handling required fields (type, name, guests, budget) and constraint checking with helpful per-guest cost hints.
- **Budget Intelligence:** Automatic per-guest budget calculation in Indian Rupees (₹) with warning banners when wishlists exceed budgets.
- **Single-Section AI Regeneration:** Re-roll only the sections you want to change (e.g. refresh the menu or rework the decor) without discarding the rest of the plan.
- **One-Click Invitation Copy:** Instantly formats and copies WhatsApp-ready invitation text to the clipboard.
- **Local Storage Management:** Save, view, and delete plans locally in the browser with zero external database dependencies.
- **Print & PDF Export:** Clean CSS `@media print` stylesheets optimized for physical handouts or PDF saving.
- **Responsive Studio Aesthetic:** Custom design system built with a warm cream canvas (`#FDF8F0`), deep royal purple accents (`#6B3FC7`), and warm coral highlights (`#F06B35`).
- **Security & Privacy First:** Zero client-side API key leakage; all Gemini API communications happen on the server.

---

## 🛠️ Technology Stack & Architecture

### Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                      Client                            │
│  React 19 + TypeScript + Vite + Lucide Icons           │
│  Port: 5173 (Dev)                                      │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/...
                           ▼
┌────────────────────────────────────────────────────────┐
│                      Backend                           │
│  Node.js + Express + dotenv + cors                     │
│  Port: 3001                                            │
└──────────────────────────┬─────────────────────────────┘
                           │ Secure API Calls (Server-side)
                           ▼
┌────────────────────────────────────────────────────────┐
│                Google Gemini API                       │
│  Model: gemini-3.8-flash via @google/generative-ai     │
└────────────────────────────────────────────────────────┘
```

### Technologies Used

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | Type safety, component modularity, modern React hooks |
| **Build Tool** | Vite 8 | Instant HMR, lightning-fast production bundling |
| **Icons** | Lucide React | Clean, modern feather-style iconography |
| **Styling** | Custom Vanilla CSS | Tailored luxury design tokens without utility framework bloat |
| **Routing** | React Router DOM v7 | Client-side page navigation |
| **Persistence** | Browser `localStorage` | Fast, reliable, zero-cost state persistence |
| **Backend** | Node.js + Express 5 | Lightweight, secure proxy keeping API keys confidential |
| **AI Engine** | Google Gemini 3.8 Flash | Fast inference, structured output parsing, cultural context |

---

## 📦 Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Installation & Setup

1. **Clone or open the repository:**
   ```bash
   cd event
   ```

2. **Install all dependencies:**
   ```bash
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   
   # Return to project root
   cd ..
   ```

   *Alternatively, using the root convenience script:*
   ```bash
   npm run install:all
   ```

---

## 🔑 Configuring the Gemini API Key

1. Create a `.env` file in the **root** folder by copying the example:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
   PORT=3001
   ```

> ⚠️ **Security Notice:** Never commit `.env` or hardcode your Gemini API key in client-side code. The `.gitignore` file is pre-configured to keep your credentials safe.

---

## 💻 Running Locally

### Option 1: Two Terminals (Recommended for development)

**Terminal 1 — Backend Server:**
```bash
cd server
npm start
# Server runs at http://localhost:3001
# Health check: http://localhost:3001/api/health
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
# Vite runs at http://localhost:5173
```

### Option 2: From Project Root
```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Building & Testing

### Test Client Production Build
```bash
cd client
npm run build
```
This runs the TypeScript compiler (`tsc`) and Vite bundler to verify types and assets.

### Test Backend Health Check
With the server running:
```bash
# In PowerShell:
Invoke-RestMethod -Uri "http://localhost:3001/api/health"

# Or in bash:
curl http://localhost:3001/api/health
```
Expected output:
```json
{
  "status": "ok",
  "geminiConfigured": true
}
```

---

## 🌐 Deployment Guide

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set the root directory to `client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`.

### Backend (Render / Railway / Fly.io)
1. Set the root directory to `server`.
2. Build command: `npm install`.
3. Start command: `node index.js`.
4. Set environment variable: `GEMINI_API_KEY=your_gemini_api_key`.

---

## ⚠️ Current Limitations & Roadmap

### Current Limitations
- **Cost Estimates are Indicative:** All budget numbers are market-rate approximations. Real venue rates, catering minimums, and peak season surcharges require direct vendor quotes.
- **Client-Side Persistence:** Plans are saved in the browser's `localStorage` and will not sync across different devices or incognito sessions.
- **Text & Concept Generation:** Does not yet book vendors, process online payments, or integrate live maps data.

### Planned Enhancements
- [ ] Export plans to PDF with branded headers
- [ ] Multi-currency support (USD, EUR, GBP, AED)
- [ ] Collaborative plan sharing via shareable links
- [ ] RSVP tracking portal for guests
- [ ] Vendor shortlist discovery

---

## 📁 Project Structure

```
event/
├── .env.example              # Sample environment template
├── .gitignore                # Excludes node_modules, .env, build output
├── package.json              # Root scripts
├── README.md                 # Project documentation
│
├── client/                   # Frontend React + TypeScript application
│   ├── index.html            # Entry HTML with meta & SEO tags
│   ├── package.json          # Frontend dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── vite.config.ts        # Vite configuration & dev proxy
│   └── src/
│       ├── App.tsx           # Main application router & state
│       ├── main.tsx          # React mounting entrypoint
│       ├── index.css         # Design system & responsive styles
│       ├── types.ts          # Core TypeScript interfaces & constants
│       ├── api.ts            # API service layer (health, generate, regen)
│       ├── demoData.ts       # Sample event plan
│       ├── storage.ts        # localStorage helper functions
│       ├── markdown.ts       # Lightweight markdown-to-HTML parser
│       ├── components/
│       │   ├── Header.tsx    # Sticky navigation bar
│       │   ├── Footer.tsx    # App footer
│       │   └── ToastContainer.tsx # Dismissible toast notifications
│       └── pages/
│           ├── HomePage.tsx        # Hero landing & feature highlights
│           ├── CreateEventPage.tsx # Event input form with validation
│           ├── LoadingPage.tsx     # Animated generation progress screen
│           ├── ResultsPage.tsx     # 8-pillar event plan dashboard
│           └── SavedPlansPage.tsx  # Stored event plans library
│
└── server/                   # Backend Node.js + Express API
    ├── package.json          # Backend dependencies
    └── index.js              # Express app with Google Gemini integration
```

---

## 📄 License

ISC License.
