# 📡 API Reference Documentation

All endpoints respond with the standard JSON envelope:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "meta": {}
}
```

---

## 🔑 Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user account |
| POST | `/login` | Public | Sign in user & receive Access Token + Cookie |
| POST | `/refresh-token` | Public | Refresh expired Access Token using Cookie |
| POST | `/logout` | Public | Clear refresh token session |
| GET | `/verify-email` | Public | Verify email address via query token |
| POST | `/forgot-password` | Public | Request password reset link |
| POST | `/reset-password` | Public | Complete password reset |
| POST | `/google` | Public | Google OAuth login (ID token or auth code) |
| GET | `/google/callback` | Public | Google OAuth redirect callback |
| GET | `/me` | Bearer Token | Fetch authenticated user object |

### Google OAuth Flow

**Option 1: Popup/Token Flow** (Frontend sends Google credential)
```
POST /api/auth/google
Body: { "credential": "<Google ID Token>" }
```

**Option 2: Redirect Flow** (Server-side OAuth)
```
GET /api/auth/google/callback?code=<authorization_code>
→ Redirects to FRONTEND_URL/auth/google/callback?token=<JWT>
```

---

## 👤 User & Profile Routes (`/api/users`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/profile` | Bearer Token | Get user profile metadata |
| GET | `/dashboard` | Bearer Token | Aggregated stats for dashboard UI |
| PATCH | `/profile` | Bearer Token | Update user target role/company/bio |
| POST | `/avatar` | Bearer Token | Upload profile picture |
| PATCH | `/change-password` | Bearer Token | Update account password |
| DELETE | `/account` | Bearer Token | Soft-delete user account |
| GET | `/skills` | Bearer Token | List user skills |
| POST | `/skills` | Bearer Token | Add new skill |
| DELETE | `/skills/:id` | Bearer Token | Delete skill |

---

## 📄 Resume Routes (`/api/resumes`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Bearer Token | Upload PDF resume & run AI analysis |
| GET | `/` | Bearer Token | List user resumes |
| GET | `/:id` | Bearer Token | Get specific resume details & analysis |
| PATCH | `/:id/set-active` | Bearer Token | Set active resume |
| POST | `/:id/reanalyze` | Bearer Token | Re-run AI analysis on existing resume |
| DELETE | `/:id` | Bearer Token | Delete resume record |

---

## 🎤 Interview Routes (`/api/interviews`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Bearer Token | Create new mock interview session |
| GET | `/` | Bearer Token | List user interview history |
| GET | `/:id` | Bearer Token | Fetch interview questions & state |
| POST | `/:id/start` | Bearer Token | Start interview timer |
| POST | `/:id/answer` | Bearer Token | Submit answer transcript for AI analysis |
| POST | `/:id/complete` | Bearer Token | Complete session & compute overall score |
| GET | `/:id/feedback` | Bearer Token | Get detailed evaluation & model answers |
| DELETE | `/:id` | Bearer Token | Delete interview |

---

## 📊 Analytics & Admin Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/analytics` | Bearer Token | Aggregated time-series & skill metrics |
| GET | `/api/feedback/interview/:id` | Bearer Token | Get feedback for a specific interview |
| GET | `/api/admin/stats` | Admin Token | System-wide statistics |
| GET | `/api/admin/users` | Admin Token | Search & list registered users |
| DELETE | `/api/admin/users/:id` | Admin Token | Soft-delete user |

---

## 🏥 System Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Server health check (includes DB & service status) |

### Health Check Response
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "2.0.0",
  "database": "connected",
  "services": {
    "ai": "openai | mock",
    "email": "smtp | mock",
    "storage": "local | cloudinary | s3",
    "oauth": "google | mock"
  }
}
```

---

## Rate Limiting

| Scope | Window | Max Requests |
|---|---|---|
| Global | 15 minutes | 200 |
| Auth endpoints | 15 minutes | 10 |
