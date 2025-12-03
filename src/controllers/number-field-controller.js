export class NumberFieldController {
  /**
   * @typedef {object} NumberFieldControllerOptions
   * @property {boolean} required
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {NumberFieldControllerOptions} options
   * @param {string} id
   * @param {string} shortDescription
   */
  constructor({
    title,
    page,
    name,
    type,
    hint,
    options,
    id,
    shortDescription,
  }) {
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
   * Find the number input field
   * @returns {import("@playwright/test").Locator}
   */
  find() {
    return this.page.getByRole("textbox", { name: this.title });
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   * @returns
   */
  async assertions(expect) {
    const element = this.find();
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
    return this;
  }

  /**
   * Fill the number field with a numeric value
   * @param {number|string} value - The numeric value to enter
   */
  async fill(value) {
    await this.find().fill(String(value));
    return this;
  }

  /**
   * Get the current value of the number field
   * @returns {Promise<string>}
   */
  async getValue() {
    return await this.find().inputValue();
  }

  /**
   * Get the current value as a number
   * @returns {Promise<number>}
   */
  async getNumericValue() {
    const value = await this.getValue();
    return parseFloat(value);
  }

  /**
   * Clear the number field
   */
  async clear() {
    await this.find().clear();
    return this;
  }
}
