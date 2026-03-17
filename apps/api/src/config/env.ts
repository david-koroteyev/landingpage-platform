import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional().or(z.literal('mock')),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
