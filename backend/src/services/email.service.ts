import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { mockEmailService } from '../utils/mockEmail.service';
import { logger } from '../config/logger';

// ─── Email Options Interface ────────────────────────────────
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// ─── SMTP Transporter (lazy-initialized) ────────────────────
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

// ─── Production Email Sender ────────────────────────────────
async function sendEmailProduction(options: EmailOptions): Promise<void> {
  try {
    const info = await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`[Email] Sent to ${options.to} | Subject: "${options.subject}" | MessageId: ${info.messageId}`);
  } catch (error) {
    logger.error(`[Email] Failed to send to ${options.to}:`, error);
    throw error;
  }
}

// ─── Unified Email Service ──────────────────────────────────
// Delegates to mock or production based on USE_MOCK_EMAIL flag
export const emailService = {
  async sendVerificationEmail(to: string, name: string, token: string, frontendUrl: string): Promise<void> {
    if (env.USE_MOCK_EMAIL) {
      return mockEmailService.sendVerificationEmail(to, name, token, frontendUrl);
    }

    const link = `${frontendUrl}/verify-email?token=${token}`;
    await sendEmailProduction({
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
    if (env.USE_MOCK_EMAIL) {
      return mockEmailService.sendPasswordResetEmail(to, name, token, frontendUrl);
    }

    const link = `${frontendUrl}/reset-password?token=${token}`;
    await sendEmailProduction({
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
    if (env.USE_MOCK_EMAIL) {
      return mockEmailService.sendWelcomeEmail(to, name);
    }

    await sendEmailProduction({
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
          <a href="${env.FRONTEND_URL}/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Go to Dashboard
          </a>
          <p>— The AI Interview Coach Team</p>
        </div>
      `,
    });
  },
};
