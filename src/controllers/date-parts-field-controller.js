export class DatePartsFieldController {
  /**
   * @typedef {object} DatePartsFieldControllerOptions
   * @property {boolean} required
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {DatePartsFieldControllerOptions} options
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
  findDayInput() {
    const parent = this.page.getByText(this.title).locator('..');
    return parent.getByRole("textbox", { name: "Day" });
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findMonthInput() {
    const parent = this.page.getByText(this.title).locator('..');
    return parent.getByRole("textbox", { name: "Month" });
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findYearInput() {
    const parent = this.page.getByText(this.title).locator('..');
    return parent.getByRole("textbox", { name: "Year" });
  }

  // /**
  //  * @returns {import("@playwright/test").Locator}
  //  */
  // findFieldset() {
  //   return this.page.getByRole("group", { name: this.title });
  // }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions(expect) {
    const fieldset = this.findFieldset();
    await expect(fieldset).toBeVisible();

    const dayInput = this.findDayInput();
    const monthInput = this.findMonthInput();
    const yearInput = this.findYearInput();

    await expect(dayInput).toBeVisible();
    await expect(dayInput).toBeEnabled();
    await expect(monthInput).toBeVisible();
    await expect(monthInput).toBeEnabled();
    await expect(yearInput).toBeVisible();
    await expect(yearInput).toBeEnabled();

    return this;
  }

  /**
   * @param {string} day
   * @param {string} month
   * @param {string} year
   */
  async fill(day, month, year) {
    await this.findDayInput().fill(day);
    await this.findMonthInput().fill(month);
    await this.findYearInput().fill(year);
    return this;
  }
  

  /**
   * @param {Date} date
   */
  async fillFromDate(date) {
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    return this.fill(day, month, year);
  }
}
