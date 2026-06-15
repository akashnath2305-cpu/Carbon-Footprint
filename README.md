# Carbon Footprint Awareness Platform

A full-stack web application designed to help users calculate, track, and reduce their carbon footprint. The platform features an interactive dashboard, gamification through eco-points, AI-powered insights, and a dynamic footprint calculator.

## Project Structure

The project is structured as a monorepo containing both the frontend and backend applications:

- `/frontend`: React application built with Vite.
- `/backend`: Node.js Express server with PostgreSQL database integration.

## Tech Stack

### Frontend
- **React 19**
- **Vite** (Build tool)
- **Recharts** (Data visualization)
- **React-Globe.gl** (Interactive 3D globe)
- **Lucide React** (Icons)
- **Canvas-Confetti** (Gamification rewards)

### Backend
- **Node.js & Express**
- **PostgreSQL** (`pg` library for database interaction)
- **Google Generative AI (Gemini)** (For AI-powered eco-insights)
- **JWT & Bcryptjs** (Authentication & Security)
- **Helmet & Express Rate Limit** (API Security)

## Features

- **User Authentication**: Secure signup and login with JWT and hashed passwords.
- **Dynamic Footprint Calculator**: AI-powered calculation of carbon footprint based on user inputs.
- **Interactive Dashboard**: Visual breakdown of emissions using Recharts.
- **Eco-Rewards System**: Earn points by logging sustainable activities and joining campaigns.
- **AI Insights**: Get personalized recommendations powered by Google Gemini to reduce your carbon footprint.
- **History Tracking**: Maintain a log of all carbon footprint calculations and activities.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables. Create a `.env` file in the `backend` directory (a sample is typically provided or you can structure it based on required keys like `JWT_SECRET`, database credentials, and `GEMINI_API_KEY`).
4. Initialize the database schema:
   ```bash
   # Run the provided database initialization scripts if available, e.g. using db_init.sql
   ```
5. Start the backend development server:
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

## License
Refer to the `LICENSE` file for more details.
