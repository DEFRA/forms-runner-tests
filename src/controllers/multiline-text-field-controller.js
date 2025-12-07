/**
* @typedef {object} MultilineTextFieldControllerParams
*
* @param {string} title
* @param {import("@playwright/test").Page} page
* @param {string} name
* @param {string} hint
* @param {MultilineTextFieldControllerParams} options
* @property {boolean} required
* @property {number} [maxWords]
* @property {number} [rows]
* @param {string} id
* @param {string} shortDescription
*/
export class MultilineTextFieldController {
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
   * Find the textarea element
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
   * Fill the textarea with a value
   * @param {string} value - The text to enter in the textarea
   */
  async fill(value) {
    await this.find().fill(value);
    return this;
  }

  /**
   * Clear the textarea
   */
  async clear() {
    await this.find().clear();
    return this;
  }

  /**
   * Get the current value of the textarea
   * @returns {Promise<string>}
   */
  async getValue() {
    return await this.find().inputValue();
  }

  /**
   * Type text into the textarea (simulates key presses)
   * @param {string} value - The text to type
   */
  async type(value) {
    await this.find().pressSequentially(value);
    return this;
  }

  /**
   * Append text to existing content in the textarea
   * @param {string} value - The text to append
   */
  async append(value) {
    const currentValue = await this.getValue();
    await this.fill(currentValue + value);
    return this;
  }
}
