import { Resume, Prisma } from '@prisma/client';
import prisma from '../config/database';

export const resumeRepository = {
  async create(data: Prisma.ResumeCreateInput): Promise<Resume> {
    return prisma.resume.create({ data });
  },

  async findById(id: string): Promise<Resume | null> {
    return prisma.resume.findUnique({ where: { id } });
  },

  async findByUserId(userId: string): Promise<Resume[]> {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findActiveByUserId(userId: string): Promise<Resume | null> {
    return prisma.resume.findFirst({ where: { userId, isActive: true } });
  },

  async update(id: string, data: Prisma.ResumeUpdateInput): Promise<Resume> {
    return prisma.resume.update({ where: { id }, data });
  },

  async setActive(id: string, userId: string): Promise<void> {
    await prisma.$transaction([
      prisma.resume.updateMany({ where: { userId }, data: { isActive: false } }),
      prisma.resume.update({ where: { id }, data: { isActive: true } }),
    ]);
  },

  async delete(id: string): Promise<void> {
    await prisma.resume.delete({ where: { id } });
  },

  async countByUserId(userId: string): Promise<number> {
    return prisma.resume.count({ where: { userId } });
  },
};
