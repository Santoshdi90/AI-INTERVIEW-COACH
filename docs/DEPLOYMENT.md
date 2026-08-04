# 🚀 Production Deployment Guide

## 1. Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** v14 or later (or Docker)
- **npm** v9 or later
- **OpenAI API Key** (optional — app works with mock mode)

---

## 2. Environment Configuration

Copy the `.env` template in `backend/` and update production values:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# ─── Database ─────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/ai_interview_coach?sslmode=require"

# ─── JWT (generate secure random strings, min 32 chars) ───
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── AI Service ───────────────────────────────────────
USE_MOCK_AI=false
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# ─── Email Service ────────────────────────────────────
USE_MOCK_EMAIL=false
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key
EMAIL_FROM="AI Interview Coach <noreply@yourdomain.com>"

# ─── Google OAuth ─────────────────────────────────────
USE_MOCK_OAUTH=false
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

# ─── File Storage ─────────────────────────────────────
# Option 1: Local filesystem (default)
STORAGE_PROVIDER=local

# Option 2: Cloudinary
# STORAGE_PROVIDER=cloudinary
# CLOUDINARY_CLOUD_NAME=your_cloud
# CLOUDINARY_API_KEY=your_key
# CLOUDINARY_API_SECRET=your_secret

# Option 3: AWS S3 (requires @aws-sdk/client-s3)
# STORAGE_PROVIDER=s3
# AWS_S3_BUCKET=your-bucket
# AWS_S3_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
```

---

## 3. PostgreSQL Setup

### Option A: Docker (Recommended)
```bash
docker-compose up postgres -d
```

### Option B: Manual PostgreSQL
```bash
# Create database
createdb ai_interview_coach

# Verify connection
psql -d ai_interview_coach -c "SELECT 1"
```

### Apply Schema & Seed
```bash
cd backend
npx prisma migrate deploy    # Apply all migrations
npx prisma db seed            # Seed demo data
```

---

## 4. Docker Compose Production Run

Deploy the entire stack with one command:

```bash
docker-compose up --build -d
```

The stack includes:
- **PostgreSQL** with health checks and persistent volume
- **Backend API** server on port 5000
- **Frontend** Nginx server on port 80

Services:
- Frontend: `http://localhost`
- API: `http://localhost:5000/api`
- Health: `http://localhost:5000/health`

---

## 5. Manual Build & Standalone Deployment

### Backend
```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm ci
npm run build
# Host the dist/ directory with Nginx, Caddy, AWS S3 + CloudFront, or Vercel
```

---

## 6. Health Check

The `/health` endpoint reports:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "2.0.0",
  "database": "connected",
  "services": {
    "ai": "openai",
    "email": "smtp",
    "storage": "cloudinary",
    "oauth": "google"
  }
}
```

Status codes:
- `200 OK` — All systems operational
- `503 Service Unavailable` — Database disconnected

---

## 7. Migration from v1 (SQLite/Mock) to v2 (PostgreSQL/Production)

1. **Database**: Change `DATABASE_URL` from `file:./dev.db` to PostgreSQL connection string
2. **Schema**: Run `npx prisma migrate dev` to generate and apply PostgreSQL migration
3. **Services**: Toggle `USE_MOCK_*` flags to `false` and provide real API keys
4. **Storage**: Set `STORAGE_PROVIDER` to `cloudinary` or `s3` and configure credentials
5. **Verify**: Check `/health` endpoint shows all services as production

---

## 8. Monitoring & Logging

- **Logs**: Winston writes to `logs/error.log` and `logs/combined.log` with rotation
- **HTTP Logs**: Morgan combined format piped to Winston
- **Email Logs**: In mock mode, emails are saved to `logs/emails/` as JSON files
- **Health**: Monitor `/health` endpoint for database and service status

---

## 9. Security Checklist

- [ ] Generate unique JWT secrets (min 32 chars)
- [ ] Use HTTPS in production (set `FRONTEND_URL` to `https://...`)
- [ ] Set secure database password
- [ ] Enable SSL on PostgreSQL connection (`?sslmode=require`)
- [ ] Configure CORS origin to your production domain
- [ ] Review rate limiting settings for your traffic
- [ ] Set up log rotation and monitoring
- [ ] Use environment-specific `.env` files (never commit secrets)
