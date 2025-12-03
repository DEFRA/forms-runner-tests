export class RadioFieldController {
  /**
   * @typedef {object} RadioFieldControllerOptions
   * @property {boolean} required
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {RadioFieldControllerOptions} options
   * @param {string} id
   * @param {string} shortDescription
   * @param {string} list - The list ID associated with the radio field
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
    list,
  }) {
    this.title = title;
    this.page = page;
    this.name = name;
    this.hint = hint;
    this.id = id;
    this.type = type;
    this.options = options;
    this.shortDescription = shortDescription;
    this.list = list;
  }

  isRequired() {
    return this.options?.required === true;
  }

  /**
   * Find the radio group fieldset
   * @returns {import("@playwright/test").Locator}
   */
  findFieldset() {
    return this.page.getByRole("group", { name: this.title });
  }

  /**
   * Find a specific radio option by its label text
   * @param {string} optionText - The text label of the radio option
   * @returns {import("@playwright/test").Locator}
   */
  findOption(optionText) {
    return this.page.getByRole("radio", { name: optionText });
  }

  /**
   * Find all radio options within the fieldset
   * @returns {import("@playwright/test").Locator}
   */
  findAllOptions() {
    return this.page.getByRole("radio");
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions(expect) {
    const fieldset = this.findFieldset();
    await expect(fieldset).toBeVisible();
    return this;
  }

  /**
   * Select a radio option by its label text
   * @param {string} optionText - The text label of the radio option to select
   */
  async selectOption(optionText) {
    const option = this.findOption(optionText);
    await option.check();
    return this;
  }

  async selectFirstOption() {
    const firstOption = this.findAllOptions().first();
    await firstOption.check();
    return this;
  }

  /**
   * Select a radio option by its value
   * @param {string} value - The value of the radio option to select
   */
  async selectByValue(value) {
    const radio = this.page.locator(`input[type="radio"][value="${value}"]`);
    await radio.check();
    return this;
  }

  /**
   * Get the currently selected radio option value
   * @returns {Promise<string|null>}
   */
  async getSelectedValue() {
    const checkedRadio = this.findFieldset().locator(
      'input[type="radio"]:checked'
    );
    const count = await checkedRadio.count();
    if (count === 0) {
      return null;
    }
    return await checkedRadio.getAttribute("value");
  }

  /**
   * Check if a specific option is selected
   * @param {string} optionText - The text label of the radio option
   * @returns {Promise<boolean>}
   */
  async isOptionSelected(optionText) {
    const option = this.findOption(optionText);
    return await option.isChecked();
  }

  /**
   * Get the count of radio options
   * @returns {Promise<number>}
   */
  async getOptionsCount() {
    return await this.findAllOptions().count();
  }

  //   /**
  //    * Fill the radio field by selecting an option (alias for selectOption)
  //    * @param {string} optionText - The text label of the radio option to select
  //    */
  //   async fill(optionText) {
  //     return await this.selectOption(optionText);
  //   }
}
