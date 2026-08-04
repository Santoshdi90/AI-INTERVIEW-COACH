# 09. Environment Variables Reference

This document catalogs every environment variable across backend and frontend environments.

---

## 🖥️ Backend Environment Variables (`backend/.env`)

### Server Configuration
| Variable | Type | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Enum (`development` \| `production` \| `test`) | `development` | Environment mode |
| `PORT` | Number | `5001` | Express server port |
| `FRONTEND_URL` | String (Comma-separated URLs supported) | `http://localhost:3000` | Allowed CORS origins for browser preflight and headers |

---

### Database Configuration
| Variable | Type | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | String (PostgreSQL URL) | — | PostgreSQL connection string with SSL parameters |

---

### Authentication & Secrets
| Variable | Type | Default | Description |
|---|---|---|---|
| `JWT_ACCESS_SECRET` | String (Min 32 chars) | — | HMAC SHA-256 secret key for signing short-lived access tokens |
| `JWT_REFRESH_SECRET` | String (Min 32 chars) | — | HMAC SHA-256 secret key for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | String | `15m` | Access token lifespan |
| `JWT_REFRESH_EXPIRES_IN` | String | `7d` | Refresh token lifespan |
| `REQUIRE_EMAIL_VERIFICATION` | String (`true` \| `false`) | `false` | Gate requiring email verification link click before login |

---

### Integration Service Modes (Mock vs Production)
| Variable | Type | Default | Description |
|---|---|---|---|
| `USE_MOCK_AI` | String (`true` \| `false`) | `true` | `true` uses mock banks; `false` calls OpenAI API |
| `USE_MOCK_STORAGE` | String (`true` \| `false`) | `true` | `true` uses local disk; `false` uses Cloudinary/S3 |
| `USE_MOCK_EMAIL` | String (`true` \| `false`) | `true` | `true` writes JSON email logs; `false` sends via SMTP |
| `USE_MOCK_OAUTH` | String (`true` \| `false`) | `true` | `true` returns demo user; `false` verifies Google ID token |
| `STORAGE_PROVIDER` | Enum (`local` \| `cloudinary` \| `s3`) | `local` | Active file storage engine strategy |

---

### External API Keys & Credentials
| Variable | Type | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | String | — | OpenAI API key (`sk-proj-...`) |
| `OPENAI_MODEL` | String | `gpt-4-turbo-preview` | OpenAI chat model target |
| `CLOUDINARY_CLOUD_NAME` | String | — | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | String | — | Cloudinary API access key |
| `CLOUDINARY_API_SECRET` | String | — | Cloudinary API secret |
| `SMTP_HOST` | String | `smtp.gmail.com` | SMTP email server hostname |
| `SMTP_PORT` | Number | `587` | SMTP server port |
| `SMTP_USER` | String | — | SMTP username / email address |
| `SMTP_PASS` | String | — | SMTP password / App password |
| `EMAIL_FROM` | String | — | Standard `From:` header format |
| `GOOGLE_CLIENT_ID` | String | — | Google OAuth2 Client ID |
| `GOOGLE_CLIENT_SECRET` | String | — | Google OAuth2 Client Secret |
| `GOOGLE_CALLBACK_URL` | String | — | OAuth2 redirect URL endpoint |

---

## 🌐 Frontend Environment Variables (`frontend/.env`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | String | `/api` | Base URL of backend REST API server |
