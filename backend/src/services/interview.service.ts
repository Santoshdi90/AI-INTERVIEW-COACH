import { InterviewType, Difficulty } from '../types';
import {
  interviewRepository,
  questionRepository,
  answerRepository,
  feedbackRepository,
} from '../repositories/interview.repository';
import { analyticsRepository } from '../repositories/analytics.repository';
import { aiService } from './ai.service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

export const interviewService = {
  async createInterview(userId: string, data: {
    type: InterviewType;
    difficulty: Difficulty;
    totalQuestions: number;
    customTopic?: string;
    title?: string;
  }) {
    logger.info(`Creating ${data.type} interview for userId: ${userId}`);

    const typeLabels: Record<string, string> = {
      HR: 'HR Interview', TECHNICAL: 'Technical Interview', BEHAVIORAL: 'Behavioral Interview',
      SYSTEM_DESIGN: 'System Design Interview', FRONTEND: 'Frontend Interview',
      BACKEND: 'Backend Interview', JAVA: 'Java Interview', JAVASCRIPT: 'JavaScript Interview',
      REACT: 'React Interview', NODE: 'Node.js Interview', DATABASE: 'Database Interview',
      OS: 'Operating Systems Interview', COMPUTER_NETWORKS: 'Computer Networks Interview',
      DBMS: 'DBMS Interview', OOPS: 'OOP Interview', CUSTOM: 'Custom Interview',
    };

    const interview = await interviewRepository.create({
      user: { connect: { id: userId } },
      title: data.title || typeLabels[data.type] || 'Interview',
      type: data.type,
      difficulty: data.difficulty,
      totalQuestions: data.totalQuestions,
      customTopic: data.customTopic,
      status: 'PENDING',
    });

    // Generate questions
    const { questions } = await aiService.generateInterviewQuestions(
      data.type,
      data.difficulty,
      data.totalQuestions,
      data.customTopic
    );

    await questionRepository.createMany(
      questions.map((q, i) => ({
        interviewId: interview.id,
        text: q.text,
        category: q.category,
        orderIndex: i,
        expectedTime: q.expectedTime,
        hints: q.hints as any,
      }))
    );

    return interviewRepository.findByIdWithDetails(interview.id);
  },

  async startInterview(id: string, userId: string) {
    const interview = await interviewRepository.findById(id);
    if (!interview) throw new AppError('Interview not found', 404);
    if (interview.userId !== userId) throw new AppError('Access denied', 403);
    if (interview.status !== 'PENDING') throw new AppError('Interview already started or completed', 400);

    return interviewRepository.update(id, {
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      currentQuestion: 0,
    });
  },

  async submitAnswer(data: {
    interviewId: string;
    questionId: string;
    userId: string;
    transcript: string;
    duration?: number;
  }) {
    const interview = await interviewRepository.findById(data.interviewId);
    if (!interview) throw new AppError('Interview not found', 404);
    if (interview.userId !== data.userId) throw new AppError('Access denied', 403);
    if (interview.status !== 'IN_PROGRESS') throw new AppError('Interview is not active', 400);

    const question = await questionRepository.findById(data.questionId);
    if (!question) throw new AppError('Question not found', 404);

    const wordCount = data.transcript.trim().split(/\s+/).length;

    const answer = await answerRepository.upsert(data.questionId, data.userId, {
      transcript: data.transcript,
      duration: data.duration,
      wordCount,
    });

    // Generate AI feedback immediately
    const feedbackResult = await aiService.analyzeAnswer(
      question.text,
      data.transcript,
      interview.type
    );

    const feedback = await feedbackRepository.upsert(data.questionId, {
      question: { connect: { id: data.questionId } },
      grammarScore: feedbackResult.grammarScore,
      confidenceScore: feedbackResult.confidenceScore,
      communicationScore: feedbackResult.communicationScore,
      technicalScore: feedbackResult.technicalScore,
      overallScore: feedbackResult.overallScore,
      starMethodScore: feedbackResult.starMethodScore,
      keywordsFound: feedbackResult.keywordsFound as any,
      keywordsMissing: feedbackResult.keywordsMissing as any,
      idealAnswer: feedbackResult.idealAnswer,
      suggestions: feedbackResult.suggestions as any,
      grammarIssues: feedbackResult.grammarIssues as any,
      strengths: feedbackResult.strengths as any,
      weaknesses: feedbackResult.weaknesses as any,
    });

    // Advance question index
    await interviewRepository.update(data.interviewId, {
      currentQuestion: question.orderIndex + 1,
    });

    return { answer, feedback };
  },

  async completeInterview(id: string, userId: string) {
    const interview = await interviewRepository.findByIdWithDetails(id);
    if (!interview) throw new AppError('Interview not found', 404);
    if (interview.userId !== userId) throw new AppError('Access denied', 403);
    if (interview.status === 'COMPLETED') throw new AppError('Interview already completed', 400);

    const feedbacks = await feedbackRepository.findByInterviewId(id);

    const startedAt = interview.startedAt || new Date();
    const duration = Math.round((Date.now() - startedAt.getTime()) / 1000);

    let overallScore: number | null = null;
    if (feedbacks.length > 0) {
      const scores = feedbacks.map(f => f.overallScore || 0);
      overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    const updated = await interviewRepository.update(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
      duration,
      overallScore,
    });

    // Record analytics
    if (overallScore !== null) {
      await analyticsRepository.record({
        userId,
        metric: 'INTERVIEW_SCORE',
        value: overallScore,
        interviewId: id,
      });

      const avgFeedback = feedbacks.reduce((acc, f) => {
        acc.grammar += f.grammarScore || 0;
        acc.confidence += f.confidenceScore || 0;
        acc.technical += f.technicalScore || 0;
        acc.communication += f.communicationScore || 0;
        return acc;
      }, { grammar: 0, confidence: 0, technical: 0, communication: 0 });

      const count = feedbacks.length;
      await Promise.all([
        analyticsRepository.record({ userId, metric: 'GRAMMAR_SCORE', value: Math.round(avgFeedback.grammar / count), interviewId: id }),
        analyticsRepository.record({ userId, metric: 'CONFIDENCE_SCORE', value: Math.round(avgFeedback.confidence / count), interviewId: id }),
        analyticsRepository.record({ userId, metric: 'TECHNICAL_SCORE', value: Math.round(avgFeedback.technical / count), interviewId: id }),
        analyticsRepository.record({ userId, metric: 'COMMUNICATION_SCORE', value: Math.round(avgFeedback.communication / count), interviewId: id }),
      ]);
    }

    logger.info(`Interview completed: ${id}, score: ${overallScore}`);
    return { interview: updated, overallScore, feedbackCount: feedbacks.length };
  },

  async getInterviews(userId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    return interviewRepository.findByUserId(userId, {
      skip,
      take: limit,
      status: status as any,
    });
  },

  async getInterviewById(id: string, userId: string) {
    const interview = await interviewRepository.findByIdWithDetails(id);
    if (!interview) throw new AppError('Interview not found', 404);
    if (interview.userId !== userId) throw new AppError('Access denied', 403);
    return interview;
  },

  async deleteInterview(id: string, userId: string) {
    const interview = await interviewRepository.findById(id);
    if (!interview) throw new AppError('Interview not found', 404);
    if (interview.userId !== userId) throw new AppError('Access denied', 403);
    await interviewRepository.delete(id);
  },
};
