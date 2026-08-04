# 02. System Architecture

## Architecture Overview

AI Interview Coach is designed following **Clean Layered Architecture** on the backend and a **Modular Component-Store-Service Pattern** on the frontend. The application decouples state management, API transport, business domain logic, database persistence, and external cloud services.

```
+-------------------------------------------------------------------------+
|                              FRONTEND SPA                               |
|   React 18 + Vite | Tailwind CSS | TanStack Query | Zustand Auth Store |
+------------------------------------+------------------------------------+
                                     |
                                 HTTPS / REST API (JWT & HTTP-Only Cookie)
                                     |
+------------------------------------+------------------------------------+
|                             BACKEND API                                 |
|                       Node.js + Express + TypeScript                    |
|                                                                         |
|  +------------------+   +--------------------+   +-------------------+  |
|  | Middleware Layer |   | Controller Layer   |   | Service Layer     |  |
|  | (Auth, Helmet,   |-->| (Express Handlers, |--->| (Business Logic,  |  |
|  |  RateLimit, Zod) |   |  Response Envelope)|   |  AI, Email, Store)|  |
|  +------------------+   +--------------------+   +---------+---------+  |
|                                                            |            |
|                                                 +----------+----------+ |
|                                                 | Repository Layer    | |
|                                                 | (Prisma ORM Queries)| |
|                                                 +----------+----------+ |
+------------------------------------------------------------|------------+
                                                             |
                                           Database Driver / TLS Connection
                                                             |
+------------------------------------------------------------v------------+
|                          CLOUD INFRASTRUCTURE                           |
|  Neon PostgreSQL Cluster | OpenAI API (GPT-4) | Cloudinary / S3 Storage |
+-------------------------------------------------------------------------+
```

---

## 1. Frontend Architecture

### Technology Stack
- **Core**: React 18, Vite 8, TypeScript 5.4.
- **Styling**: Tailwind CSS v4 with custom dark glassmorphism design system (`index.css`).
- **State Management**: Zustand v5 with local storage persistence (`authStore.ts`).
- **Data Fetching**: TanStack React Query v5 + Axios v1 (`api.ts`).
- **Form Validation**: React Hook Form v7 + Zod v3.
- **Charts & Animations**: Recharts v3 + Framer Motion v12.

### Structure & Communication
1. **Axios Central Client (`src/lib/api.ts`)**:
   - Dynamic `baseURL` via `import.meta.env.VITE_API_URL` (defaults to `/api`).
   - `withCredentials: true` for automatic HTTP-only refresh cookie handling.
   - Request Interceptor: Automatically attaches `Authorization: Bearer <accessToken>` header from `localStorage`.
   - Response Interceptor: Catches `401 Unauthorized` responses and silently requests `/auth/refresh-token` before retrying original request.
2. **Global State (`src/store/authStore.ts`)**:
   - Maintains authenticated `user` object and `accessToken`.
   - Actions: `setAuth`, `logout`, `updateUser`.
3. **Protected Routes (`src/components/layout/ProtectedRoute.tsx`)**:
   - Guards authenticated pages (`/dashboard`, `/resume`, `/interview`, `/analytics`).
   - Admin Guard: Enforces `user.role === 'ADMIN'` for `/admin`.

---

## 2. Backend Architecture

### Design Pattern: Controller-Service-Repository
The backend enforces separation of concerns:
- **Routes (`src/routes/`)**: Define HTTP verbs, endpoints, rate limits, and `express-validator` rules.
- **Controllers (`src/controllers/`)**: Parse request parameters, invoke service methods, and format unified JSON responses.
- **Services (`src/services/`)**: Enforce business rules, interface with external AI/Email/Storage services, and coordinate repository calls.
- **Repositories (`src/repositories/`)**: Abstract database queries through Prisma Client (`prisma`).

```
Request ──> Route ──> Validate ──> Auth Guard ──> Controller ──> Service ──> Repository ──> Database
```

---

## 3. Database Architecture

- **Engine**: PostgreSQL 15 (hosted on Neon Serverless PostgreSQL).
- **ORM**: Prisma ORM v5.22.0.
- **Schema Features**:
  - Native PostgreSQL Enums (`Role`, `InterviewType`, `Difficulty`, `InterviewStatus`, `SkillSource`, `AnalyticMetric`).
  - Native `JSONB` storage (`Resume.analysisJson`).
  - Native Array storage (`Question.hints`, `Feedback.keywordsFound`, etc.).
  - Database Indexes on query keys (`users.email`, `sessions.refresh_token`, `interviews.user_id`, `analytics.date`).

---

## 4. External Integration Services (Factory Pattern)

Each external integration uses a unified service that dynamically chooses between **Production** and **Mock** implementations based on environment flags:

```
                      +-------------------+
                      |   Unified Service |
                      +---------+---------+
                                |
             +------------------+------------------+
             |                                     |
    USE_MOCK = true?                      USE_MOCK = false?
             |                                     |
+------------v------------+           +------------v------------+
| Mock Service            |           | Production Service      |
| - Local files           |           | - OpenAI GPT-4 API      |
| - Pre-canned banks      |           | - Nodemailer SMTP       |
| - Local disk storage    |           | - Cloudinary / AWS S3   |
+-------------------------+           +-------------------------+
```

---

## 5. Deployment Architecture

```
                                    +-----------------------+
                                    |     Vercel CDN        |
                                    | (Frontend React SPA)  |
                                    +-----------+-----------+
                                                |
                                        HTTPS / CORS
                                                |
                                    +-----------v-----------+
                                    |     Render Cloud      |
                                    | (Node Docker Service) |
                                    +-----+-----------+-----+
                                          |           |
                        PostgreSQL TLS    |           |  REST API / JSON
                                          |           |
           +------------------------------v---+   +---v------------------------+
           |     Neon PostgreSQL Cluster      |   |   OpenAI API (GPT-4)       |
           | (Serverless Cloud Database)      |   | (Dynamic Interview AI)     |
           +----------------------------------+   +----------------------------+
```

1. **Frontend (Vercel)**: Serves static Vite build assets with single-page app rewrites (`vercel.json`).
2. **Backend (Render)**: Runs Docker container (`node:20-alpine`) executing Node.js Express server on port 5000/5001.
3. **Database (Neon)**: Connection pooling via Neon PostgreSQL database URL.
