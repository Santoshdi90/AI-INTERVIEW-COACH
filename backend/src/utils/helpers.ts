import { Response } from 'express';
import { env } from '../config/env';

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/auth',
  });
}

export function getRefreshTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry;
}

export function getPagination(page = 1, limit = 10): { skip: number; take: number } {
  const take = Math.min(Math.max(1, limit), 100);
  const skip = (Math.max(1, page) - 1) * take;
  return { skip, take };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): { page: number; limit: number; total: number; totalPages: number } {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
  const { passwordHash, ...safe } = user;
  void passwordHash;
  return safe;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
