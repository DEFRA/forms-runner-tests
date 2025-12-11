import RandExp from "randexp";
export class TextFieldController {
  /**
   * @typedef {object} TextFieldControllerOptions
   * @property {boolean} required
   *
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} hint
   * @param {TextFieldControllerOptions} options
   * @param {string} id
   * @param {string} shortDescription
   * @param {object} schema
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
    schema,
  }) {
    this.title = title;
    this.page = page;
    this.name = name;
    this.hint = hint;
    this.id = id;
    this.type = type;
    this.options = options;
    this.schema = schema;
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
   * @param {string} value
   */
  async fill(value) {
    if (this.schema?.regex) {
      const randExp = new RandExp(this.schema.regex);
      await this.find().fill(randExp.gen());
      return this;
    }
    await this.find().fill(value);
    return this;
  }
}
