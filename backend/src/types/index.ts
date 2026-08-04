import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FileUploadResult {
  url: string;
  publicId: string;
  format?: string;
  size?: number;
}

export interface ResumeAnalysis {
  overallScore: number;
  atsScore: number;
  skills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  experience: string;
  education: string;
  summary: string;
  keywordDensity: number;
  formattingScore: number;
  readabilityScore: number;
}

export interface AIFeedbackResult {
  grammarScore: number;
  confidenceScore: number;
  communicationScore: number;
  technicalScore: number;
  overallScore: number;
  starMethodScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  idealAnswer: string;
  suggestions: string[];
  grammarIssues: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface QuestionGenerationResult {
  questions: Array<{
    text: string;
    category: string;
    hints: string[];
    expectedTime: number;
  }>;
}

export type InterviewType =
  | 'HR'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'SYSTEM_DESIGN'
  | 'FRONTEND'
  | 'BACKEND'
  | 'JAVA'
  | 'JAVASCRIPT'
  | 'REACT'
  | 'NODE'
  | 'DATABASE'
  | 'OS'
  | 'COMPUTER_NETWORKS'
  | 'DBMS'
  | 'OOPS'
  | 'CUSTOM';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type InterviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type SkillSource = 'MANUAL' | 'RESUME' | 'INTERVIEW';
export type AnalyticMetric =
  | 'INTERVIEW_SCORE'
  | 'GRAMMAR_SCORE'
  | 'CONFIDENCE_SCORE'
  | 'TECHNICAL_SCORE'
  | 'COMMUNICATION_SCORE';

