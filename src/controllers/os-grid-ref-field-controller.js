export class OsGridRefFieldController {
  /**
   * @typedef {object} OsGridRefFieldControllerOptions
   * @property {boolean} required
   * @property {string} [instructionText]
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {OsGridRefFieldControllerOptions} options
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
   * @param {string} value - OS Grid Reference (2 letters + 6 numbers, e.g., TQ123456)
   */
  async fill(value) {
    await this.find().fill(value);
    return this;
  }

  /**
   * Validates the format of an OS Grid Reference
   * @param {string} value
   * @returns {boolean}
   */
  static isValidFormat(value) {
    const pattern = /^[A-Z]{2}\d{6}$/i;
    return pattern.test(value);
  }
}
