# 08. Deployment Guide

## Architecture Topology
- **Database**: Neon PostgreSQL Cluster (`ep-restless-forest-a79skh4c-pooler`).
- **Backend Service**: Render Web Service (`ai-interview-coach-api-rjk8.onrender.com`).
- **Frontend SPA**: Vercel CDN (`ai-interview-coach-silk-six.vercel.app`).
- **Source Repository**: `https://github.com/Santoshdi90/AI-INTERVIEW-COACH.git`.

---

## 1. Database Setup (Neon PostgreSQL)

1. **Create Database**: Create database instance `Aicoach` on Neon.
2. **Obtain Connection String**: Enable Pooled Connection (`sslmode=require`).
3. **Synchronize Schema**:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

---

## 2. Backend Deployment (Render)

1. Create a **Web Service** on Render connected to `Santoshdi90/AI-INTERVIEW-COACH`.
2. **Root Directory**: `backend`.
3. **Runtime**: `Node`.
4. **Build Command**: `npm install && npm run build` (Runs `prisma generate && tsc`).
5. **Start Command**: `npm start` (`node dist/index.js`).
6. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_8gMef2YxzRQl@ep-restless-forest-a79skh4c-pooler.ap-southeast-2.aws.neon.tech/Aicoach?sslmode=require`
   - `JWT_ACCESS_SECRET`: `<32_char_random_secret>`
   - `JWT_REFRESH_SECRET`: `<32_char_random_secret>`
   - `FRONTEND_URL`: `https://ai-interview-coach-silk-six.vercel.app`
   - `USE_MOCK_AI`: `true` (or `false` with `OPENAI_API_KEY`)
   - `REQUIRE_EMAIL_VERIFICATION`: `false`

---

## 3. Frontend Deployment (Vercel)

1. Create new project on Vercel from `Santoshdi90/AI-INTERVIEW-COACH`.
2. **Root Directory**: `frontend`.
3. **Framework**: `Vite`.
4. **Build Command**: `npm run build` (`tsc && vite build`).
5. **Output Directory**: `dist`.
6. **Environment Variables**:
   - `VITE_API_URL`: `https://ai-interview-coach-api-rjk8.onrender.com/api`
7. **SPA Rewrites (`vercel.json`)**:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## 🔄 Rollback Procedure

If a breaking issue occurs:
1. **GitHub Rollback**: Revert `main` branch to prior commit:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. **Render**: Click **Events** → **Rollback** to previous successful deployment.
3. **Vercel**: Select **Deployments** → **Promote to Production** on previous stable build.
