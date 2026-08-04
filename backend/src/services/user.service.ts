import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { skillRepository, analyticsRepository } from '../repositories/analytics.repository';
import { interviewRepository } from '../repositories/interview.repository';
import { resumeRepository } from '../repositories/resume.repository';
import { sessionRepository } from '../repositories/session.repository';
import { storageService } from './storage.service';
import { AppError } from '../middleware/errorHandler';
import { sanitizeUser } from '../utils/helpers';
import { logger } from '../config/logger';
import fs from 'fs';

const SALT_ROUNDS = 12;

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return sanitizeUser(user as unknown as Record<string, unknown>);
  },

  async updateProfile(userId: string, data: {
    name?: string;
    education?: string;
    experience?: string;
    targetCompany?: string;
    targetRole?: string;
    phone?: string;
    bio?: string;
  }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const updated = await userRepository.update(userId, data);
    logger.info(`Profile updated for userId: ${userId}`);
    return sanitizeUser(updated as unknown as Record<string, unknown>);
  },

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const result = await storageService.uploadAvatar(file.path, userId);
    try { fs.unlinkSync(file.path); } catch { /* ignore */ }
    const updated = await userRepository.update(userId, { avatar: result.url });
    return sanitizeUser(updated as unknown as Record<string, unknown>);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (!user.passwordHash) throw new AppError('Password change not available for OAuth accounts', 400);

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(userId, { passwordHash: newHash });
    await sessionRepository.deleteAllForUser(userId);
    logger.info(`Password changed for userId: ${userId}`);
  },

  async deleteAccount(userId: string) {
    await userRepository.softDelete(userId);
    await sessionRepository.deleteAllForUser(userId);
    logger.info(`Account deleted for userId: ${userId}`);
  },

  async getDashboardStats(userId: string) {
    const [
      totalInterviews,
      avgScore,
      activeResume,
      skills,
      recentInterviews,
    ] = await Promise.all([
      interviewRepository.countByUserId(userId),
      interviewRepository.getAverageScore(userId),
      resumeRepository.findActiveByUserId(userId),
      skillRepository.findByUserId(userId),
      interviewRepository.findByUserId(userId, { take: 5 }),
    ]);

    const completedInterviews = await interviewRepository.findByUserId(userId, {
      take: 1000,
      status: 'COMPLETED',
    });

    const topSkills = skills.slice(0, 8);
    const weakSkills = [...skills].sort((a, b) => a.proficiency - b.proficiency).slice(0, 4);
    const strongSkills = [...skills].sort((a, b) => b.proficiency - a.proficiency).slice(0, 4);

    return {
      totalInterviews,
      completedInterviews: completedInterviews.total,
      averageScore: avgScore ? Math.round(avgScore) : 0,
      resumeScore: activeResume?.overallScore || 0,
      atsScore: activeResume?.atsScore || 0,
      skills: topSkills,
      weakSkills,
      strongSkills,
      recentInterviews: recentInterviews.interviews,
      activeResume,
    };
  },

  async getSkills(userId: string) {
    return skillRepository.findByUserId(userId);
  },

  async addSkill(userId: string, name: string, proficiency: number) {
    return skillRepository.upsert(userId, name, proficiency, 'MANUAL');
  },

  async deleteSkill(id: string, userId: string) {
    const skills = await skillRepository.findByUserId(userId);
    const skill = skills.find(s => s.id === id);
    if (!skill) throw new AppError('Skill not found', 404);
    if (skill.userId !== userId) throw new AppError('Access denied', 403);
    await skillRepository.delete(id);
  },
};

export const analyticsService = {
  async getAnalytics(userId: string) {
    const [
      weeklyData,
      monthlyData,
      metricAverages,
      skills,
      allAnalytics,
    ] = await Promise.all([
      analyticsRepository.getWeeklyAverages(userId),
      analyticsRepository.getMonthlyAverages(userId),
      analyticsRepository.getMetricAverages(userId),
      skillRepository.findByUserId(userId),
      analyticsRepository.findByUserId(userId, undefined, 90),
    ]);

    const totalInterviews = await interviewRepository.countByUserId(userId);
    const completedInterviews = await interviewRepository.findByUserId(userId, {
      take: 1000, status: 'COMPLETED'
    });

    const successRate = totalInterviews > 0
      ? Math.round((completedInterviews.total / totalInterviews) * 100)
      : 0;

    const skillRadarData = skills.slice(0, 8).map(s => ({
      skill: s.name,
      score: s.proficiency,
    }));

    // Interview type distribution
    const interviews = await interviewRepository.findByUserId(userId, { take: 100 });
    const typeCounts: Record<string, number> = {};
    for (const interview of interviews.interviews) {
      typeCounts[interview.type] = (typeCounts[interview.type] || 0) + 1;
    }
    const typeDistribution = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    return {
      weeklyProgress: weeklyData,
      monthlyProgress: monthlyData,
      metricAverages,
      skillRadar: skillRadarData,
      skills: {
        all: skills,
        weak: [...skills].sort((a, b) => a.proficiency - b.proficiency).slice(0, 5),
        strong: [...skills].sort((a, b) => b.proficiency - a.proficiency).slice(0, 5),
      },
      summary: {
        totalInterviews,
        completedInterviews: completedInterviews.total,
        successRate,
        averageScore: metricAverages['INTERVIEW_SCORE'] || 0,
        grammarScore: metricAverages['GRAMMAR_SCORE'] || 0,
        technicalScore: metricAverages['TECHNICAL_SCORE'] || 0,
        confidenceScore: metricAverages['CONFIDENCE_SCORE'] || 0,
        communicationScore: metricAverages['COMMUNICATION_SCORE'] || 0,
      },
      typeDistribution,
      recentActivity: allAnalytics.slice(-30),
    };
  },
};

export const adminService = {
  async getStats() {
    const [totalUsers, totalInterviews] = await Promise.all([
      userRepository.countAll(),
      interviewRepository.countAll(),
    ]);
    return { totalUsers, totalInterviews };
  },

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const { users, total } = await userRepository.findAll({ skip, take: limit, search });
    return {
      users: users.map(u => sanitizeUser(u as unknown as Record<string, unknown>)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async deleteUser(adminId: string, targetId: string) {
    if (adminId === targetId) throw new AppError('Cannot delete your own account via admin panel', 400);
    const user = await userRepository.findById(targetId);
    if (!user) throw new AppError('User not found', 404);
    await userRepository.softDelete(targetId);
    logger.info(`Admin ${adminId} deleted user ${targetId}`);
  },
};
