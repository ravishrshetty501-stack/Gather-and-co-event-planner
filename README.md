# Gather & Co. — AI-Powered Celebration & Event Planner

> Built for **PromptWars Challenge 05: Celebration & Event Planner**  
> An intelligent, editorial event planning studio that crafts personalized, budget-conscious event plans for milestone birthdays, intimate dinners, weddings, anniversaries, and festive celebrations across India.

---

## 🌟 Demo & Deployment

- 🌐 **Public Live Deployment:** `[PLACEHOLDER: Add your deployment URL here, e.g. https://gather-and-co.vercel.app]`
- 🎥 **Product Demonstration Video (3 min):** `[PLACEHOLDER: Add public video link here, e.g. https://youtu.be/your-demo-id]`
- 📱 **Official Instagram Reel (38s):** `[PLACEHOLDER: Add Instagram / Reel link here]`

---

## 📖 1. Problem Statement & Overview

### The Challenge
Planning an event — whether an intimate milestone birthday, a garden dinner soirée, an anniversary, or a festival gathering — is typically overwhelming, fragmented, and prone to budget overruns. Hosts juggle fragmented spreadsheets, disjointed vendor lists, conflicting timelines, and generic advice that ignores local cultural customs and realistic costs.

### The Solution: Gather & Co.
**Gather & Co.** is a full-stack, AI-powered celebration companion. It translates high-level host vision into a cohesive, structured, 8-pillar event plan:
1. **Event Concept & Theme:** Visual mood, sensory palette, lighting schemes, and thematic highlights.
2. **Event Day Run of Show:** Chronological timeline from vendor arrival to guest departure.
3. **Budget Allocation Breakdown in INR (₹):** Itemized projections across catering, venue, decor, sound, photography, and contingency reserve.
4. **Curated Culinary Plan:** Multi-course welcome drinks, appetizers, mains, and desserts respecting dietary restrictions (pure vegetarian, Jain, allergies).
5. **Decorations & Styling:** Entrance styling, focal backdrops, dining arrangements, and interactive photo corners.
6. **Prioritized Preparation Checklist:** Milestone-based countdown from 4 weeks out to event day.
7. **Bespoke Stationery & Invitation:** Culturally attuned digital invitation ready for one-click WhatsApp copying.
8. **Risk Mitigation Protocols:** Practical backup plans for weather variances, vendor delays, and budget fluctuations.

---

## 🎯 2. Chosen Vertical
**PromptWars Challenge 05: Celebration & Event Planner**

---

## ✨ 3. Implemented Features

- **Guided Event Studio Form:** Structured multi-step intake capturing occasion, guest projections, budget sliders with per-guest hints, theme vision, dietary preferences, and accessibility requirements.
- **Contextual Gemini AI Planning:** Secure server-side orchestration with Google Gemini generating culturally attuned Indian celebration plans.
- **Resilient Zero-Downtime Fallback:** Built-in smart deterministic generator ensures the studio remains 100% functional even if API keys are missing or network limits occur.
- **Interactive Producer Workspace:** Sticky sub-navigation to seamlessly review, edit, and navigate all 8 plan pillars.
- **Granular Single-Section Regeneration:** Re-roll a specific pillar (e.g. adjust the menu or rework decorations) without discarding the rest of the plan.
- **One-Click WhatsApp Invitation Copy:** Formats and copies invitation text directly to clipboard with visual toast feedback.
- **Browser-Side Event Persistence:** Save, load, and delete plans using `localStorage` with zero external database dependencies.
- **Editorial Print & PDF Export:** Custom CSS `@media print` layout stripping navigation for clean physical dossiers or PDF generation.
- **Interactive Preset Demo Mode:** Instant one-click demo load to inspect a fully-formed celebration plan immediately.

---

## 🛠️ 4. Technology Stack

| Layer | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Modular, type-safe user interface with custom hooks |
| **Build Tool** | Vite 8 | Fast Hot Module Replacement (HMR) and optimized rollup bundle |
| **Styling** | Vanilla CSS (Custom Design System) | Warm Ivory (`#F8F6F1`), Deep Forest Green (`#163327`), Terracotta (`#C66B4E`), Georgia serif typography |
| **Icons** | Lucide React | Clean, lightweight SVG iconography |
| **Routing** | React Router DOM v7 | Client-side routing (`/`, `/create`, `/results`, `/my-events`) |
| **Backend** | Node.js + Express 5 | Secure proxy keeping credentials server-side |
| **AI Integration**| Google Generative AI SDK (`@google/generative-ai`) | Structured Gemini prompt engineering and section parsing |
| **Test Runner** | Node.js Test Runner (`node:test` + `node:assert`) | Native automated test runner with zero extra dependencies |

---

## 🏛️ 5. System Architecture & Request Flow

```
┌────────────────────────────────────────────────────────┐
│                   Browser Client                       │
│  React 19 + TypeScript + Custom Design Tokens          │
│  Port: 5173 (Dev)                                      │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/generate-plan
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Backend Proxy                        │
│  Node.js + Express 5 + Input Sanitization              │
│  Port: 3001                                            │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
  (Key Configured & Valid)     (Key Missing or Rate-Limited)
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│    Google Gemini API      │ │ Smart Fallback Engine    │
│  Structured Prompt with   │ │ Mathematically accurate  │
│  cultural Indian context  │ │ budget & contextual plan │
└─────────────┬─────────────┘ └───────────┬──────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
              ┌───────────────────────────┐
              │  Structured 8-Pillar Plan │
              │  Parsed & Sent to Client  │
              └───────────────────────────┘
```

---

## 🧠 6. Approach, Logic & Contextual Adaptation

The planner adapts every recommendation directly to the user's inputs:
1. **Guest Count & Budget Scaling:** The system calculates the per-guest allocation (`Budget / GuestCount`) and proportionally distributes expenditure across catering (42%), venue rental (22%), decor (16%), entertainment (8%), photography (7%), and contingency (5%).
2. **Cultural & Geographic Context:** Menus, floral suggestions (marigolds, tuberoses, brass urns), and timelines are customized for celebrations in metropolitan and regional Indian venues.
3. **Dietary Safeguards:** Vegetarian, Vegan, Jain, and allergy-sensitive options are automatically highlighted with clear allergen tags.
4. **Accessibility Integration:** Explicit inputs for step-free access, ground-floor seating, and special needs are factored into venue selection and run-of-show flow.

---

## 💻 7. Installation & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/celebration-and-event-planner.git
   cd celebration-and-event-planner
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
   *(This installs dependencies for both `server/` and `client/`)*

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure your API key (see section below).

---

## 🔑 8. Environment Variables & Gemini Configuration

All API keys are strictly loaded on the backend. **Never commit `.env` to Git.**

### `.env` File Specification
```env
# Google Gemini API Key (get from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Model Override (defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash

# Backend Server Port
PORT=3001
```

> **Note:** If `GEMINI_API_KEY` is not provided or remains as the placeholder string, the application automatically runs in **Smart Local Plan Mode**, generating mathematically accurate and fully contextual plans without error.

---

## 🚀 9. Running the Application Locally

Run the frontend and backend in separate terminal windows:

### Terminal 1: Backend Server (Port 3001)
```bash
npm run server
# Or for automatic hot-reloading:
npm run server:dev
```

### Terminal 2: Frontend Client (Port 5173)
```bash
npm run client
```

Open your browser at: **`http://localhost:5173`**

---

## 🧪 10. Automated Testing & Production Build

### Running the Automated Test Suite
The project includes automated tests for both frontend utilities and backend API endpoints using Node's native test runner (`node:test`):

```bash
# Run all tests (server + client)
npm test

# Run backend tests only
npm run test --prefix server

# Run client tests only
npm run test --prefix client
```

**Test Coverage Highlights:**
- ✅ Input validation (missing required fields, negative guests, minimum budget threshold).
- ✅ String-to-number coercion.
- ✅ Budget allocation percentages and per-guest arithmetic.
- ✅ Gemini prompt construction and Indian cultural rules.
- ✅ Plan section parser with marker fallback resilience.
- ✅ Single-section regeneration.
- ✅ Markdown XSS prevention and link protocol sanitization.

### Production Build
```bash
npm run build
```
*(Executes `tsc && vite build` in `client/` to generate optimized static assets in `client/dist/`)*

---

## ⚠️ 11. Assumptions & Limitations

- **Estimate Transparency:** All budget numbers and pricing figures are AI-generated market estimates based on prevailing metropolitan rates in India. They are clearly labelled as estimates for planning purposes, and users are encouraged to obtain direct vendor quotes.
- **Vendor Names:** To maintain ethical AI standards, the planner does not invent fictitious vendor businesses or guarantee vendor availability.
- **Client-Side Persistence:** Saved plans are stored in browser `localStorage`. Clearing browser cache will reset saved events unless exported via print/PDF.

---

## 🌐 12. Deployment Guide

### Recommended Stack: Vercel (Frontend) + Render / Railway (Backend)

1. **Deploy Backend (e.g. Render / Railway):**
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `node index.js`
   - Environment variables: Set `GEMINI_API_KEY` and `PORT`.

2. **Deploy Frontend (e.g. Vercel):**
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: Set `VITE_API_URL` to your deployed backend URL.

---

## 📊 13. Evaluation Criteria Mapping

| Evaluation Criterion | Implementation Details in Gather & Co. |
| :--- | :--- |
| **1. Code Quality** | Modular React components, TypeScript interfaces (`types.ts`), clean Express route controllers, zero ad-hoc CSS utility bloat, well-structured git history. |
| **2. Security** | Server-side Gemini API isolation, strict link protocol sanitization against XSS, input boundary checks, `.env` git exclusion, safe error messages that never leak keys or stack traces. |
| **3. Efficiency** | Zero-dependency test runner, lightweight state management, client production bundle (<325 KB gzipped), single-section regeneration to avoid redundant full-plan AI calls. |
| **4. Testing** | 19 automated unit & integration tests covering API endpoints, input validation, mathematical budget consistency, error recovery, and markdown security. |
| **5. Accessibility** | WCAG AAA contrast ratio (11.8:1), native `<label htmlFor>` connections, `aria-invalid`, `aria-describedby`, error `role="alert"` announcements, and full keyboard navigability. |
| **6. Problem Statement Alignment** | Fully contextual 8-pillar event plans specifically designed for Indian celebrations, budget-aware tracking, WhatsApp invitation generation, and risk contingencies. |

---

## 📄 License
This project is open-source under the [ISC License](LICENSE).
