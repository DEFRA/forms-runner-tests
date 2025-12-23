import { BaseCompositeFieldController } from './base-field-controller.js'

/**
 * Controller for LatLongField components (dual input for latitude/longitude).
 * Extends BaseCompositeFieldController which provides constructor and isRequired().
 */
export class LatLongFieldController extends BaseCompositeFieldController {
  /**
   * @returns {import("@playwright/test").Locator}
   */
  findLatitudeInput () {
    return this.page.locator(`#${this.name}__latitude`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findLongitudeInput () {
    return this.page.getByRole('textbox', { name: 'Longitude' })
  }

  /**
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

    const latitudeInput = this.findLatitudeInput()
    const longitudeInput = this.findLongitudeInput()

    await expect(latitudeInput).toBeVisible()
    await expect(latitudeInput).toBeEnabled()
    await expect(longitudeInput).toBeVisible()
    await expect(longitudeInput).toBeEnabled()

    return this
  }

  /**
   * @param {string} latitude - Latitude value (for GB: 49.850 to 60.859)
   * @param {string} longitude - Longitude value (for GB: -13.687 to 1.767)
   */
  async fill (latitude, longitude) {
    await this.findLatitudeInput().fill(latitude)
    await this.findLongitudeInput().fill(longitude)
    return this
  }

  /**
   * Validates if coordinates are within Great Britain bounds
   * @param {number} latitude
   * @param {number} longitude
   * @returns {boolean}
   */
  static isWithinGBBounds (latitude, longitude) {
    const isLatValid = latitude >= 49.85 && latitude <= 60.859
    const isLongValid = longitude >= -13.687 && longitude <= 1.767
    return isLatValid && isLongValid
  }
}
