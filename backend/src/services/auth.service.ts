import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/user.repository';
import {
  sessionRepository,
  verificationTokenRepository,
  passwordResetRepository,
} from '../repositories/session.repository';
import { emailService } from './email.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { setRefreshTokenCookie, clearRefreshTokenCookie, sanitizeUser } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { Response } from 'express';
import { logger } from '../config/logger';

const SALT_ROUNDS = 12;

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('An account with this email already exists', 409);

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const isVerified = !env.REQUIRE_EMAIL_VERIFICATION;

    const user = await userRepository.create({
      email: data.email.toLowerCase().trim(),
      passwordHash,
      name: data.name.trim(),
      isVerified,
    });

    if (env.REQUIRE_EMAIL_VERIFICATION) {
      const token = uuidv4();
      await verificationTokenRepository.create(user.id, token);
      await emailService.sendVerificationEmail(user.email, user.name, token, env.FRONTEND_URL);
    }

    logger.info(`New user registered: ${user.email} (verified: ${isVerified})`);
    return sanitizeUser(user as unknown as Record<string, unknown>);
  },

  async login(data: { email: string; password: string }, res: Response, userAgent?: string, ip?: string) {
    const user = await userRepository.findByEmail(data.email.toLowerCase().trim());
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.deletedAt) throw new AppError('Account has been deleted', 401);
    if (user.isGoogleAuth && !user.passwordHash) {
      throw new AppError('This account uses Google login. Please sign in with Google.', 401);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash || '');
    if (!isValidPassword) throw new AppError('Invalid email or password', 401);

    if (env.REQUIRE_EMAIL_VERIFICATION && !user.isVerified) {
      throw new AppError('Please verify your email address before logging in', 403);
    }

    const tokenPayload = { sub: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN', name: user.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await sessionRepository.create({ userId: user.id, refreshToken, userAgent, ipAddress: ip });
    setRefreshTokenCookie(res, refreshToken);

    logger.info(`User logged in: ${user.email}`);
    return { accessToken, user: sanitizeUser(user as unknown as Record<string, unknown>) };
  },

  async refreshToken(token: string, res: Response) {
    if (!token) throw new AppError('Refresh token not provided', 401);

    const session = await sessionRepository.findByToken(token);
    if (!session) throw new AppError('Invalid or expired session', 401);

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      await sessionRepository.deleteByToken(token);
      clearRefreshTokenCookie(res);
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) throw new AppError('User not found', 401);

    const tokenPayload = { sub: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN', name: user.name };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await sessionRepository.deleteByToken(token);
    await sessionRepository.create({
      userId: user.id,
      refreshToken: newRefreshToken,
      userAgent: session.userAgent || undefined,
      ipAddress: session.ipAddress || undefined,
    });

    setRefreshTokenCookie(res, newRefreshToken);
    return { accessToken: newAccessToken };
  },

  async logout(token: string, res: Response) {
    if (token) {
      await sessionRepository.deleteByToken(token);
    }
    clearRefreshTokenCookie(res);
  },

  async verifyEmail(token: string) {
    const record = await verificationTokenRepository.findByToken(token);
    if (!record) throw new AppError('Invalid or expired verification token', 400);

    const user = await userRepository.findById(record.userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.isVerified) throw new AppError('Email is already verified', 400);

    await userRepository.update(user.id, { isVerified: true });
    await verificationTokenRepository.deleteByUserId(user.id);
    await emailService.sendWelcomeEmail(user.email, user.name);

    logger.info(`Email verified for user: ${user.email}`);
    return sanitizeUser(user as unknown as Record<string, unknown>);
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) return; // Silent fail for security

    const token = uuidv4();
    await passwordResetRepository.create(user.id, token);
    await emailService.sendPasswordResetEmail(user.email, user.name, token, env.FRONTEND_URL);
    logger.info(`Password reset email sent to: ${user.email}`);
  },

  async resetPassword(token: string, newPassword: string) {
    const record = await passwordResetRepository.findByToken(token);
    if (!record) throw new AppError('Invalid or expired reset token', 400);

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(record.userId, { passwordHash });
    await passwordResetRepository.markUsed(record.id);
    await sessionRepository.deleteAllForUser(record.userId);
    logger.info(`Password reset successfully for userId: ${record.userId}`);
  },

  async googleLogin(googleUser: {
    email: string;
    name: string;
    googleId: string;
    avatar?: string;
  }, res: Response, userAgent?: string, ip?: string) {
    let user = await userRepository.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await userRepository.findByEmail(googleUser.email);
      if (user) {
        user = await userRepository.update(user.id, {
          googleId: googleUser.googleId,
          isGoogleAuth: true,
          isVerified: true,
          avatar: googleUser.avatar || user.avatar,
        });
      } else {
        user = await userRepository.create({
          email: googleUser.email.toLowerCase(),
          name: googleUser.name,
          googleId: googleUser.googleId,
          isGoogleAuth: true,
          isVerified: true,
          avatar: googleUser.avatar,
        });
      }
    }

    const tokenPayload = { sub: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN', name: user.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await sessionRepository.create({ userId: user.id, refreshToken, userAgent, ipAddress: ip });
    setRefreshTokenCookie(res, refreshToken);

    logger.info(`Google login: ${user.email}`);
    return { accessToken, user: sanitizeUser(user as unknown as Record<string, unknown>) };
  },

  // Mock Google OAuth — returns a demo user
  async mockGoogleLogin(res: Response) {
    const mockGoogleUser = {
      email: 'demo.google@aiinterviewcoach.com',
      name: 'Google Demo User',
      googleId: 'mock_google_id_demo_12345',
      avatar: 'https://ui-avatars.com/api/?name=Google+Demo&background=4285F4&color=fff',
    };
    return this.googleLogin(mockGoogleUser, res, 'MockBrowser/1.0', '127.0.0.1');
  },
};
