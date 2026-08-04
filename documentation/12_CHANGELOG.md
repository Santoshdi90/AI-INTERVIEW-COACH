# 12. Chronological Changelog

## [2.0.0] - 2026-08-04 — Final Production Release

### Added
- **PostgreSQL Database Integration**: Switched Prisma ORM datasource from SQLite (`dev.db`) to serverless Neon PostgreSQL cluster (`Aicoach`).
- **Native Enums & Types**: Added PostgreSQL native enums (`Role`, `InterviewType`, `Difficulty`, `InterviewStatus`, `SkillSource`, `AnalyticMetric`), native `JSONB` for `analysisJson`, native `String[]` array columns, and database indexes.
- **Production AI Service**: Integrated OpenAI GPT-4 API (`ai.service.ts`) for dynamic question generation, multi-metric answer evaluation, and ATS resume analysis with structured JSON parsing.
- **Production Email Service**: Integrated Nodemailer SMTP service (`email.service.ts`) supporting HTML email templates for welcome, verification, and password resets.
- **Abstract Storage Service**: Implemented Strategy pattern (`storage.service.ts`) supporting Local, Cloudinary, and AWS S3 storage engines.
- **Google OAuth2 Service**: Integrated `google-auth-library` (`google.service.ts`) for real Google ID token verification and code exchange.
- **Testing & Quality**: Added 5 Jest test suites with 67 automated unit and integration tests.
- **Deployment Artifacts**: Added `Dockerfile` for backend, `vercel.json` SPA rewrites for frontend, `.env.example` templates, and comprehensive technical documentation.

### Fixed
- **OpenSSL / Alpine Musl Compatibility**: Added `binaryTargets = ["native", "linux-musl-openssl-3.0.x", "linux-musl"]` and installed `openssl`, `openssl-dev`, `libc6-compat` in Dockerfile.
- **CORS Dynamic Preflight**: Updated CORS middleware in Express `index.ts` to dynamically validate requesting origins, handling Vercel preview URLs, comma-separated environment variables, and preflight `OPTIONS` requests.
- **CSS @import Warning**: Re-ordered Google Fonts `@import` rule before `@import "tailwindcss"` in `index.css`.
- **Immediate Registration Login**: Added toggleable `REQUIRE_EMAIL_VERIFICATION` environment flag so new users can log in immediately post-registration.

---

## [1.0.0] - Initial Prototype
- Initial UI implementation with mock question banks, local memory storage, and mock authentication.
