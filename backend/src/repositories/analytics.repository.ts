import { Analytic, Skill, Prisma } from '@prisma/client';
import { AnalyticMetric } from '../types';
import prisma from '../config/database';

export const analyticsRepository = {
  async record(data: {
    userId: string;
    metric: AnalyticMetric;
    value: number;
    interviewId?: string;
  }): Promise<Analytic> {
    return prisma.analytic.create({ data });
  },

  async findByUserId(userId: string, metric?: AnalyticMetric, days = 30): Promise<Analytic[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return prisma.analytic.findMany({
      where: {
        userId,
        date: { gte: since },
        ...(metric && { metric }),
      },
      orderBy: { date: 'asc' },
    });
  },

  async getWeeklyAverages(userId: string): Promise<Array<{ week: string; avg: number }>> {
    const records = await prisma.analytic.findMany({
      where: { userId, metric: 'INTERVIEW_SCORE' },
      orderBy: { date: 'asc' },
    });

    const weeklyGroups: Record<string, { sum: number; count: number }> = {};
    for (const record of records) {
      const d = new Date(record.date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const weekStr = monday.toISOString().split('T')[0];

      if (!weeklyGroups[weekStr]) {
        weeklyGroups[weekStr] = { sum: 0, count: 0 };
      }
      weeklyGroups[weekStr].sum += record.value;
      weeklyGroups[weekStr].count += 1;
    }

    return Object.entries(weeklyGroups).map(([week, data]) => ({
      week,
      avg: Math.round((data.sum / data.count) * 10) / 10,
    })).slice(-12);
  },

  async getMonthlyAverages(userId: string): Promise<Array<{ month: string; avg: number }>> {
    const records = await prisma.analytic.findMany({
      where: { userId, metric: 'INTERVIEW_SCORE' },
      orderBy: { date: 'asc' },
    });

    const monthlyGroups: Record<string, { sum: number; count: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (const record of records) {
      const d = new Date(record.date);
      const monthStr = `${months[d.getMonth()]} ${d.getFullYear()}`;

      if (!monthlyGroups[monthStr]) {
        monthlyGroups[monthStr] = { sum: 0, count: 0 };
      }
      monthlyGroups[monthStr].sum += record.value;
      monthlyGroups[monthStr].count += 1;
    }

    return Object.entries(monthlyGroups).map(([month, data]) => ({
      month,
      avg: Math.round((data.sum / data.count) * 10) / 10,
    })).slice(-12);
  },

  async getMetricAverages(userId: string): Promise<Record<string, number>> {
    const results = await prisma.analytic.groupBy({
      by: ['metric'],
      where: { userId },
      _avg: { value: true },
    });

    return results.reduce((acc, r) => {
      acc[r.metric] = Math.round(r._avg.value || 0);
      return acc;
    }, {} as Record<string, number>);
  },
};

export const skillRepository = {
  async upsert(userId: string, name: string, proficiency: number, source: Prisma.SkillCreateInput['source']): Promise<Skill> {
    return prisma.skill.upsert({
      where: { userId_name: { userId, name } },
      create: { userId, name, proficiency, source },
      update: { proficiency, source },
    });
  },

  async findByUserId(userId: string): Promise<Skill[]> {
    return prisma.skill.findMany({ where: { userId }, orderBy: { proficiency: 'desc' } });
  },

  async delete(id: string): Promise<void> {
    await prisma.skill.delete({ where: { id } });
  },

  async upsertMany(userId: string, skills: string[], source: Prisma.SkillCreateInput['source']): Promise<void> {
    for (const name of skills) {
      await this.upsert(userId, name, 50, source);
    }
  },
};
