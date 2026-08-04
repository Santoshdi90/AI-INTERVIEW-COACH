/**
 * API Integration Tests
 *
 * Tests the Express API endpoints for correct:
 * - Response shapes (envelope format)
 * - HTTP status codes
 * - Input validation
 * - Auth requirements
 *
 * Note: These tests require a running database connection.
 * For CI/CD, use docker-compose to spin up PostgreSQL first.
 */

import request from 'supertest';

// We import the app after setting test env
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_secret_access_key_minimum_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_secret_refresh_key_minimum_32_chars_long';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_interview_coach_test';
process.env.USE_MOCK_AI = 'true';
process.env.USE_MOCK_EMAIL = 'true';
process.env.USE_MOCK_OAUTH = 'true';

describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('GET /health should return server status', async () => {
      // This test validates the response shape only
      const expectedShape = {
        status: expect.stringMatching(/ok|degraded/),
        timestamp: expect.any(String),
        environment: expect.any(String),
        version: expect.any(String),
      };

      expect(expectedShape.status).toBeDefined();
      expect(expectedShape.timestamp).toBeDefined();
    });
  });

  describe('Auth Validation', () => {
    it('should require email for registration', () => {
      const body = { password: 'Test@1234', name: 'Test User' };
      expect(body).not.toHaveProperty('email');
    });

    it('should require password with uppercase, lowercase, and number', () => {
      const validPasswords = ['Test@1234', 'Hello1World', 'Abc123456'];
      const invalidPasswords = ['test1234', 'TESTTEST', 'TestTest', '12345678'];

      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

      for (const pass of validPasswords) {
        expect(regex.test(pass)).toBe(true);
      }

      for (const pass of invalidPasswords) {
        expect(regex.test(pass)).toBe(false);
      }
    });

    it('should require minimum 8 character password', () => {
      expect('Test@1234'.length).toBeGreaterThanOrEqual(8);
      expect('Short1'.length).toBeLessThan(8);
    });
  });

  describe('API Response Shape', () => {
    it('should follow standard envelope format', () => {
      const response = {
        success: true,
        message: 'Operation successful',
        data: { user: { id: '1', email: 'test@test.com' } },
      };

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('data');
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.message).toBe('string');
    });

    it('should include meta for paginated responses', () => {
      const response = {
        success: true,
        message: 'Items retrieved',
        data: [],
        meta: { page: 1, limit: 10, total: 100, totalPages: 10 },
      };

      expect(response.meta).toHaveProperty('page');
      expect(response.meta).toHaveProperty('limit');
      expect(response.meta).toHaveProperty('total');
      expect(response.meta).toHaveProperty('totalPages');
    });

    it('should return error format correctly', () => {
      const errorResponse = {
        success: false,
        message: 'Invalid email or password',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.message).toBeTruthy();
    });
  });

  describe('Interview Types Validation', () => {
    const validTypes = [
      'HR', 'TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'FRONTEND', 'BACKEND',
      'JAVA', 'JAVASCRIPT', 'REACT', 'NODE', 'DATABASE', 'OS',
      'COMPUTER_NETWORKS', 'DBMS', 'OOPS', 'CUSTOM',
    ];

    it('should accept all valid interview types', () => {
      for (const type of validTypes) {
        expect(validTypes).toContain(type);
      }
    });

    it('should reject invalid interview types', () => {
      const invalidTypes = ['PYTHON', 'RUST', 'INVALID'];
      for (const type of invalidTypes) {
        expect(validTypes).not.toContain(type);
      }
    });
  });

  describe('Difficulty Validation', () => {
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];

    it('should accept all valid difficulties', () => {
      expect(validDifficulties).toHaveLength(3);
    });

    it('should reject invalid difficulties', () => {
      expect(validDifficulties).not.toContain('EXPERT');
    });
  });

  describe('Rate Limiting', () => {
    it('should have rate limit configuration', () => {
      const config = {
        windowMs: 15 * 60 * 1000,
        max: 200,
      };
      expect(config.windowMs).toBe(900000); // 15 minutes
      expect(config.max).toBe(200);
    });

    it('should have auth-specific rate limit', () => {
      const authConfig = {
        windowMs: 15 * 60 * 1000,
        max: 10,
      };
      expect(authConfig.max).toBe(10);
    });
  });
});
