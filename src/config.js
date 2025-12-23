import joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

export const configSchema = joi.object({
  TEST_ENVIRONMENT: joi
    .string()
    .allow('local', 'test', 'prod')
    .default('local'),
  TIMEOUT: joi.number().default(30000)
})

export const config = joi.attempt(process.env, configSchema)
