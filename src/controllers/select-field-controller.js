/**
 * @typedef {object} SelectFieldControllerParams
 * @property {boolean} required *
 * @property{string} title
 * @property{import("@playwright/test").Page} page
 * @property{string} name
 * @property{string} hint
 * @property{string} id
 * @property{string} shortDescription
 * @property{object} options
 * @property{boolean} [options.required]
 */
export class SelectFieldController {
  /** @param {SelectFieldControllerParams} params */
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

  async fill(value) {
    await this.find().selectOption({ label: value });
    return this;
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  find() {
    return this.page.getByRole("combobox", { name: this.title });
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
}
