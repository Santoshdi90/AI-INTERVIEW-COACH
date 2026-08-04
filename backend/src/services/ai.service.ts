import OpenAI from 'openai';
import { env } from '../config/env';
import { mockAIService } from '../utils/mockAI.service';
import { logger } from '../config/logger';
import { AIFeedbackResult, QuestionGenerationResult, ResumeAnalysis } from '../types';

// ─── OpenAI Client (lazy-initialized) ───────────────────────
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// ─── Helper: Parse JSON from GPT response ───────────────────
function parseGPTJson<T>(content: string): T {
  // Strip markdown code fences if present
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

// ─── Production AI Implementations ──────────────────────────

async function generateQuestionsProduction(
  type: string,
  difficulty: string,
  count: number,
  customTopic?: string
): Promise<QuestionGenerationResult> {
  const topicContext = type === 'CUSTOM' && customTopic
    ? `The topic is: "${customTopic}".`
    : `The interview category is: ${type.replace(/_/g, ' ')}.`;

  const prompt = `You are an expert technical interviewer. Generate exactly ${count} interview questions.

${topicContext}
Difficulty level: ${difficulty}.

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "text": "The interview question text",
      "category": "${type}",
      "hints": ["hint1", "hint2"],
      "expectedTime": <seconds to answer, integer>
    }
  ]
}

Rules:
- Questions must be appropriate for the ${difficulty} difficulty level
- Each question should have exactly 2 practical hints
- expectedTime: EASY=90, MEDIUM=150, HARD=240 seconds (approximate)
- Questions should be diverse and progressively more challenging
- Return ONLY valid JSON, no extra text`;

  const response = await getOpenAI().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const result = parseGPTJson<QuestionGenerationResult>(content);
  logger.info(`[AI] Generated ${result.questions.length} ${type} questions via OpenAI`);
  return result;
}

async function analyzeAnswerProduction(
  question: string,
  answer: string,
  type: string
): Promise<AIFeedbackResult> {
  const prompt = `You are an expert interview evaluator. Analyze the following interview answer.

Interview Type: ${type.replace(/_/g, ' ')}
Question: "${question}"
Candidate's Answer: "${answer}"

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
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "grammarIssues": ["issue1"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Scoring guidelines:
- grammarScore: Evaluate grammar, sentence structure, and clarity
- confidenceScore: Evaluate assertiveness and specificity (vague/hedging = lower)
- communicationScore: Structure, flow, completeness of the answer
- technicalScore: Accuracy and depth of technical content
- overallScore: Weighted average of all scores
- starMethodScore: How well the STAR method (Situation, Task, Action, Result) is used
- keywordsFound: Industry-relevant keywords present in the answer
- keywordsMissing: Important keywords that should have been mentioned
- idealAnswer: Write a concise model answer (3-5 sentences)
- suggestions: 3-4 actionable improvement suggestions
- grammarIssues: List specific grammar problems (empty array if none)
- strengths: 2-3 notable strengths
- weaknesses: 2-3 areas for improvement

Return ONLY valid JSON, no extra text.`;

  const response = await getOpenAI().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const result = parseGPTJson<AIFeedbackResult>(content);
  logger.info(`[AI] Answer analyzed via OpenAI, score: ${result.overallScore}`);
  return result;
}

async function analyzeResumeProduction(resumeText: string): Promise<ResumeAnalysis> {
  const truncatedText = resumeText.substring(0, 6000);

  const prompt = `You are an expert resume reviewer and ATS (Applicant Tracking System) specialist. Analyze the following resume text.

Resume Content:
"""
${truncatedText}
"""

Return a JSON object with this exact structure:
{
  "overallScore": <0-100>,
  "atsScore": <0-100>,
  "skills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "experience": "Summary of experience level",
  "education": "Summary of education",
  "summary": "2-3 sentence professional assessment",
  "keywordDensity": <0-100>,
  "formattingScore": <0-100>,
  "readabilityScore": <0-100>
}

Scoring guidelines:
- overallScore: Overall resume quality (0-100)
- atsScore: How well this resume would perform in ATS screening (0-100)
- skills: List all technical and professional skills found
- missingSkills: Important industry skills that are absent
- strengths: 3-4 notable strengths of this resume
- weaknesses: 3-4 areas for improvement
- suggestions: 4-5 specific, actionable improvement recommendations
- experience: Estimated experience level from content
- education: Education summary or "Not found"
- summary: Brief professional assessment
- keywordDensity: Percentage of industry-relevant keywords (0-100)
- formattingScore: Quality of formatting/structure (0-100)
- readabilityScore: Ease of reading/scanning (0-100)

Return ONLY valid JSON, no extra text.`;

  const response = await getOpenAI().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const result = parseGPTJson<ResumeAnalysis>(content);
  logger.info(`[AI] Resume analyzed via OpenAI, score: ${result.overallScore}, ATS: ${result.atsScore}`);
  return result;
}

// ─── Unified AI Service ─────────────────────────────────────
// Delegates to mock or production based on USE_MOCK_AI flag
export const aiService = {
  async generateInterviewQuestions(
    type: string,
    difficulty: string,
    count: number,
    customTopic?: string
  ): Promise<QuestionGenerationResult> {
    if (env.USE_MOCK_AI) {
      return mockAIService.generateInterviewQuestions(type as any, difficulty as any, count, customTopic);
    }

    try {
      return await generateQuestionsProduction(type, difficulty, count, customTopic);
    } catch (error) {
      logger.error('[AI] OpenAI question generation failed, falling back to mock:', error);
      return mockAIService.generateInterviewQuestions(type as any, difficulty as any, count, customTopic);
    }
  },

  async analyzeAnswer(
    question: string,
    answer: string,
    type: string
  ): Promise<AIFeedbackResult> {
    if (env.USE_MOCK_AI) {
      return mockAIService.analyzeAnswer(question, answer, type as any);
    }

    try {
      return await analyzeAnswerProduction(question, answer, type);
    } catch (error) {
      logger.error('[AI] OpenAI answer analysis failed, falling back to mock:', error);
      return mockAIService.analyzeAnswer(question, answer, type as any);
    }
  },

  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    if (env.USE_MOCK_AI) {
      return mockAIService.analyzeResume(resumeText);
    }

    try {
      return await analyzeResumeProduction(resumeText);
    } catch (error) {
      logger.error('[AI] OpenAI resume analysis failed, falling back to mock:', error);
      return mockAIService.analyzeResume(resumeText);
    }
  },
};
