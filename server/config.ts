/**
 * INKLOOM AI - Configuration & Secrets Management (Phase 1)
 * Parses and validates environment variables once at boot with Zod.
 * Exports a frozen configuration object.
 */

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z.coerce.boolean().default(false),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long').default('inkloom-ai-super-secret-jwt-key-minimum-32-chars-long'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  REFRESH_TTL_DAYS: z.coerce.number().default(7),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  BCRYPT_COST: z.coerce.number().default(12),
  MAX_FAILED_LOGINS: z.coerce.number().default(5),
  LOCKOUT_MINUTES: z.coerce.number().default(15),
  IP_HASH_SALT: z.string().default('inkloom-ip-salt-min-32-characters-long-salt'),
  ALLOW_SELF_SERVE_ORG_SIGNUP: z.coerce.boolean().default(false),
  ALLOW_DEMO_SEED: z.coerce.boolean().default(true),
  SEED_PASSWORD: z.string().default('Password123!'),
});

const rawConfig = configSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_SSL: process.env.DATABASE_SSL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL,
  REFRESH_TTL_DAYS: process.env.REFRESH_TTL_DAYS,
  COOKIE_SECURE: process.env.COOKIE_SECURE,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  BCRYPT_COST: process.env.BCRYPT_COST,
  MAX_FAILED_LOGINS: process.env.MAX_FAILED_LOGINS,
  LOCKOUT_MINUTES: process.env.LOCKOUT_MINUTES,
  IP_HASH_SALT: process.env.IP_HASH_SALT,
  ALLOW_SELF_SERVE_ORG_SIGNUP: process.env.ALLOW_SELF_SERVE_ORG_SIGNUP,
  ALLOW_DEMO_SEED: process.env.ALLOW_DEMO_SEED,
  SEED_PASSWORD: process.env.SEED_PASSWORD,
});

// Production validation guard
if (rawConfig.NODE_ENV === 'production') {
  if (!rawConfig.DATABASE_URL) {
    console.error('FATAL: In production, DATABASE_URL is mandatory.');
    process.exit(1);
  }
  if (!rawConfig.JWT_SECRET || rawConfig.JWT_SECRET.includes('default') || rawConfig.JWT_SECRET.length < 32) {
    console.error('FATAL: In production, JWT_SECRET must be set and at least 32 characters long.');
    process.exit(1);
  }
}

export const config = Object.freeze(rawConfig);
export type Config = typeof config;
