export class EastingNorthingFieldController {
  /**
   * @typedef {object} EastingNorthingFieldControllerOptions
   * @property {boolean} required
   * @property {string} [instructionText]
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {EastingNorthingFieldControllerOptions} options
   * @param {string} id
   * @param {string} shortDescription
   */
  constructor({ title, page, name, type, hint, options, id , shortDescription}) {
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
  findEastingInput() {
    return this.page.getByRole("textbox", { name: "Easting" });
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findNorthingInput() {
    return this.page.getByRole("textbox", { name: "Northing" });
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findFieldset() {
    return this.page.getByRole("group", { name: this.title });
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions(expect) {
    const fieldset = this.findFieldset();
    await expect(fieldset).toBeVisible();

    const eastingInput = this.findEastingInput();
    const northingInput = this.findNorthingInput();

    await expect(eastingInput).toBeVisible();
    await expect(eastingInput).toBeEnabled();
    await expect(northingInput).toBeVisible();
    await expect(northingInput).toBeEnabled();

    return this;
  }

  /**
   * @param {string} easting - Easting value (up to 6 digits, 0-700000)
   * @param {string} northing - Northing value (up to 7 digits, 0-1300000)
   */
  async fill(easting, northing) {
    await this.findEastingInput().fill(easting);
    await this.findNorthingInput().fill(northing);
    return this;
  }
}
