import { Session, VerificationToken, PasswordReset } from '@prisma/client';
import prisma from '../config/database';
import { getRefreshTokenExpiry } from '../utils/helpers';

export const sessionRepository = {
  async create(data: {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session> {
    return prisma.session.create({
      data: {
        ...data,
        expiresAt: getRefreshTokenExpiry(),
      },
    });
  },

  async findByToken(token: string): Promise<Session | null> {
    return prisma.session.findFirst({
      where: { refreshToken: token, expiresAt: { gt: new Date() } },
    });
  },

  async deleteByToken(token: string): Promise<void> {
    await prisma.session.deleteMany({ where: { refreshToken: token } });
  },

  async deleteAllForUser(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  },

  async deleteExpired(): Promise<void> {
    await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  },
};

export const verificationTokenRepository = {
  async create(userId: string, token: string): Promise<VerificationToken> {
    await prisma.verificationToken.deleteMany({ where: { userId } });
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return prisma.verificationToken.create({ data: { userId, token, expiresAt } });
  },

  async findByToken(token: string): Promise<VerificationToken | null> {
    return prisma.verificationToken.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
    });
  },

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.verificationToken.deleteMany({ where: { userId } });
  },
};

export const passwordResetRepository = {
  async create(userId: string, token: string): Promise<PasswordReset> {
    await prisma.passwordReset.deleteMany({ where: { userId } });
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    return prisma.passwordReset.create({ data: { userId, token, expiresAt } });
  },

  async findByToken(token: string): Promise<PasswordReset | null> {
    return prisma.passwordReset.findFirst({
      where: { token, expiresAt: { gt: new Date() }, usedAt: null },
    });
  },

  async markUsed(id: string): Promise<void> {
    await prisma.passwordReset.update({ where: { id }, data: { usedAt: new Date() } });
  },
};
