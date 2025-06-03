import { z } from 'zod';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

expand(config());

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

const EnvSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
  DATABASE_URL: z.string().url().optional(),
});

export type env = z.infer<typeof EnvSchema>;

let env: env;

try {
  env = EnvSchema.parse(process.env);
}
catch (err) {
  const error = err as z.ZodError;
  console.error('Environment variable validation failed:', error.errors);
  console.error(error.flatten());
  process.exit(1);
}

export default env;