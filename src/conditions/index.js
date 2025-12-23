import {
  IsCondition,
  IsNotCondition,
  IsMoreThanCondition,
  IsLessThanCondition,
  IsAtLeastCondition,
  IsAtMostCondition
} from './conditions.js'

import { ConditionMapper } from '../helpers/components-mapper.js'

export {
  IsCondition,
  IsNotCondition,
  IsMoreThanCondition,
  IsLessThanCondition,
  IsAtLeastCondition,
  IsAtMostCondition
}

/**
 * @typedef {object} ConditionItemDefinition
 * @property {string} id
 * @property {string} componentId
 * @property {string} operator
 * @property {object} value
 * @property {'ListItemRef' | 'NumberValue'} type
 */

/**
 * @typedef {object} ConditionDefinition
 * @property {string} id
 * @property {string} displayName
 * @property {ConditionItemDefinition[]} items
 */

/**
 * @typedef {object} ListDefinition
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} type
 * @property {Array<{id: string, text: string, value: string}>} items
 */

/**
 * @typedef {object} FormDefinition
 * @property {Array<{components: Array<{id: string, list?: string}>}>} pages
 * @property {ConditionDefinition[]} conditions
 * @property {ListDefinition[]} lists
 */

/**
 * Create a condition instance from a condition definition
 * @param {ConditionDefinition} conditionDef - The condition definition from JSON
 * @param {FormDefinition} formDefinition - The full form definition (for list lookups)
 * @param {import("@playwright/test").Page} page - Playwright page object
 * @returns {object | null} - Condition instance or null if operator not supported
 */
export function createCondition(conditionDef, formDefinition, page) {
  return ConditionMapper.createCondition(conditionDef, formDefinition, page)
}

/**
 * Create all condition instances for a form
 * @param {FormDefinition} formDefinition - The form definition
 * @param {import("@playwright/test").Page} page - Playwright page object
 * @returns {Map<string, object>} - Map of condition ID to condition instance
 */
export function createConditionsForForm(formDefinition, page) {
  return ConditionMapper.createConditionsForForm(formDefinition, page)
}

/**
 * Get the condition that controls a specific page
 * @param {object} pageDef - The page definition
 * @param {Map<string, object>} conditionsMap - Map of condition instances
 * @returns {object | undefined} - The condition instance or undefined
 */
export function getConditionForPage(pageDef, conditionsMap) {
  return ConditionMapper.getConditionForPage(pageDef, conditionsMap)
}

/**
 * Get list of supported operators
 * @returns {string[]}
 */
export function getSupportedOperators() {
  return ConditionMapper.getSupportedOperators()
}
