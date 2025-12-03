export class TelephoneNumberFieldController {
  /**
   * @typedef {object} TelephoneNumberFieldControllerOptions
   * @property {boolean} required
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {TelephoneNumberFieldControllerOptions} options
   * @param {string} id
   * @param {string} shortDescription
   */
  constructor({ title, page, name, hint, type, options, id, shortDescription }) {
    this.title = title;
    this.page = page;
    this.name = name;
    this.hint = hint;
    this.id = id;
    this.type = type;
    this.options = options;
    this.shortDescription = shortDescription;
  }

  isRequired() {
    return this.options?.required === true;
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  find() {
    return this.page.getByRole("textbox", { name: this.title });
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions(expect) {
    const element = this.find();
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
    return this;
  }

  /**
   * @param {string} value - Phone number
   */
  async fill(value) {
    await this.find().fill(value);
    return this;
  }

  /**
   * Validates UK phone number format
   * @param {string} value
   * @returns {boolean}
   */
  static isValidUKPhoneNumber(value) {
    // Basic UK phone number validation
    const pattern = /^(?:(?:\+44)|(?:0))(?:\d{10}|\d{9})$/;
    const cleaned = value.replace(/[\s-]/g, "");
    return pattern.test(cleaned);
  }
}
