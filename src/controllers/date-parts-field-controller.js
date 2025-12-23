import { BaseCompositeFieldController } from './base-field-controller.js'

/**
 * Controller for DatePartsField components (day/month/year inputs).
 * Extends BaseCompositeFieldController which provides constructor and isRequired().
 */
export class DatePartsFieldController extends BaseCompositeFieldController {
  /**
   * @returns {import("@playwright/test").Locator}
   */
  findDayInput () {
    return this.page.locator(`#${this.name}__day`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findMonthInput () {
    return this.page.locator(`#${this.name}__month`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findYearInput () {
    return this.page.locator(`#${this.name}__year`)
  }

  /**
   * Find the fieldset containing the date parts
   * @returns {import("@playwright/test").Locator}
   */
  findFieldset () {
    return this.page.getByRole('group', { name: this.title })
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions (expect) {
    const fieldset = this.findFieldset()
    await expect(fieldset).toBeVisible()

    const dayInput = this.findDayInput()
    const monthInput = this.findMonthInput()
    const yearInput = this.findYearInput()

    await expect(dayInput).toBeVisible()
    await expect(dayInput).toBeEnabled()
    await expect(monthInput).toBeVisible()
    await expect(monthInput).toBeEnabled()
    await expect(yearInput).toBeVisible()
    await expect(yearInput).toBeEnabled()

    return this
  }

  /**
   * @param {string} day
   * @param {string} month
   * @param {string} year
   */
  async fill (day, month, year) {
    await this.findDayInput().fill(day)
    await this.findMonthInput().fill(month)
    await this.findYearInput().fill(year)
    return this
  }

  /**
   * @param {Date} date
   */
  async fillFromDate (date) {
    const day = date.getDate().toString()
    const month = (date.getMonth() + 1).toString()
    const year = date.getFullYear().toString()
    return this.fill(day, month, year)
  }
}
