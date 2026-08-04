# 🏗️ Architecture & Database Design

## Clean Architecture Layers (Backend)

```
                       ┌─────────────────────────┐
                       │    HTTP Request Client  │
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │     Express Routes      │
                       └────────────┬────────────┘
                                    │ (Validation & Auth Middleware)
                       ┌────────────▼────────────┐
                       │       Controllers       │
                       └────────────┬────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         │                                                     │
┌────────▼────────┐                                   ┌────────▼────────┐
│  Repositories   │                                   │ Unified Services│
└────────┬────────┘                                   │ (AI/Email/Store)│
         │                                            └────────┬────────┘
┌────────▼────────┐                                            │
│  PostgreSQL DB  │                              ┌─────────────┴─────────────┐
└─────────────────┘                              │                           │
                                          USE_MOCK=true?             USE_MOCK=false?
                                          ┌──────▼──────┐           ┌──────▼──────┐
                                          │ Mock Service │           │ Production  │
                                          │ (file/random)│           │ (OpenAI/SMTP│
                                          └─────────────┘           │ /Cloudinary)│
                                                                    └─────────────┘
```

## Service Factory Pattern

Each external service uses a unified service that delegates to **mock** or **production** implementations based on environment flags:

| Service | Mock Flag | Mock Implementation | Production Implementation |
|---|---|---|---|
| AI | `USE_MOCK_AI` | Hardcoded question banks, random scores | OpenAI GPT-4 API |
| Email | `USE_MOCK_EMAIL` | JSON files in `logs/emails/` | Nodemailer SMTP |
| Storage | `STORAGE_PROVIDER` | Local filesystem copy | Cloudinary / AWS S3 |
| OAuth | `USE_MOCK_OAUTH` | Demo Google user | Google OAuth2 token verification |

## Entity Relationship Diagram (ERD)

```
[ User ] ───<1:N>─── [ Session ]
   │                  (refresh tokens, device tracking)
   │
   ├───<1:N>─── [ VerificationToken ]
   │
   ├───<1:N>─── [ PasswordReset ]
   │
   ├───<1:N>─── [ Resume ]
   │             (file metadata, raw text, JSONB analysis)
   │
   ├───<1:N>─── [ Skill ]
   │             (proficiency, source enum)
   │
   ├───<1:N>─── [ Analytic ]
   │             (metric enum, time-series values)
   │
   └───<1:N>─── [ Interview ] ───<1:N>─── [ Question ]
                 (type enum, difficulty enum,            │ (String[] hints)
                  status enum, scores)                   │
                                                         ├───<1:1>─── [ Answer ]
                                                         │
                                                         └───<1:1>─── [ Feedback ]
                                                                       (String[] arrays for
                                                                        keywords, suggestions,
                                                                        strengths, weaknesses)
```

## PostgreSQL Schema Features

### Native Enums
- `Role`: USER, ADMIN
- `InterviewType`: HR, TECHNICAL, BEHAVIORAL, SYSTEM_DESIGN, FRONTEND, BACKEND, JAVA, JAVASCRIPT, REACT, NODE, DATABASE, OS, COMPUTER_NETWORKS, DBMS, OOPS, CUSTOM
- `Difficulty`: EASY, MEDIUM, HARD
- `InterviewStatus`: PENDING, IN_PROGRESS, COMPLETED, ABANDONED
- `SkillSource`: MANUAL, RESUME, INTERVIEW
- `AnalyticMetric`: INTERVIEW_SCORE, GRAMMAR_SCORE, CONFIDENCE_SCORE, TECHNICAL_SCORE, COMMUNICATION_SCORE

### Native Data Types
- `Json` (JSONB): Resume `analysisJson` column
- `String[]`: Question hints, Feedback keywords/suggestions/strengths/weaknesses

### Database Indexes
| Table | Indexed Columns | Purpose |
|---|---|---|
| users | `email`, `deleted_at` | Login lookup, soft-delete filter |
| sessions | `(refresh_token, expires_at)`, `user_id` | Token validation, session cleanup |
| verification_tokens | `(token, expires_at)` | Email verification lookup |
| password_resets | `(token, expires_at)` | Password reset lookup |
| resumes | `user_id` | User resume listing |
| skills | `user_id` | User skills listing |
| interviews | `(user_id, status)`, `(user_id, created_at)` | Filtered interview queries |
| questions | `interview_id` | Question listing per interview |
| analytics | `(user_id, metric, date)`, `(user_id, date)` | Time-series analytics queries |

### Table Definitions
1. **users**: Primary identity table storing credentials, target roles, profile metadata.
2. **sessions**: Refresh tokens and device session tracking.
3. **verification_tokens**: Email verification tokens with 24h expiry.
4. **password_resets**: Password reset tokens with 1h expiry.
5. **resumes**: Uploaded PDF references, parsed raw text, overall & ATS scores, JSONB analysis.
6. **skills**: User technical competencies, proficiency levels, and extraction source.
7. **interviews**: Interview sessions (Type, Difficulty, Status, Overall Score, Duration).
8. **questions**: Individual generated questions per interview (String[] hints).
9. **answers**: User spoken/typed transcripts per question.
10. **feedback**: AI diagnostic feedback (Grammar, STAR method, Technical accuracy, Ideal answers, String[] arrays).
11. **analytics**: Time-series evaluation metrics for charting.
