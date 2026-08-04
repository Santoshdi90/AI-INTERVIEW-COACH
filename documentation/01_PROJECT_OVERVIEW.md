# 01. Project Overview

## Executive Summary
**AI Interview Coach** is an enterprise-grade, full-stack AI platform engineered to assist job seekers in preparing for technical, behavioral, and system design interviews. The system extracts structured text from PDF resumes, calculates Applicant Tracking System (ATS) scores, generates dynamic AI interview sessions, evaluates spoken/typed candidate answers using OpenAI GPT-4, and visualizes longitudinal candidate progress via interactive dashboards.

---

## 🎯 Business Problem & Purpose

### The Problem
- **High Anxiety & Lack of Practice**: Job candidates frequently struggle with interview performance due to inadequate practice and non-actionable feedback.
- **ATS Disconnect**: Many applicants fail initial automated screening filters because their resumes lack target keywords or optimal formatting.
- **Inaccessible Coaching**: Professional human interview coaching is prohibitively expensive ($100–$300/hour) and difficult to schedule on demand.

### The Solution
AI Interview Coach provides an on-demand, scalable, and affordable platform that:
1. Simulates realistic, category-specific interview sessions with audio readout and speech recognition.
2. Delivers instant, multi-dimensional feedback (STAR method, technical accuracy, grammar, confidence, ideal answers).
3. Analyzes resumes against ATS algorithms and identifies missing skills.
4. Tracks skill growth and metric progress over time.

---

## 🌟 Key Features

### 1. Authentication & Security
- Production JWT flow (Short-lived Access Tokens + HTTP-only Refresh Token Cookies).
- Password hashing using `bcryptjs` (12 salt rounds).
- Configurable Email Verification gate (`REQUIRE_EMAIL_VERIFICATION`).
- One-click Google OAuth 2.0 Integration.
- Role-Based Access Control (`USER` & `ADMIN`).

### 2. AI Resume Analyzer
- Multer PDF upload engine with type/size validation.
- PDF text extraction via `pdf-parse`.
- ATS Score calculation (0–100%).
- Keyword density analysis, formatting score, and readability metrics.
- Auto-extraction of technical skills into candidate profile.

### 3. Interactive AI Mock Interviews
- 16 Category Modules: HR, Technical, System Design, React, Node.js, Frontend, Backend, Java, JavaScript, Database, OS, Computer Networks, DBMS, OOP, Behavioral, Custom Topic.
- Difficulty Levels: Easy, Medium, Hard.
- Real-time Speech Recognition (Web Speech API) & Speech Synthesis (Voice Readout).
- Question hints and expected time tracking.

### 4. Diagnostic Feedback Engine
- Multi-dimensional scoring: Technical Accuracy, Communication, STAR Method Alignment, Confidence, Grammar.
- Keyword gap analysis (Keywords Detected vs. Keywords Missing).
- Ideal Model Answer generation for comparison.
- Concrete, actionable improvement recommendations.

### 5. Analytics Dashboard
- Interactive time-series progress charts (Recharts).
- Skill radar proficiency visualization.
- Interview status distribution & success rate computation.

### 6. Admin Control Center
- System-wide metrics (total candidates, sessions completed).
- Paginated user management table with search filters.
- User soft-deletion & governance.

---

## 👥 Target Users

1. **Software Engineers & Developers**: Practicing technical coding, system design, and framework-specific questions (React, Node, Java).
2. **Recent Graduates & Students**: Building confidence in behavioral (STAR method) and general HR questions.
3. **Career Changers & Job Seekers**: Optimizing resumes for ATS filters and practicing domain-specific topics.
4. **Platform Administrators**: Monitoring system usage, candidate activity, and managing user accounts.

---

## 🏗️ Tech Stack

```
Frontend:  React 18 + Vite + TypeScript + Tailwind CSS v4 + TanStack Query + Zustand
Backend:   Node.js + Express + TypeScript (Clean Controller-Service-Repository)
Database:  PostgreSQL (Neon Cloud Cluster) + Prisma ORM v5.22.0
AI Engine: OpenAI API (GPT-4) + Mock Service Fallback
Auth:      JWT + bcryptjs + Cookie-Parser + Google Auth Library
Deploy:    Vercel (Frontend SPA) + Render (Backend Docker Container)
```

---

## 📁 Repository Folder Structure

```
AI-INTERVIEW-COACH/
├── .gitignore
├── README.md
├── docker-compose.yml
├── docs/
│   ├── API_DOCS.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── documentation/                # Complete Technical Documentation
│   ├── 01_PROJECT_OVERVIEW.md
│   ├── 02_SYSTEM_ARCHITECTURE.md
│   ├── ...
├── backend/                      # Node.js + Express + Prisma API Server
│   ├── Dockerfile
│   ├── jest.config.ts
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── uploads/                  # Temporary local storage
│   └── src/
│       ├── index.ts              # Entry point & Express server setup
│       ├── config/               # Database, Env schema (Zod), Logger (Winston)
│       ├── controllers/          # HTTP request handlers
│       ├── middleware/           # Auth, Error, Rate Limiting, Validation
│       ├── repositories/         # Prisma database access layer
│       ├── routes/               # Express API routes
│       ├── services/             # Core business logic (AI, Storage, Auth, Email)
│       ├── types/                # TypeScript interface definitions
│       └── utils/                # Helper functions, JWT, upload configurations
└── frontend/                     # React + Vite Client Application
    ├── Dockerfile
    ├── package.json
    ├── vercel.json               # SPA route rewrite for Vercel
    ├── vite.config.ts
    └── src/
        ├── App.tsx               # Main component & router
        ├── components/           # UI components (Layout, ProtectedRoute, Navbar)
        ├── hooks/                # Custom React hooks (useSpeechRecognition)
        ├── lib/                  # Axios HTTP client with interceptors
        ├── pages/                # Page components (Dashboard, Resume, Interview, Admin)
        ├── services/             # Frontend API integration services
        └── store/                # Zustand global state (Auth state)
```

---

## 🔄 High-Level Candidate Workflow

```
[Candidate] ──> Sign Up / Log In ──> Upload Resume (PDF)
                                        │
                                        ▼
                                AI Resume Analysis ──> Skills Extracted to Profile
                                        │
                                        ▼
                                Start Mock Interview (Category & Difficulty)
                                        │
                                        ▼
                                AI Questions Generated ──> Audio Readout & Timer
                                        │
                                        ▼
                                Candidate Answers (Speech-to-Text / Typed)
                                        │
                                        ▼
                                Real-Time AI Feedback & Scoring (STAR Method, Technical)
                                        │
                                        ▼
                                Dashboard Analytics Updated (Progress Trends & Skill Radar)
```
