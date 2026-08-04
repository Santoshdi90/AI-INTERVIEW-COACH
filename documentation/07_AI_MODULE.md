# 07. AI Module & Prompting Architecture

## Overview
The AI engine (`backend/src/services/ai.service.ts`) orchestrates intelligent interview question generation, response evaluation, and resume ATS analysis.

- **Primary Provider**: OpenAI API (Model: `gpt-4-turbo-preview` / `gpt-4`).
- **Resilience Layer**: Automatic fallback to `mockAIService` if `USE_MOCK_AI=true` or if API limits / network errors occur.

---

## 🤖 AI Features & Prompt Engineering

### 1. Interview Question Generation
**Function**: `generateInterviewQuestions(type, difficulty, count, customTopic?)`

#### Prompt Architecture:
```text
You are an expert technical interviewer. Generate exactly {count} interview questions.

Interview category: {type}
Difficulty level: {difficulty}
{Topic context if custom topic provided}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "text": "The interview question text",
      "category": "{type}",
      "hints": ["hint1", "hint2"],
      "expectedTime": <integer seconds>
    }
  ]
}

Rules:
- Questions must be appropriate for the {difficulty} difficulty level
- Each question should have exactly 2 practical hints
- expectedTime: EASY=90, MEDIUM=150, HARD=240 seconds
- Return ONLY valid JSON, no extra text
```

#### Output Processing:
- Response parsed via `parseGPTJson<QuestionGenerationResult>()`.
- Saved into PostgreSQL `questions` table with `hints` array.

---

### 2. Candidate Answer Evaluation
**Function**: `analyzeAnswer(question, answer, type)`

#### Prompt Architecture:
```text
You are an expert interview evaluator. Analyze the following interview answer.

Interview Type: {type}
Question: "{question}"
Candidate's Answer: "{answer}"

Evaluate the answer and return a JSON object with this exact structure:
{
  "grammarScore": <0-100>,
  "confidenceScore": <0-100>,
  "communicationScore": <0-100>,
  "technicalScore": <0-100>,
  "overallScore": <0-100>,
  "starMethodScore": <0-100>,
  "keywordsFound": ["keyword1", "keyword2"],
  "keywordsMissing": ["keyword1", "keyword2"],
  "idealAnswer": "A comprehensive model answer...",
  "suggestions": ["suggestion1", "suggestion2"],
  "grammarIssues": ["issue1"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Return ONLY valid JSON, no extra text.
```

#### Storage & Aggregation:
- Saved into `feedback` table.
- Overall score updates `Interview.overallScore`.
- Metric points recorded in `analytics` table for progress charting.

---

### 3. Resume ATS Analysis
**Function**: `analyzeResume(resumeText)`

#### Prompt Architecture:
```text
You are an expert resume reviewer and ATS specialist. Analyze the following resume text:

"""
{resumeText}
"""

Return a JSON object with this exact structure:
{
  "overallScore": <0-100>,
  "atsScore": <0-100>,
  "skills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "suggestions": ["suggestion1"],
  "experience": "Experience summary",
  "education": "Education summary",
  "summary": "Brief assessment",
  "keywordDensity": <0-100>,
  "formattingScore": <0-100>,
  "readabilityScore": <0-100>
}
```

#### Storage:
- Saved to `resumes` table (`analysisJson` JSONB column, `overallScore`, `atsScore`).
- Extracted skills auto-seeded to `skills` table with source `'RESUME'`.

---

## ⚙️ Fallback Mechanism
```typescript
try {
  return await generateQuestionsProduction(type, difficulty, count, customTopic);
} catch (error) {
  logger.error('[AI] OpenAI generation failed, falling back to mock:', error);
  return mockAIService.generateInterviewQuestions(type, difficulty, count, customTopic);
}
```
Ensures zero candidate downtime even during OpenAI outages or API quota depletion.
