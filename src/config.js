import {z} from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const configSchema = z.object({
 testEnvironment: z.enum(['local', 'test', 'prod']).default('local'),
  timeout: z.number().default(30000),
});

export const config = configSchema.parse(process.env, {errorMap: () => ({message: 'Invalid configuration'})});