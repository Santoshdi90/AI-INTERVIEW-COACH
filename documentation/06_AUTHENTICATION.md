# 06. Authentication & Session Architecture

## Overview
AI Interview Coach uses a hybrid dual-token architecture:
1. **Short-Lived JWT Access Token**: Transmitted in the HTTP `Authorization: Bearer <token>` header for stateless, fast API authorization. Expiring in 15 minutes.
2. **Long-Lived Refresh Token**: Stored in a secure, `HttpOnly`, `SameSite` cookie and persisted in PostgreSQL (`sessions` table). Expiring in 7 days with rotation on every refresh.

---

## 🔑 Token Specifications

### 1. Access Token
- **Secret**: `JWT_ACCESS_SECRET` (configured in `backend/.env`).
- **TTL**: `15m` (configured via `JWT_ACCESS_EXPIRES_IN`).
- **Payload Structure**:
  ```json
  {
    "sub": "user-uuid-1234",
    "email": "candidate@example.com",
    "role": "USER",
    "name": "Candidate Name",
    "type": "access",
    "iat": 1700000000,
    "exp": 1700000900
  }
  ```

### 2. Refresh Token
- **Secret**: `JWT_REFRESH_SECRET` (configured in `backend/.env`).
- **TTL**: `7d` (configured via `JWT_REFRESH_EXPIRES_IN`).
- **Cookie Attributes**:
  - `HttpOnly`: True (Prevents XSS attacks from reading token via JavaScript).
  - `Secure`: True in production (`NODE_ENV === 'production'`).
  - `SameSite`: `'lax'` or `'strict'`.
  - `Path`: `/api/auth`.
- **Database Model**: `Session` table records `userId`, `refreshToken`, `userAgent`, `ipAddress`, `expiresAt`.

---

## 🔒 Password Hashing
- **Algorithm**: `bcryptjs` with 12 salt rounds.
- **Implementation**:
  ```typescript
  const SALT_ROUNDS = 12;
  const passwordHash = await bcrypt.hash(rawPassword, SALT_ROUNDS);
  const isValid = await bcrypt.compare(candidatePassword, user.passwordHash);
  ```

---

## 🛡️ Authentication & Authorization Middleware

### 1. `authenticate` Middleware (`src/middleware/auth.middleware.ts`)
- Extract `Authorization` header.
- Verify format starts with `Bearer `.
- Verify token signature against `JWT_ACCESS_SECRET`.
- Verify `decoded.type === 'access'`.
- Attach user context to Express request: `req.user = { id, email, role, name }`.

### 2. `requireAdmin` Middleware
- Checks `req.user.role === 'ADMIN'`.
- Throws `AppError('Admin access required', 403)` if unauthorized.

---

## 🔄 Refresh Token Rotation Flow

```
1. Client makes API request with Access Token.
2. Server detects Access Token is expired (401 Unauthorized).
3. Client Axios interceptor intercepts 401 error.
4. Client sends POST /api/auth/refresh-token with HttpOnly refreshToken cookie.
5. Server verifies refreshToken against sessions table in PostgreSQL.
6. Server invalidates old session and issues:
   - NEW Access Token (returned in JSON payload)
   - NEW Refresh Token (set in updated HttpOnly cookie)
   - NEW session row in PostgreSQL
7. Client retries original request with new Access Token seamlessly.
```

---

## 📧 Email Verification Configuration

- **Field**: `User.isVerified` (Boolean).
- **Environment Toggle**: `REQUIRE_EMAIL_VERIFICATION` in `backend/.env`.
- **Development / Initial Production**: Default set to `false`.
  - When `false`, newly registered candidates are created with `isVerified: true` and can log in immediately.
- **Verification Gate**:
  - When set to `true`, `authService.login()` blocks unverified logins with `403 Forbidden` until the user clicks the token link sent via Nodemailer SMTP.
