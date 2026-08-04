# 🚀 AI Interview Coach — Production SaaS Application

An enterprise-grade, full-stack AI-powered interview preparation platform designed to help job seekers practice technical & behavioral interviews, analyze PDF resumes, receive real-time speech evaluation feedback, and track skill improvement over time.

---

## 🌟 Key Features

### 🔐 Authentication & User Management
- Full JWT authentication flow (Access Tokens + HTTP-only Refresh Token Cookies)
- Registration, Login, Email Verification, Password Reset
- One-click Google OAuth 2.0 Integration
- Role-Based Access Control (User & Admin permissions)

### 📄 AI Resume Analyzer
- PDF Resume upload & text extraction engine
- AI ATS Score calculation (0-100%)
- Automated Skill Extraction & Keyword density analysis
- Recommended missing skills & optimization suggestions

### 🎤 Interactive AI Interview Session
- 15+ Interview Categories (HR, Technical, System Design, React, Node, Frontend, Backend, Java, DB, OS, Networks, DBMS, OOP, Custom)
- Real-time Speech-to-Text via Web Speech API
- Question timer tracking & answer hints
- AI Voice readout capabilities (SpeechSynthesis API)

### 📊 AI Evaluation & Detailed Feedback
- Comprehensive score breakdown (Technical Accuracy, Communication, STAR Method, Confidence, Grammar)
- Model/Ideal answer comparisons
- Missing vs detected industry keyword analysis
- Actionable improvement suggestions per response

### 📈 Analytics Dashboard
- Interactive Recharts visualization (Weekly & Monthly score trends)
- Radar proficiency charts for extracted skills
- Session category distribution bar graphs
- Overall candidate success rate calculations

### 🛡️ Admin Command Center
- User management table with search filtering
- System-wide session stats and metrics
- Account deletion & governance

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Dark Glassmorphism UI)
- **State Management**: Zustand (Auth State + Persistence)
- **Data Fetching**: TanStack Query (React Query) + Axios
- **Form Handling**: React Hook Form + Zod Validation
- **Charts & Animations**: Recharts + Framer Motion
- **Icons & Toast**: Lucide React + React Hot Toast

### Backend
- **Runtime**: Node.js + Express + TypeScript (Clean Architecture)
- **Database & ORM**: PostgreSQL + Prisma ORM (native enums, JSONB, indexed)
- **Authentication**: JWT + bcryptjs (12 rounds) + Google OAuth2
- **AI Integration**: OpenAI GPT-4 (with mock fallback)
- **File Storage**: Pluggable providers (Local / Cloudinary / AWS S3)
- **Email**: Nodemailer SMTP (with mock fallback)
- **Security**: Helmet, CORS, Rate Limiting, Input Sanitization
- **Logging**: Winston + Morgan
- **Testing**: Jest + Supertest

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (v14+ recommended)
- Docker & Docker Compose (Optional for containerized run)

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/ai-interview-coach.git
   cd ai-interview-coach
   ```

2. **Start PostgreSQL** (if not using Docker)
   ```bash
   # Option A: Use Docker for PostgreSQL only
   docker-compose up postgres -d

   # Option B: Local PostgreSQL
   createdb ai_interview_coach
   ```

3. **Backend Environment Setup**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev    # Apply schema to PostgreSQL
   npx prisma db seed         # Seed demo users & data
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**
   - **Backend**: `cd backend && npm run dev` (Runs on http://localhost:5001)
   - **Frontend**: `cd frontend && npm run dev` (Runs on http://localhost:3000)

### Demo Credentials
- **User Account**: `demo@aiinterviewcoach.com` / `Demo@1234`
- **Admin Account**: `admin@aiinterviewcoach.com` / `Admin@1234`

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `5001` | Server port |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend origin for CORS |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | — | JWT access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | — | JWT refresh token secret (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `USE_MOCK_AI` | `true` | Use mock AI or OpenAI |
| `OPENAI_API_KEY` | — | OpenAI API key (when mock is false) |
| `OPENAI_MODEL` | `gpt-4-turbo-preview` | OpenAI model to use |
| `USE_MOCK_EMAIL` | `true` | Use mock email or SMTP |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_USER` | — | SMTP username |
| `SMTP_PASS` | — | SMTP password / app password |
| `EMAIL_FROM` | `AI Interview Coach <noreply@...>` | From address |
| `USE_MOCK_OAUTH` | `true` | Use mock or real Google OAuth |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
| `STORAGE_PROVIDER` | `local` | Storage backend: `local`, `cloudinary`, `s3` |
| `CLOUDINARY_CLOUD_NAME` | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | — | Cloudinary API secret |

---

## 🐳 Docker Deployment

To spin up the entire production stack (PostgreSQL + Backend + Nginx Frontend) with one command:

```bash
docker-compose up --build -d
```

The application will be accessible at:
- Frontend: `http://localhost`
- API Backend: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

---

## 🧪 Testing

```bash
cd backend
npm test                    # Run all tests
npm run test:coverage       # Run with coverage report
```

---

## 📚 Documentation Links
- [Architecture & Design Docs](docs/ARCHITECTURE.md)
- [API Documentation](docs/API_DOCS.md)
- [Production Deployment Guide](docs/DEPLOYMENT.md)
