# Carbon Footprint Awareness & Personal Sustainability Platform (EcoSense)

EcoSense is a full-stack monorepo web application designed to help users calculate, track, and reduce their personal carbon footprint. The platform features an interactive onboarding wizard, a dynamic carbon calculator, gamified eco-points rewards, AI-powered sustainability recommendations, and interactive visualizations.

---

## 📋 Table of Contents
1. [Core Vertical](#1-core-vertical)
2. [Approach & Carbon Logic](#2-approach--carbon-logic)
3. [How the Solution Works](#3-how-the-solution-works)
4. [Assumptions Made](#4-assumptions-made)
5. [Tech Stack](#5-tech-stack)
6. [Project Structure](#6-project-structure)
7. [Getting Started](#7-getting-started)
8. [Database Schema](#8-database-schema)

---

## 1. Core Vertical
EcoSense operates in the **Personal Sustainability and Climate Action** vertical. It targets carbon footprint awareness at the individual level, specifically contextualized and calibrated for the **Indian subcontinent context** (though globally applicable) where per-capita emissions averages (~1.9 tons CO2/year) differ substantially from Western baselines (~16 tons CO2/year).

---

## 2. Approach & Carbon Logic
EcoSense translates daily consumption parameters into metric greenhouse gas equivalents (kg CO2). The calculation engine uses two distinct logic layers:

### A. Static Conversion Rules
For quick manual logging, the application uses standardized carbon intensity coefficients per unit of consumption:
- **Transportation**: Car (`0.25 kg CO2/km`), Bus (`0.10 kg CO2/km`), Train (`0.05 kg CO2/km`), Flight (`0.15 kg CO2/km`).
- **Household Energy**: Grid Electricity (`0.41 kg CO2/kWh`), LPG / Natural Cooking Gas (`2.0 kg CO2/kg`).
- **Diet**: Vegan diet (`0.25 kg CO2/unit`), Vegetarian (`0.5 kg CO2/unit`), Meat-based/Non-Veg (`2.0 kg CO2/unit`).
- **Waste**: Recyclable waste (`0.6 kg CO2/unit`), Landfill/Non-recycled waste (`3.0 kg CO2/unit`).

### B. Dynamic AI Auditing
During the initial user audit, raw questionnaire parameters are forwarded to **Google Gemini (gemini-3.1-flash-lite)**. The prompt enforces calculations aligned with Indian grid baselines (e.g., carbon-intensive grid factor of `~0.71 kg CO2/kWh` for India) and household scaling models.

---

## 3. How the Solution Works
1. **Onboarding & Initial Audit**: New users complete a multi-step Calculator Wizard specifying household metrics, diet preferences, public/private vehicle usage, fuel types, electricity bills, and flights.
2. **AI Analysis & Dynamic Breakdown**: The backend queries the Google Generative AI model to analyze the raw inputs. The AI calculates an annualized carbon baseline, segments it into four categories (Transport, Energy, Food, Waste), and generates 3-4 personalized reduction suggestions.
3. **Interactive Dashboard**: Carbon footprints are visualized using **Recharts** (pie and area charts). An interactive 3D WebGL globe (**React-Globe.gl**) highlights global environmental benchmarks.
4. **Gamification & Daily Tracking**: Users earn eco-points by logging sustainable daily activities, which can be spent on virtual carbon-offset campaigns.
5. **Insights Retention**: Calculations are cached in a **PostgreSQL** database to track progress trends over time.

---

## 4. Assumptions Made
To present digestible, actionable feedback to users, the application relies on the following assumptions:
- **Linear Household Apportionment**: Shared household resources (such as cooking gas cylinders and grid electricity) are divided equally among all members (e.g., total household energy divided by `Household Size`).
- **Annualized Extrapolation**: Short-term metrics collected in the onboarding wizard are assumed to represent consistent, annualized baseline consumption rates.
- **Waste Emission Estimation**: If a user is unable to estimate their exact waste output, a fallback estimate of `100 - 200 kg CO2/year` is generated based on their household size.
- **Target Metrics**: Standard target baselines assume an Indian per-capita target of `1,900 kg CO2/year` and a global average baseline of `4,700 kg CO2/year`.

---

## 5. Tech Stack

### Frontend
- **React 19**
- **Vite** (Build tool)
- **Recharts** (Visualizations)
- **React-Globe.gl** (WebGL 3D Interactive Globe)
- **Lucide React** (Icon rendering)
- **Canvas-Confetti** (Reward triggers)

### Backend
- **Node.js & Express**
- **PostgreSQL** (Database store via `pg`)
- **Google Generative AI (Gemini)** (Dynamic calculations and recommendations)
- **JWT & Bcryptjs** (Authentication security)
- **Helmet & Express Rate Limit** (Production security)

---

## 6. Project Structure
```text
/
├── frontend/               # React application (Vite-based)
│   ├── src/
│   │   ├── components/     # UI Components (Dashboard, Wizard, Globe)
│   │   ├── context/        # Auth & Toast State Providers
│   │   └── App.jsx         # App routing and layout root
│   └── index.html
└── backend/                # Express API Server
    ├── server.js           # Server routing & setup
    ├── db.js               # Postgres pool initializer
    ├── gemini.js           # Gemini API interface & intelligent fallback
    ├── db_init.sql         # DB schema & tables definition
    └── utils/
        └── emissions.js    # Carbon calculation rules
```

---

## 7. Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Google Gemini API Key (Optional; fallback mocks will trigger if omitted)

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<dbname>
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 8. Database Schema
EcoSense utilizes three core relational tables:
- **`users`**: Manages profiles, credentials (hashed), and reward eco-points (`total_points`, `used_points`, `pending_points`).
- **`carbon_logs`**: Logs individual activities (transport, waste, energy, food) with their associated CO2 values.
- **`ai_insights`**: Caches generated Gemini recommendation reports (15-minute validity window) to optimize API usage.
