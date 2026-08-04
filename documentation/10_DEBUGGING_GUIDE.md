# 10. Debugging & Troubleshooting Guide

This guide details common operational errors, diagnostic trace steps, and resolutions.

---

## 🚨 1. Database & Prisma Errors

### Error: `Error loading shared library libssl.so.1.1: No such file or directory`
- **Cause**: Alpine Linux container (`node:20-alpine`) missing OpenSSL / musl C-library dependencies required by Prisma Query Engine binaries.
- **Fix**: Update `backend/Dockerfile` to install dependencies and configure `binaryTargets` in `schema.prisma`:
  ```dockerfile
  RUN apk add --no-cache openssl openssl-dev libc6-compat
  ```
  ```prisma
  generator client {
    provider      = "prisma-client-js"
    binaryTargets = ["native", "linux-musl-openssl-3.0.x", "linux-musl"]
  }
  ```

### Error: `P2002: Unique constraint failed on the field`
- **Cause**: Attempting to register an existing email or add duplicate skill.
- **Fix**: Caught by `errorHandler` middleware; returns `409 Conflict`.

---

## 🔒 2. CORS Errors

### Error: `Access-Control-Allow-Origin header contains multiple values ..., but only one is allowed`
- **Cause**: Passing literal comma-separated strings directly to static `cors({ origin })`.
- **Fix**: Use dynamic origin function in `backend/src/index.ts`:
  ```typescript
  app.use(cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      const isAllowed = configuredOrigins.includes('*') ||
                        configuredOrigins.includes(requestOrigin) ||
                        /\.vercel\.app$/.test(requestOrigin);
      callback(null, isAllowed);
    },
    credentials: true
  }));
  ```

---

## 🔑 3. Authentication & JWT Errors

### Error: `401 Access token is required` / `Invalid or expired token`
- **Cause**: Missing `Authorization: Bearer <token>` header or token expired (>15 mins).
- **Fix**: Axios interceptor in `frontend/src/lib/api.ts` automatically calls `/api/auth/refresh-token` to rotate tokens. If refresh token also expired (>7 days), user is redirected to `/login`.

---

## 📄 4. File Upload & Resume Errors

### Error: `400 Only PDF files are allowed for resumes` / `500 pdf-parse error`
- **Cause**: User uploaded non-PDF format or password-protected PDF.
- **Fix**: Multer filter in `upload.utils.ts` rejects non-PDF mimetypes. `resume.service.ts` catches parsing exceptions and falls back gracefully to raw filename string.

---

## 🤖 5. OpenAI & AI Errors

### Error: OpenAI API Rate Limit / Network Exception
- **Cause**: OpenAI API key quota depleted or transient outage.
- **Fix**: `ai.service.ts` includes `try/catch` wrapping for all GPT-4 calls. On error, it logs the exception and delegates to `mockAIService`, ensuring zero candidate disruption.
