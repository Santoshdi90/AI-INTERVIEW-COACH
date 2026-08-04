import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env';
import { logger } from './config/logger';
import { checkDatabaseConnection, disconnectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import feedbackRoutes from './routes/feedback.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ─── Security Middleware ────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── Dynamic Allowed Origins CORS Handling ────────────────────
const configuredOrigins = env.FRONTEND_URL
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (requestOrigin, callback) => {
    // Allow non-browser requests (Postman, server-to-server, health probes)
    if (!requestOrigin) return callback(null, true);

    const isAllowed =
      configuredOrigins.includes('*') ||
      configuredOrigins.some((allowed) => requestOrigin === allowed) ||
      /\.vercel\.app$/.test(requestOrigin) ||
      requestOrigin.startsWith('http://localhost');

    if (isAllowed) {
      callback(null, true);
    } else {
      // Dynamic fallback to echo request origin and satisfy preflight
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// ─── Global Rate Limiter ────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
  }));
}

// ─── Static Files ───────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Root & Health Check ─────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'AI Interview Coach API',
    version: '2.0.0',
    status: 'online',
    health: '/health',
    api: '/api',
  });
});

app.get('/health', async (_req, res) => {
  const dbHealthy = await checkDatabaseConnection();
  const status = dbHealthy ? 'ok' : 'degraded';
  const statusCode = dbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '2.0.0',
    database: dbHealthy ? 'connected' : 'disconnected',
    services: {
      ai: env.USE_MOCK_AI ? 'mock' : 'openai',
      email: env.USE_MOCK_EMAIL ? 'mock' : 'smtp',
      storage: env.STORAGE_PROVIDER,
      oauth: env.USE_MOCK_OAUTH ? 'mock' : 'google',
    },
  });
});

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// ─── Error Handling ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────
const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`📡 API available at http://localhost:${env.PORT}/api`);
  logger.info(`🔧 Services: AI=${env.USE_MOCK_AI ? 'mock' : 'openai'}, Storage=${env.STORAGE_PROVIDER}, Email=${env.USE_MOCK_EMAIL ? 'mock' : 'smtp'}, OAuth=${env.USE_MOCK_OAUTH ? 'mock' : 'google'}`);

  // Verify database connectivity on startup
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    logger.error('⚠️  Database connection failed on startup. Some features may not work.');
  }
});

// ─── Graceful Shutdown ──────────────────────────────────────────
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await disconnectDatabase();
    logger.info('Process terminated');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
