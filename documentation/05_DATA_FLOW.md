# 05. Data Flow

This document details the step-by-step data execution path across the full stack for primary user workflows.

---

## 1. Candidate Registration & Login Flow

```
[Candidate]                [Frontend React]                   [Backend Express]                   [PostgreSQL DB]
     |                            |                                   |                                   |
     |-- Fill Email/Password ---->|                                   |                                   |
     |                            |-- POST /api/auth/register ------->|                                   |
     |                            |   { email, password, name }       |-- Hash password (bcrypt) -------->|
     |                            |                                   |-- INSERT INTO users ------------->|
     |                            |                                   |   (isVerified: true)              |
     |                            |<-- 201 Created { user } ----------|                                   |
     |                            |                                   |                                   |
     |-- Enter Credentials ------>|                                   |                                   |
     |                            |-- POST /api/auth/login ---------->|                                   |
     |                            |   { email, password }             |-- SELECT FROM users WHERE email ->|
     |                            |                                   |-- Compare bcrypt hash            |
     |                            |                                   |-- Generate JWT Access & Refresh   |
     |                            |                                   |-- INSERT INTO sessions ---------->|
     |                            |<-- Set-Cookie: refreshToken       |                                   |
     |                            |<-- 200 OK { accessToken, user }---|                                   |
     |                            |                                   |                                   |
     |                            |-- Store accessToken in localStorage|                                  |
     |                            |-- Redirect to /dashboard          |                                   |
```

---

## 2. Resume Upload & AI Analysis Flow

```
[Candidate]                [Frontend React]                   [Backend Express]               [OpenAI API / DB]
     |                            |                                   |                               |
     |-- Select PDF Resume ------->|                                   |                               |
     |                            |-- POST /api/resumes (FormData) -->|                               |
     |                            |   Headers: Authorization Bearer   |-- Auth Middleware (Verify JWT)|
     |                            |                                   |-- Multer saves file to temp   |
     |                            |                                   |-- Parse PDF text (pdf-parse)  |
     |                            |                                   |-- Upload to storage (local/S3)|
     |                            |                                   |-- Send prompt to OpenAI GPT-4->|
     |                            |                                   |<-- Return JSON ATS evaluation |
     |                            |                                   |-- Save Resume (JSONB) to DB ->|
     |                            |                                   |-- Upsert extracted skills --->|
     |                            |<-- 201 Created { resume, analysis}|                               |
     |                            |                                   |                               |
     |-- View ATS Score & Skills -|                                   |                               |
```

---

## 3. Mock Interview Session & Real-Time AI Feedback Flow

```
[Candidate]                [Frontend React]                   [Backend Express]               [OpenAI API / DB]
     |                            |                                   |                               |
     |-- Select Type & Difficulty>|                                   |                               |
     |                            |-- POST /api/interviews ---------->|                               |
     |                            |   { type, difficulty, total }     |-- Create Interview (PENDING)->|
     |                            |                                   |-- Request Questions (GPT-4)-->|
     |                            |                                   |<-- Return JSON Questions -----|
     |                            |                                   |-- INSERT INTO questions ----->|
     |                            |<-- 201 Created { interview, Qs }--|                               |
     |                            |                                   |                               |
     |-- Click "Start Interview" ->|-- POST /api/interviews/:id/start ->|-- Set status IN_PROGRESS ---->|
     |                            |                                   |                               |
     |-- Question Readout (Voice) | (Web SpeechSynthesis)             |                               |
     |-- Speak / Type Answer ---->| (Web SpeechRecognition / Text)    |                               |
     |-- Submit Answer ----------->|-- POST /api/interviews/:id/answer->|                               |
     |                            |   { questionId, transcript }      |-- Upsert Answer to DB -------->|
     |                            |                                   |-- Request Evaluation (GPT-4)->|
     |                            |                                   |<-- Return Feedback JSON ------|
     |                            |                                   |-- Upsert Feedback to DB ----->|
     |                            |                                   |-- Increment currentQuestion ->|
     |                            |<-- 200 OK { answer, feedback }----|                               |
     |                            |                                   |                               |
     |-- Display Feedback Breakdown (STAR Method, Technical, Ideal Answer)                            |
```

---

## 4. Interview Session Completion & Analytics Aggregation

```
[Candidate]                [Frontend React]                   [Backend Express]               [PostgreSQL DB]
     |                            |                                   |                               |
     |-- Complete Last Question ->|-- POST /api/interviews/:id/complete->|                             |
     |                            |                                   |-- Fetch all session feedback -|
     |                            |                                   |-- Compute overall score avg   |
     |                            |                                   |-- Set status COMPLETED ------>|
     |                            |                                   |-- Record analytics points --->|
     |                            |<-- 200 OK { interview }-----------|                               |
     |                            |                                   |                               |
     |-- Navigate to /analytics ->|-- GET /api/analytics ------------>|                               |
     |                            |                                   |-- Query analytics time-series-|
     |                            |<-- 200 OK { timeSeries, skills }--|                               |
     |                            |                                   |                               |
     |-- Render Recharts Line Chart & Skill Proficiency Radar Chart                                   |
```
