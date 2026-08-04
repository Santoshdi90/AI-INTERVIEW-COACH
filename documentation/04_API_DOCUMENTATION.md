# 04. API Documentation

All API responses follow the standardized JSON envelope:
```json
{
  "success": true,
  "message": "Human-readable status message",
  "data": {},
  "meta": {}
}
```

---

## 🔑 Authentication Routes (`/api/auth`)

### 1. `POST /api/auth/register`
- **Purpose**: Register a new user account.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "John Doe"
  }
  ```
- **Validation**: Email must be valid, password must be min 8 chars with uppercase, lowercase, and digit.
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "data": { "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe", "role": "USER", "isVerified": true } }
  }
  ```
- **Errors**: `409 Conflict` (Email exists), `422 Unprocessable Entity` (Validation failure).
- **Database Tables**: `users`, `verification_tokens`.

---

### 2. `POST /api/auth/login`
- **Purpose**: Authenticate credentials, set HTTP-only refresh cookie, return access token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response Headers**: Sets `Set-Cookie: refreshToken=...; HttpOnly; Path=/api/auth`.
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": { "accessToken": "eyJhbGci...", "user": { "id": "uuid", "email": "user@example.com", "role": "USER" } }
  }
  ```
- **Errors**: `401 Unauthorized` (Invalid credentials), `403 Forbidden` (Email unverified if verification gate active).
- **Database Tables**: `users`, `sessions`.

---

### 3. `POST /api/auth/refresh-token`
- **Purpose**: Issue new access token using HTTP-only `refreshToken` cookie.
- **Access**: Public (Cookie required)
- **Cookies**: `refreshToken=<jwt>`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Token refreshed",
    "data": { "accessToken": "eyJhbGci..." }
  }
  ```
- **Errors**: `401 Unauthorized` (Missing or invalid refresh session).
- **Database Tables**: `sessions`, `users`.

---

### 4. `POST /api/auth/logout`
- **Purpose**: Revoke current refresh token session and clear HTTP-only cookie.
- **Access**: Public
- **Success Response (200)**:
  ```json
  { "success": true, "message": "Logged out successfully" }
  ```
- **Database Tables**: `sessions`.

---

### 5. `POST /api/auth/google`
- **Purpose**: Authenticate using Google OAuth ID token or authorization code.
- **Access**: Public
- **Request Body**:
  ```json
  { "credential": "<Google_ID_Token>" }
  ```
- **Success Response (200)**: Returns `accessToken`, `user` object, sets `refreshToken` cookie.
- **Database Tables**: `users`, `sessions`.

---

### 6. `GET /api/auth/me`
- **Purpose**: Fetch current user session payload.
- **Access**: Bearer Token
- **Headers**: `Authorization: Bearer <accessToken>`
- **Success Response (200)**: Returns decoded token payload (`sub`, `email`, `role`, `name`).

---

## 👤 User & Profile Routes (`/api/users`)

### 1. `GET /api/users/profile`
- **Access**: Bearer Token
- **Purpose**: Fetch complete user profile data.
- **Database Tables**: `users`.

### 2. `GET /api/users/dashboard`
- **Access**: Bearer Token
- **Purpose**: Fetch aggregated dashboard statistics (total interviews, average score, skill proficiencies, recent activity).
- **Database Tables**: `interviews`, `skills`, `analytics`, `resumes`.

### 3. `PATCH /api/users/profile`
- **Access**: Bearer Token
- **Request Body**: `{ "targetRole": "Senior Engineer", "targetCompany": "Google", "bio": "..." }`
- **Database Tables**: `users`.

### 4. `POST /api/users/avatar`
- **Access**: Bearer Token
- **Request Body**: `multipart/form-data` with `avatar` image file.
- **Database Tables**: `users`.

---

## 📄 Resume Routes (`/api/resumes`)

### 1. `POST /api/resumes`
- **Access**: Bearer Token
- **Request Body**: `multipart/form-data` with PDF `resume` file (max 5MB).
- **Process**: Extracts text, executes OpenAI ATS analysis, extracts skills, saves record.
- **Database Tables**: `resumes`, `skills`.

### 2. `GET /api/resumes`
- **Access**: Bearer Token
- **Purpose**: List candidate resumes.

### 3. `GET /api/resumes/:id`
- **Access**: Bearer Token
- **Purpose**: Fetch specific resume details & parsed JSON analysis.

### 4. `PATCH /api/resumes/:id/set-active`
- **Access**: Bearer Token
- **Purpose**: Mark resume as active (deactivates other user resumes).

### 5. `POST /api/resumes/:id/reanalyze`
- **Access**: Bearer Token
- **Purpose**: Re-run AI ATS analysis on existing uploaded resume.

---

## 🎤 Interview Routes (`/api/interviews`)

### 1. `POST /api/interviews`
- **Access**: Bearer Token
- **Request Body**:
  ```json
  {
    "type": "TECHNICAL",
    "difficulty": "MEDIUM",
    "totalQuestions": 5,
    "customTopic": "React State Management"
  }
  ```
- **Process**: Creates `Interview` record, generates questions via OpenAI/Mock, creates `Question` records.
- **Database Tables**: `interviews`, `questions`.

### 2. `GET /api/interviews/:id`
- **Access**: Bearer Token
- **Purpose**: Fetch interview state, questions, submitted answers, and feedback.

### 3. `POST /api/interviews/:id/start`
- **Access**: Bearer Token
- **Purpose**: Update status to `IN_PROGRESS` and record `startedAt` timestamp.

### 4. `POST /api/interviews/:id/answer`
- **Access**: Bearer Token
- **Request Body**:
  ```json
  {
    "questionId": "uuid",
    "transcript": "Candidate spoken answer text...",
    "duration": 45
  }
  ```
- **Process**: Upserts candidate `Answer`, triggers immediate OpenAI/Mock evaluation, upserts `Feedback` record, advances `currentQuestion` index.
- **Database Tables**: `answers`, `feedback`, `questions`, `interviews`.

### 5. `POST /api/interviews/:id/complete`
- **Access**: Bearer Token
- **Purpose**: Finalize interview, compute overall average score, set status to `COMPLETED`, record `analytics` metric points.
- **Database Tables**: `interviews`, `feedback`, `analytics`.

---

## 📊 Analytics & Admin Routes

### 1. `GET /api/analytics`
- **Access**: Bearer Token
- **Purpose**: Fetch time-series interview scores, skill breakdown, metric averages.

### 2. `GET /api/admin/stats`
- **Access**: Admin Bearer Token (`Role === 'ADMIN'`)
- **Purpose**: Fetch system-wide user counts, session totals, average platform scores.

### 3. `GET /api/admin/users`
- **Access**: Admin Bearer Token
- **Purpose**: Paginated search & filter over registered users.

### 4. `DELETE /api/admin/users/:id`
- **Access**: Admin Bearer Token
- **Purpose**: Soft-delete user account (`deletedAt = now()`).
