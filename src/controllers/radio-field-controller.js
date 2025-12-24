import { BaseGroupFieldController } from './base-field-controller.js'

/**
 * Controller for RadioField components.
 * Extends BaseGroupFieldController which provides findFieldset() and assertions().
 */
export class RadioFieldController extends BaseGroupFieldController {
  /**
   * Find a specific radio option by its label text
   * @param {string} optionText - The text label of the radio option
   * @returns {import("@playwright/test").Locator}
   */
  findOption(optionText) {
    return this.page.getByRole('radio', { name: optionText })
  }

  /**
   * Find all radio options within the fieldset
   * @returns {import("@playwright/test").Locator}
   */
  findAllOptions() {
    return this.page.getByRole('radio')
  }

  /**
   * Select a radio option by its label text
   * @param {string} optionText - The text label of the radio option to select
   */
  async selectOption(optionText) {
    const option = this.findOption(optionText)
    await option.check()
    return this
  }

  async selectFirstOption() {
    const firstOption = this.findAllOptions().first()
    await firstOption.check()
    return this
  }

  /**
   * Select a radio option by its value
   * @param {string} value - The value of the radio option to select
   */
  async selectByValue(value) {
    const radio = this.page.locator(`input[type="radio"][value="${value}"]`)
    await radio.check()
    return this
  }

  /**
   * Get the currently selected radio option value
   * @returns {Promise<string|null>}
   */
  async getSelectedValue() {
    const checkedRadio = this.findFieldset().locator(
      'input[type="radio"]:checked'
    )
    const count = await checkedRadio.count()
    if (count === 0) {
      return null
    }
    return await checkedRadio.getAttribute('value')
  }

  /**
   * Check if a specific option is selected
   * @param {string} optionText - The text label of the radio option
   * @returns {Promise<boolean>}
   */
  async isOptionSelected(optionText) {
    const option = this.findOption(optionText)
    return await option.isChecked()
  }

  /**
   * Get the count of radio options
   * @returns {Promise<number>}
   */
  async getOptionsCount() {
    return await this.findAllOptions().count()
  }
}
