import { Interview, Question, Answer, Feedback, Prisma } from '@prisma/client';
import prisma from '../config/database';

export const interviewRepository = {
  async create(data: Prisma.InterviewCreateInput): Promise<Interview> {
    return prisma.interview.create({ data });
  },

  async findById(id: string): Promise<Interview | null> {
    return prisma.interview.findUnique({ where: { id } });
  },

  async findByIdWithDetails(id: string) {
    return prisma.interview.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            answer: true,
            feedback: true,
          },
        },
      },
    });
  },

  async findByUserId(
    userId: string,
    params: { skip?: number; take?: number; status?: string }
  ): Promise<{ interviews: Interview[]; total: number }> {
    const where: Prisma.InterviewWhereInput = {
      userId,
      ...(params.status && { status: params.status as any }),
    };
    const [interviews, total] = await prisma.$transaction([
      prisma.interview.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interview.count({ where }),
    ]);
    return { interviews, total };
  },

  async update(id: string, data: Prisma.InterviewUpdateInput): Promise<Interview> {
    return prisma.interview.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.interview.delete({ where: { id } });
  },

  async countByUserId(userId: string): Promise<number> {
    return prisma.interview.count({ where: { userId } });
  },

  async getAverageScore(userId: string): Promise<number | null> {
    const result = await prisma.interview.aggregate({
      where: { userId, status: 'COMPLETED', overallScore: { not: null } },
      _avg: { overallScore: true },
    });
    return result._avg.overallScore;
  },

  async countAll(): Promise<number> {
    return prisma.interview.count();
  },
};

export const questionRepository = {
  async createMany(questions: Prisma.QuestionCreateManyInput[]): Promise<void> {
    await prisma.question.createMany({ data: questions });
  },

  async findById(id: string): Promise<Question | null> {
    return prisma.question.findUnique({ where: { id } });
  },

  async findByInterviewId(interviewId: string): Promise<Question[]> {
    return prisma.question.findMany({
      where: { interviewId },
      orderBy: { orderIndex: 'asc' },
      include: { answer: true, feedback: true },
    });
  },
};

export const answerRepository = {
  async upsert(questionId: string, userId: string, data: {
    transcript?: string;
    duration?: number;
    wordCount?: number;
  }): Promise<Answer> {
    return prisma.answer.upsert({
      where: { questionId },
      create: { questionId, userId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  },

  async findByQuestionId(questionId: string): Promise<Answer | null> {
    return prisma.answer.findUnique({ where: { questionId } });
  },
};

export const feedbackRepository = {
  async upsert(questionId: string, data: Prisma.FeedbackCreateInput): Promise<Feedback> {
    return prisma.feedback.upsert({
      where: { questionId },
      create: data,
      update: data,
    });
  },

  async findByQuestionId(questionId: string): Promise<Feedback | null> {
    return prisma.feedback.findUnique({ where: { questionId } });
  },

  async findByInterviewId(interviewId: string): Promise<Feedback[]> {
    return prisma.feedback.findMany({
      where: { question: { interviewId } },
      include: { question: true },
    });
  },
};
