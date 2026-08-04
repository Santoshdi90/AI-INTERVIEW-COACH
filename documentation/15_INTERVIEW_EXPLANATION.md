# 15. Interview Explanation Guide

This guide provides senior engineering response templates for explaining the project during technical job interviews.

---

## 1. "Can you explain your project?"
> *"I built AI Interview Coach, an end-to-end web application that helps candidates prepare for technical and behavioral interviews. It parses PDF resumes, calculates ATS scoring, generates category-specific mock interviews across 16 domains, transcribes speech answers in real-time, and evaluates responses using OpenAI GPT-4 with structured STAR method feedback. The stack is React 18 and Vite on the frontend, Express and Node.js on the backend using TypeScript, PostgreSQL on Neon serverless with Prisma ORM, and deployed on Vercel and Render."*

---

## 2. "Explain the architecture."
> *"The backend uses a clean Controller-Service-Repository architecture. Controllers handle HTTP request/response formatting, Services contain business logic and external integrations (OpenAI, Nodemailer, Cloudinary), and Repositories abstract Prisma database queries. External integration services follow the Strategy and Factory patterns to seamlessly toggle between production APIs and mock fallbacks without changing business code."*

---

## 3. "How did you handle authentication?"
> *"I implemented a production dual-token JWT architecture. Upon login, the server issues a short-lived 15-minute Access Token returned in the JSON payload, and a long-lived 7-day Refresh Token set in a secure `HttpOnly` cookie. Axios interceptors on the client automatically catch `401` errors and call `/auth/refresh-token` to rotate tokens silently. Passwords are hashed using `bcryptjs` with 12 salt rounds, and refresh token sessions are stored in PostgreSQL for instant session revocation."*

---

## 4. "How is the database designed?"
> *"We use PostgreSQL hosted on Neon with Prisma ORM. The schema takes advantage of PostgreSQL native features including custom enums for interview categories and difficulty levels, native `JSONB` columns for rich ATS analysis objects, native string arrays for question hints and feedback keywords, and compound database indexes on high-frequency query keys like `[user_id, status]` and `[refresh_token, expires_at]`."*

---

## 5. "How did you handle AI prompt engineering & reliability?"
> *"I engineered structured prompts instructing OpenAI's GPT-4 model to output strictly validated JSON matching TypeScript interfaces. To guarantee resilience, if OpenAI API rate limits or network issues occur, the service catches the exception and gracefully falls back to curated mock question banks so the candidate's interview session is never interrupted."*

---

## 6. "How is it deployed?"
> *"The frontend is deployed to Vercel's global CDN with single-page application route rewrites. The backend is containerized with Docker using `node:20-alpine` with OpenSSL and musl C-libraries installed, and deployed on Render. The database is hosted on Neon PostgreSQL. Environment variables control CORS allowed origins dynamically, including preview environments and production domains."*
