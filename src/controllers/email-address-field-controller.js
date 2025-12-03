export class EmailAddressFieldController {
  /**
   * @typedef {object} EmailAddressFieldControllerOptions
   * @property {boolean} required
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {EmailAddressFieldControllerOptions} options
   * @param {string} id
   * @param {string} shortDescription
   */
  constructor({ title, page, name, type, hint, options, id, shortDescription }) {
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
   * @param {string} value - Email address
   */
  async fill(value) {
    await this.find().fill(value);
    return this;
  }

  /**
   * Validates email format
   * @param {string} value
   * @returns {boolean}
   */
  static isValidEmail(value) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value);
  }
}
