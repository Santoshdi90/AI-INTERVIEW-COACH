# 03. Database Documentation

## Database Technology & Provider
- **Database Engine**: PostgreSQL 15 (hosted on Neon Serverless Cloud).
- **ORM**: Prisma ORM `v5.22.0`.
- **Database Connection**: Configured via `DATABASE_URL` in `backend/.env`.

---

## 📊 Entity Relationship Diagram (ERD)

```
+----------------+        1:N        +------------------+
|      User      |-------------------|     Session      |
+----------------+                   +------------------+
  |    |    |
  |    |    +------------- 1:N -----> +------------------+
  |    |                             | VerificationToken|
  |    |                             +------------------+
  |    +------------------ 1:N -----> +------------------+
  |                                  |  PasswordReset   |
  |                                  +------------------+
  | 1:N
  +--------------> +------------------+
  |                |      Resume      |
  |                +------------------+
  | 1:N
  +--------------> +------------------+
  |                |      Skill       |
  |                +------------------+
  | 1:N
  +--------------> +------------------+
  |                |    Analytic      |
  |                +------------------+
  | 1:N
  +--------------> +------------------+        1:N        +------------------+
                   |    Interview     |-------------------|     Question     |
                   +------------------+                   +--------+---------+
                                                                   | 1:1
                                                                   +---------> +------------------+
                                                                   |           |      Answer      |
                                                                   |           +------------------+
                                                                   | 1:1
                                                                   +---------> +------------------+
                                                                               |     Feedback     |
                                                                               +------------------+
```

---

## 🔠 Database Enums

### 1. `Role`
- `USER`: Default candidate permissions.
- `ADMIN`: Platform administration permissions.

### 2. `InterviewType`
- Categories: `HR`, `TECHNICAL`, `BEHAVIORAL`, `SYSTEM_DESIGN`, `FRONTEND`, `BACKEND`, `JAVA`, `JAVASCRIPT`, `REACT`, `NODE`, `DATABASE`, `OS`, `COMPUTER_NETWORKS`, `DBMS`, `OOPS`, `CUSTOM`.

### 3. `Difficulty`
- Options: `EASY`, `MEDIUM`, `HARD`.

### 4. `InterviewStatus`
- Options: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `ABANDONED`.

### 5. `SkillSource`
- Options: `MANUAL`, `RESUME`, `INTERVIEW`.

### 6. `AnalyticMetric`
- Metrics: `INTERVIEW_SCORE`, `GRAMMAR_SCORE`, `CONFIDENCE_SCORE`, `TECHNICAL_SCORE`, `COMMUNICATION_SCORE`.

---

## 📋 Data Models & Table Schema

### 1. `User` (`users`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `email` | String | `@unique` | Candidate email |
| `passwordHash` | String? | `@map("password_hash")` | bcrypt password hash |
| `name` | String | — | Full candidate name |
| `avatar` | String? | — | Avatar image URL |
| `role` | `Role` | `@default(USER)` | Access role |
| `isVerified` | Boolean | `@default(false)` | Email verification flag |
| `isGoogleAuth` | Boolean | `@default(false)` | Google sign-in flag |
| `googleId` | String? | `@unique` | Google OAuth subject ID |
| `education` | String? | — | Education details |
| `experience` | String? | — | Years of experience |
| `targetCompany` | String? | `@map("target_company")` | Target target company |
| `targetRole` | String? | `@map("target_role")` | Target role position |
| `phone` | String? | — | Phone number |
| `bio` | String? | — | Short user bio |
| `createdAt` | DateTime | `@default(now())` | Registration timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Update timestamp |
| `deletedAt` | DateTime? | `@map("deleted_at")` | Soft deletion timestamp |

**Indexes**: `@@index([email])`, `@@index([deletedAt])`

---

### 2. `Session` (`sessions`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `userId` | String | `@map("user_id")` | Foreign key to `User.id` |
| `refreshToken` | String | `@unique, @map("refresh_token")` | JWT refresh token |
| `userAgent` | String? | — | Client browser agent |
| `ipAddress` | String? | — | Client IP address |
| `expiresAt` | DateTime | — | Token expiration time |
| `createdAt` | DateTime | `@default(now())` | Creation time |

**Indexes**: `@@index([refreshToken, expiresAt])`, `@@index([userId])`

---

### 3. `Resume` (`resumes`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `userId` | String | `@map("user_id")` | Foreign key to `User.id` |
| `fileName` | String | — | Uploaded filename |
| `fileUrl` | String | — | Storage path / URL |
| `fileSize` | Int? | — | Size in bytes |
| `rawText` | String? | — | Extracted text from PDF |
| `overallScore` | Int? | — | Overall resume quality score |
| `atsScore` | Int? | — | ATS compatibility score |
| `analysisJson` | Json? | — | Native PostgreSQL JSONB analysis |
| `isActive` | Boolean | `@default(false)` | Active resume toggle |
| `createdAt` | DateTime | `@default(now())` | Upload timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Update timestamp |

**Indexes**: `@@index([userId])`

---

### 4. `Skill` (`skills`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `userId` | String | `@map("user_id")` | Foreign key to `User.id` |
| `name` | String | — | Skill name (e.g., React) |
| `proficiency` | Int | `@default(0)` | Proficiency score (0–100) |
| `source` | `SkillSource` | `@default(MANUAL)` | Origin of skill |
| `createdAt` | DateTime | `@default(now())` | Creation timestamp |

**Constraints & Indexes**: `@@unique([userId, name])`, `@@index([userId])`

---

### 5. `Interview` (`interviews`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `userId` | String | — | Foreign key to `User.id` |
| `title` | String | — | Interview session title |
| `type` | `InterviewType` | — | Session category |
| `difficulty` | `Difficulty` | — | Session difficulty |
| `status` | `InterviewStatus` | `@default(PENDING)` | Current status |
| `totalQuestions` | Int | — | Total questions count |
| `currentQuestion` | Int | `@default(0)` | Active question index |
| `overallScore` | Float? | — | Aggregate session score |
| `duration` | Int? | — | Duration in seconds |
| `startedAt` | DateTime? | — | Start timestamp |
| `completedAt` | DateTime? | — | Completion timestamp |

**Indexes**: `@@index([userId, status])`, `@@index([userId, createdAt])`

---

### 6. `Question` (`questions`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `interviewId` | String | — | Foreign key to `Interview.id` |
| `text` | String | — | Question prompt text |
| `category` | String? | — | Question category tag |
| `orderIndex` | Int | — | Sequence index (0, 1, 2...) |
| `expectedTime` | Int? | — | Expected answer seconds |
| `hints` | String[] | — | PostgreSQL array of hints |

**Indexes**: `@@index([interviewId])`

---

### 7. `Answer` (`answers`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `questionId` | String | `@unique` | Foreign key to `Question.id` |
| `userId` | String | — | Foreign key to `User.id` |
| `transcript` | String? | — | Candidate spoken/typed text |
| `audioUrl` | String? | — | Audio recording URL |
| `duration` | Int? | — | Time spent answering |
| `wordCount` | Int? | — | Answer word count |

---

### 8. `Feedback` (`feedback`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `questionId` | String | `@unique` | Foreign key to `Question.id` |
| `grammarScore` | Int? | — | Grammar score (0–100) |
| `confidenceScore` | Int? | — | Confidence score (0–100) |
| `communicationScore` | Int? | — | Communication score (0–100) |
| `technicalScore` | Int? | — | Technical accuracy score (0–100) |
| `overallScore` | Int? | — | Aggregate response score |
| `starMethodScore` | Int? | — | STAR method score (0–100) |
| `keywordsFound` | String[] | — | Industry keywords detected |
| `keywordsMissing` | String[] | — | Industry keywords missing |
| `idealAnswer` | String? | — | Model answer text |
| `suggestions` | String[] | — | Improvement suggestions |
| `grammarIssues` | String[] | — | Identified grammar errors |
| `strengths` | String[] | — | Candidate response strengths |
| `weaknesses` | String[] | — | Areas requiring improvement |

---

### 9. `Analytic` (`analytics`)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id, @default(uuid())` | Primary Key |
| `userId` | String | — | Foreign key to `User.id` |
| `metric` | `AnalyticMetric` | — | Metric type |
| `value` | Float | — | Score value |
| `date` | DateTime | `@default(now())` | Observation date |
| `interviewId` | String? | — | Related interview ID |

**Indexes**: `@@index([userId, metric, date])`, `@@index([userId, date])`

---

## 🔄 Data Migration Workflow
- Schema defined in `backend/prisma/schema.prisma`.
- Synchronized to Neon PostgreSQL database using `npx prisma db push`.
- Database seeded using `npx prisma db seed` (invoking `backend/prisma/seed.ts`).
