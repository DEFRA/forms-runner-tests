/**
 * @typedef {object} DatePartsFieldControllerParams
 * 
 * @property {string} title
 * @property {import("@playwright/test").Page} page
 * @property {string} name
 * @property {string} hint
 * @property {string} id
 * @property {string} shortDescription
 * @property {object} options
 * @property {boolean} options.required
 */
export class DatePartsFieldController {
  /**
   * 
   * @param {DatePartsFieldControllerParams} params
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
   * @returns {import("@playwright/test").Locator}
   */
  findDayInput() {
    const dayInput = this.page.locator(`#${this.name}__day`);
    return dayInput;
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findMonthInput() {
    const monthInput = this.page.locator(`#${this.name}__month`);
    return monthInput;
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findYearInput() {
    const yearInput = this.page.locator(`#${this.name}__year`);
    return yearInput;
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
