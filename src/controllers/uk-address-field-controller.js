import { BaseCompositeFieldController } from './base-field-controller.js'

/**
 * Controller for UkAddressField components (multi-field address input).
 * Extends BaseCompositeFieldController which provides constructor and isRequired().
 */
export class UkAddressFieldController extends BaseCompositeFieldController {
  usesPostcodeLookup () {
    return this.options?.usePostcodeLookup === true
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findAddressLine1 () {
    return this.page.locator(`#${this.name}__addressLine1`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findAddressLine2 () {
    return this.page.locator(`#${this.name}__addressLine2`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findTownOrCity () {
    return this.page.locator(`#${this.name}__town`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findCounty () {
    return this.page.locator(`#${this.name}__county`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findPostcode () {
    return this.page.locator(`#${this.name}__postcode`)
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findFieldset () {
    return this.page.getByRole('group', { name: this.title })
  }

  /**
   * For postcode lookup mode
   * @returns {import("@playwright/test").Locator}
   */
  findPostcodeLookupInput () {
    return this.page.locator(`#${this.name}__postcode`)
  }

  /**
   * For postcode lookup mode
   * @returns {import("@playwright/test").Locator}
   */
  findFindAddressButton () {
    return this.page.locator(`#${this.name}__findAddress`)
  }

  /**
   * For postcode lookup mode
   * @returns {import("@playwright/test").Locator}
   */
  findAddressDropdown () {
    return this.page.getByRole('combobox', { name: 'Select an address' })
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions (expect) {
    const fieldset = this.findFieldset()
    await expect(fieldset).toBeVisible()

    if (this.usesPostcodeLookup()) {
      await expect(this.findPostcodeLookupInput()).toBeVisible()
      await expect(this.findFindAddressButton()).toBeVisible()
    } else {
      await expect(this.findAddressLine1()).toBeVisible()
      await expect(this.findAddressLine1()).toBeEnabled()
      await expect(this.findTownOrCity()).toBeVisible()
      await expect(this.findTownOrCity()).toBeEnabled()
      await expect(this.findPostcode()).toBeVisible()
      await expect(this.findPostcode()).toBeEnabled()
    }

    return this
  }

  /**
   * @typedef {object} AddressDetails
   * @property {string} addressLine1
   * @property {string} [addressLine2]
   * @property {string} townOrCity
   * @property {string} [county]
   * @property {string} postcode
   * @param {AddressDetails} address
   */
  async fill (address) {
    await this.findAddressLine1().fill(address.addressLine1)
    if (address.addressLine2) {
      await this.findAddressLine2().fill(address.addressLine2)
    }
    await this.findTownOrCity().fill(address.townOrCity)
    if (address.county) {
      await this.findCounty().fill(address.county)
    }
    await this.findPostcode().fill(address.postcode)
    return this
  }

  /**
   * For postcode lookup mode - search for an address
   * @param {string} postcode
   */
  async searchPostcode (postcode) {
    await this.findPostcodeLookupInput().fill(postcode)
    await this.findFindAddressButton().click()
    return this
  }

  /**
   * For postcode lookup mode - select an address from dropdown
   * @param {string} addressText
   */
  async selectAddress (addressText) {
    await this.findAddressDropdown().selectOption({ label: addressText })
    return this
  }
}
