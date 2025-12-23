import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

export const configSchema = z.object({
  TEST_ENVIRONMENT: z.enum(['local', 'test', 'prod']).default('local'),
  TIMEOUT: z.coerce.number().default(30000)
})

export const config = configSchema.parse(process.env)
