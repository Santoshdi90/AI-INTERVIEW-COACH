import { sanitizeUser, getPagination, buildPaginationMeta, generateOTP } from '../utils/helpers';

// ─── Auth Helper Tests ──────────────────────────────────────
describe('Auth Helpers', () => {
  describe('sanitizeUser', () => {
    it('should remove passwordHash from user object', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: '$2a$12$hashedpassword',
        role: 'USER',
      };

      const result = sanitizeUser(user);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('name', 'Test User');
      expect(result).toHaveProperty('role', 'USER');
    });

    it('should handle user without passwordHash', () => {
      const user = {
        id: '2',
        email: 'google@example.com',
        name: 'Google User',
        role: 'USER',
      };

      const result = sanitizeUser(user);
      expect(result).toHaveProperty('email', 'google@example.com');
    });
  });

  describe('getPagination', () => {
    it('should return default pagination', () => {
      const result = getPagination();
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('should calculate correct skip for page 2', () => {
      const result = getPagination(2, 10);
      expect(result).toEqual({ skip: 10, take: 10 });
    });

    it('should cap limit at 100', () => {
      const result = getPagination(1, 200);
      expect(result).toEqual({ skip: 0, take: 100 });
    });

    it('should handle negative page number', () => {
      const result = getPagination(-1, 10);
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('should handle negative limit', () => {
      const result = getPagination(1, -5);
      expect(result).toEqual({ skip: 0, take: 1 });
    });
  });

  describe('buildPaginationMeta', () => {
    it('should build correct meta for a typical query', () => {
      const result = buildPaginationMeta(100, 2, 10);
      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 100,
        totalPages: 10,
      });
    });

    it('should handle zero total', () => {
      const result = buildPaginationMeta(0, 1, 10);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('should calculate totalPages correctly with remainder', () => {
      const result = buildPaginationMeta(25, 1, 10);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit string', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different OTPs', () => {
      const otps = new Set(Array.from({ length: 20 }, () => generateOTP()));
      expect(otps.size).toBeGreaterThan(1);
    });
  });
});

// ─── JWT Utils Tests ────────────────────────────────────────
describe('JWT Utils', () => {
  // These tests require env to be configured
  // In CI/CD they would need proper JWT_ACCESS_SECRET and JWT_REFRESH_SECRET

  it('should exist as a module', () => {
    expect(() => require('../utils/jwt.utils')).not.toThrow();
  });
});
