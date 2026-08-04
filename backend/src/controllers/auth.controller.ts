import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { googleService } from '../services/google.service';
import { AuthRequest } from '../types';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: { user },
      });
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, user } = await authService.login(
        req.body, res,
        req.headers['user-agent'],
        req.ip
      );
      res.json({ success: true, message: 'Login successful', data: { accessToken, user } });
    } catch (err) { next(err); }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      const { accessToken } = await authService.refreshToken(token, res);
      res.json({ success: true, message: 'Token refreshed', data: { accessToken } });
    } catch (err) { next(err); }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      await authService.logout(token, res);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) { next(err); }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      const user = await authService.verifyEmail(token);
      res.json({ success: true, message: 'Email verified successfully', data: { user } });
    } catch (err) { next(err); }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (err) { next(err); }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.json({ success: true, message: 'Password reset successfully. Please log in.' });
    } catch (err) { next(err); }
  },

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      // In mock mode, return demo Google user
      if (env.USE_MOCK_OAUTH) {
        const { accessToken, user } = await authService.mockGoogleLogin(res);
        res.json({ success: true, message: 'Google login successful', data: { accessToken, user } });
        return;
      }

      // Production: verify Google ID token from request body
      const { credential, code } = req.body;

      let googleUser;
      if (credential) {
        // Frontend sent a Google ID token (popup sign-in flow)
        googleUser = await googleService.verifyIdToken(credential);
      } else if (code) {
        // Frontend sent an authorization code (redirect flow)
        googleUser = await googleService.exchangeCode(code);
      } else {
        res.status(400).json({
          success: false,
          message: 'Google credential or authorization code is required',
        });
        return;
      }

      const { accessToken, user } = await authService.googleLogin(
        googleUser, res,
        req.headers['user-agent'],
        req.ip
      );

      res.json({ success: true, message: 'Google login successful', data: { accessToken, user } });
    } catch (err) {
      logger.error('[GoogleOAuth] Login failed:', err);
      next(err);
    }
  },

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      // Handle OAuth2 redirect callback
      if (env.USE_MOCK_OAUTH) {
        const { accessToken, user } = await authService.mockGoogleLogin(res);
        res.redirect(`${env.FRONTEND_URL}/auth/google/callback?token=${accessToken}`);
        return;
      }

      const { code } = req.query as { code: string };
      if (!code) {
        res.redirect(`${env.FRONTEND_URL}/login?error=google_auth_failed`);
        return;
      }

      const googleUser = await googleService.exchangeCode(code);
      const { accessToken } = await authService.googleLogin(
        googleUser, res,
        req.headers['user-agent'],
        req.ip
      );

      res.redirect(`${env.FRONTEND_URL}/auth/google/callback?token=${accessToken}`);
    } catch (err) {
      logger.error('[GoogleOAuth] Callback failed:', err);
      res.redirect(`${env.FRONTEND_URL}/login?error=google_auth_failed`);
    }
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, message: 'User retrieved', data: { user: req.user } });
    } catch (err) { next(err); }
  },
};
