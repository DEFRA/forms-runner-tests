import {
  addDays,
  getTriggerDate,
  getNonTriggerDate,
  isRelativeDateValue,
  toDateParts
} from './relative-date-utils.js'

/**
 * @typedef {import('./relative-date-utils.js').RelativeDateValue} RelativeDateValue
 */

/**
 * @typedef {object} IsMoreThanConditionOptions
 * @property {import('@playwright/test').Page} page Playwright page.
 * @property {string} id Condition id.
 * @property {string} name Condition name.
 * @property {string} operator Operator string.
 * @property {'NumberValue' | 'RelativeDate' | 'DateValue'} type Value type.
 * @property {string} componentId Component id.
 * @property {number | RelativeDateValue | string | Date} value Condition value.
 */

export class IsMoreThanCondition {
  /**
   * @param {IsMoreThanConditionOptions} options Options.
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
   * Get a value that triggers this condition (value > threshold).
   * @returns {number | [number, number, number] | null} Trigger value.
   */
  get triggerValue() {
    if (this.type === 'NumberValue') {
      return typeof this.value === 'number' ? this.value + 1 : null
    }

    if (this.type === 'DateValue') {
      const threshold = new Date(this.value)
      return toDateParts(addDays(threshold, 1))
    }

    if (this.type === 'RelativeDate' && isRelativeDateValue(this.value)) {
      const threshold = getTriggerDate(this.value)
      return this.value.direction === 'in the future'
        ? toDateParts(addDays(threshold, 1))
        : toDateParts(addDays(threshold, -1))
    }

    return null
  }

  /**
   * Get a value that does NOT trigger this condition (value <= threshold).
   * @returns {number | [number, number, number] | null} Non-trigger value.
   */
  get nonTriggerValue() {
    if (this.type === 'NumberValue') {
      return typeof this.value === 'number' ? this.value : null
    }

    if (this.type === 'DateValue') {
      const threshold = new Date(this.value)
      return toDateParts(threshold)
    }

    if (this.type === 'RelativeDate' && isRelativeDateValue(this.value)) {
      return toDateParts(getNonTriggerDate(this.value))
    }

    return null
  }

  /**
   * Get the boundary value (the threshold itself).
   * @returns {number | [number, number, number] | null} Boundary value.
   */
  get boundaryValue() {
    if (this.type === 'NumberValue') {
      return typeof this.value === 'number' ? this.value : null
    }

    if (this.type === 'DateValue') {
      const threshold = new Date(this.value)
      return toDateParts(threshold)
    }

    if (this.type === 'RelativeDate' && isRelativeDateValue(this.value)) {
      return toDateParts(getTriggerDate(this.value))
    }

    return null
  }

  /**
   * Get a value well below the threshold.
   * @returns {number | null} Safe low value.
   */
  get safeLowValue() {
    return this.type === 'NumberValue' && typeof this.value === 'number'
      ? Math.max(0, this.value - 1)
      : null
  }
}
