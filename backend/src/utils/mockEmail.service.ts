import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger';

const EMAIL_LOG_DIR = path.join(process.cwd(), 'logs', 'emails');

if (!fs.existsSync(EMAIL_LOG_DIR)) {
  fs.mkdirSync(EMAIL_LOG_DIR, { recursive: true });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const mockEmailService = {
  async sendEmail(options: EmailOptions): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      to: options.to,
      subject: options.subject,
      body: options.html,
    };

    const logFile = path.join(EMAIL_LOG_DIR, `${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2));

    logger.info(`[MockEmail] Email sent to ${options.to} | Subject: "${options.subject}"`);
    logger.info(`[MockEmail] Email log saved to: ${logFile}`);
  },

  async sendVerificationEmail(to: string, name: string, token: string, frontendUrl: string): Promise<void> {
    const link = `${frontendUrl}/verify-email?token=${token}`;
    await this.sendEmail({
      to,
      subject: 'Verify Your Email — AI Interview Coach',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Welcome to AI Interview Coach!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
          <a href="${link}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Verify Email Address
          </a>
          <p>Or copy and paste this link: <code>${link}</code></p>
          <p>This link expires in 24 hours.</p>
          <p>— The AI Interview Coach Team</p>
        </div>
      `,
    });
  },

  async sendPasswordResetEmail(to: string, name: string, token: string, frontendUrl: string): Promise<void> {
    const link = `${frontendUrl}/reset-password?token=${token}`;
    await this.sendEmail({
      to,
      subject: 'Reset Your Password — AI Interview Coach',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Password Reset Request</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <a href="${link}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link: <code>${link}</code></p>
          <p>This link expires in 1 hour. If you did not request a password reset, please ignore this email.</p>
          <p>— The AI Interview Coach Team</p>
        </div>
      `,
    });
  },

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to AI Interview Coach 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">You're all set, ${name}!</h1>
          <p>Your account has been verified. Here's what you can do now:</p>
          <ul>
            <li>📄 Upload your resume for AI analysis</li>
            <li>🎤 Start a mock interview session</li>
            <li>📊 Track your progress with analytics</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Go to Dashboard
          </a>
          <p>— The AI Interview Coach Team</p>
        </div>
      `,
    });
  },
};
