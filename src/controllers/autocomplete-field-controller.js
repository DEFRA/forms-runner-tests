export class AutocompleteFieldController {
  /**
   * @typedef {object} AutocompleteFieldControllerOptions
   * @property {boolean} required
   *
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {AutocompleteFieldControllerOptions} options
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
   *
   * @param {import("@playwright/test").Page} page
   * @returns {import("@playwright/test").Locator}
   */
  find() {
    return this.page.locator(`input#${this.name}[role="combobox"]`);
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
   * Find an option in the autocomplete dropdown by text
   * @param {string} text
   * @returns {import("@playwright/test").Locator}
   */
  findOption(text) {
    return this.page
      .locator(`#${this.name}__listbox`)
      .getByRole("option", { name: text });
  }

  /**
   * Fill the autocomplete field and select a matching option
   * @param {string} value - The value to type and select
   */
  async fill(value) {
    const input = this.find();

    // Clear any existing value and type the new one
    await input.clear();
    await input.fill(value);

    // Wait for the dropdown to appear and click the matching option
    const option = this.findOption(value);
    await option.waitFor({ state: "visible" });
    await option.click();

    return this;
  }

  /**
   * Select the first available option after typing a partial value
   * @param {string} partialValue - Partial text to type to trigger suggestions
   */
  async selectFirstOption(partialValue = "") {
    const input = this.find();

    if (partialValue) {
      await input.fill(partialValue);
    } else {
      // Focus the input to potentially show options
      await input.focus();
    }

    // Wait for options to appear and select the first one
    const firstOption = this.page
      .locator(`#${this.name}__listbox [role="option"]`)
      .first();
    await firstOption.waitFor({ state: "visible" });
    await firstOption.click();

    return this;
  }

  /**
   * Get the current value of the autocomplete input
   * @returns {Promise<string>}
   */
  async getValue() {
    return await this.find().inputValue();
  }
}
