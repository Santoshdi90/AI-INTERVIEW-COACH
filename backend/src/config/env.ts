import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/ai_interview_coach'),

  JWT_ACCESS_SECRET: z.string().min(32).default('default_jwt_access_secret_min_32_characters_long'),
  JWT_REFRESH_SECRET: z.string().min(32).default('default_jwt_refresh_secret_min_32_characters_long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  GOOGLE_CLIENT_ID: z.string().optional().default('mock_google_client_id'),
  GOOGLE_CLIENT_SECRET: z.string().optional().default('mock_google_client_secret'),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/auth/google/callback'),

  OPENAI_API_KEY: z.string().optional().default('mock_openai_key'),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default('mock_cloud'),
  CLOUDINARY_API_KEY: z.string().optional().default('mock_api_key'),
  CLOUDINARY_API_SECRET: z.string().optional().default('mock_api_secret'),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default('mock@example.com'),
  SMTP_PASS: z.string().optional().default('mock_password'),
  EMAIL_FROM: z.string().default('AI Interview Coach <noreply@aiinterviewcoach.com>'),

  USE_MOCK_AI: z.string().transform((v: string) => v === 'true').default('true'),
  USE_MOCK_STORAGE: z.string().transform((v: string) => v === 'true').default('true'),
  USE_MOCK_EMAIL: z.string().transform((v: string) => v === 'true').default('true'),
  USE_MOCK_OAUTH: z.string().transform((v: string) => v === 'true').default('true'),
  REQUIRE_EMAIL_VERIFICATION: z.string().transform((v: string) => v === 'true').default('false'),

  STORAGE_PROVIDER: z.enum(['local', 'cloudinary', 's3']).default('local'),
  AWS_S3_BUCKET: z.string().optional().default(''),
  AWS_S3_REGION: z.string().optional().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = parseEnv();
export type Env = typeof env;
