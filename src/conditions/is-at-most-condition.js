/**
 * @typedef {object} IsAtMostConditionOptions
 * @property {import('@playwright/test').Page} page Playwright page.
 * @property {string} id Condition id.
 * @property {string} name Condition name.
 * @property {string} operator Operator string.
 * @property {'NumberValue'} type Value type.
 * @property {string} componentId Component id.
 * @property {number} value Condition value.
 */

export class IsAtMostCondition {
  /**
   * @param {IsAtMostConditionOptions} options Options.
   */
  constructor({ page, id, name, operator, componentId, value, type }) {
    this.page = page
    this.id = id
    this.name = name
    this.operator = operator
    this.componentId = componentId
    this.value = value
    this.type = type
  }

  /**
   * Get a value that triggers this condition (value <= threshold).
   * @returns {number | null} Trigger value.
   */
  get triggerValue() {
    return this.type === 'NumberValue' ? this.value : null
  }

  /**
   * Get a value that does NOT trigger this condition (value > threshold).
   * @returns {number | null} Non-trigger value.
   */
  get nonTriggerValue() {
    return this.type === 'NumberValue' ? this.value + 1 : null
  }
}
