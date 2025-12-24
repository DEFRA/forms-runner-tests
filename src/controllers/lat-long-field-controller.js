import { BaseCompositeFieldController } from './base-field-controller.js'

/**
 * Controller for LatLongField components (dual input for latitude/longitude).
 * Extends BaseCompositeFieldController which provides constructor and isRequired().
 */
export class LatLongFieldController extends BaseCompositeFieldController {
  /**
   * @returns {import("@playwright/test").Locator}
   */
  findLatitudeInput() {
    return this.page.locator(`#${this.name}__latitude`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findLongitudeInput() {
    return this.page.locator(`#${this.name}__longitude`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findFieldset() {
    return this.page.getByRole('group', { name: this.title })
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   * @returns {Promise<LatLongFieldController>} The controller instance for chaining.
   */
  async assertions(expect) {
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
   * @returns {Promise<LatLongFieldController>} The controller instance for chaining.
   */
  async fill(latitude, longitude) {
    await this.findLatitudeInput().fill(latitude)
    await this.findLongitudeInput().fill(longitude)
    return this
  }
}
