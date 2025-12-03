export class NationalGridFieldNumberController {
  /**
   * @typedef {object} NationalGridFieldNumberControllerOptions
   * @property {boolean} required
   * @property {string} [instructionText]
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {NationalGridFieldNumberControllerOptions} options
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
   * @param {string} value - National Grid Field Number (2 letters + 8 numbers, e.g., SO04188589)
   */
  async fill(value) {
    await this.find().fill(value);
    return this;
  }

  /**
   * Validates the format of a National Grid Field Number
   * @param {string} value
   * @returns {boolean}
   */
  static isValidFormat(value) {
    const pattern = /^[A-Z]{2}\d{8}$/i;
    return pattern.test(value);
  }
}
