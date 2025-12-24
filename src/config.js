import joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

export const configSchema = joi
  .object({
    TEST_ENVIRONMENT: joi
      .string()
      .allow('local', 'test', 'prod')
      .default('local'),
    TIMEOUT: joi.number().default(30000)
  })
  .prefs({ convert: true, abortEarly: false })

/**
 *  @typedef {object} config
 *  @property {string} TEST_ENVIRONMENT
 *  @property {number} TIMEOUT
 */
/**
 * @type {config}
 */
export const config = joi.attempt(
  {
    TEST_ENVIRONMENT: process.env.TEST_ENVIRONMENT,
    TIMEOUT: process.env.TIMEOUT
  },
  configSchema
)
