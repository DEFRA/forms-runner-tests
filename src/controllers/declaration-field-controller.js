export class DeclarationFieldController {
  /**
   * @typedef {object} DeclarationFieldControllerOptions
   * @property {boolean} required
   *
   * @param {string} title
   * @param {import("@playwright/test").Page} page
   * @param {string} name
   * @param {string} content - Markdown content of the declaration
   * @param {DeclarationFieldControllerOptions} options
   * @param {string} id
   * @param {string} shortDescription
   */
  constructor({ title, page, name, type, content, options, id , shortDescription}) {
    this.title = title;
    this.page = page;
    this.name = name;
    this.type = type;
    this.content = content;
    this.id = id;
    this.options = options;
    this.shortDescription = shortDescription;
  }

  isRequired() {
    return this.options?.required === true;
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findCheckbox() {
    return this.page.getByLabel('I understand and agree');
  }

  /**
   * @returns {import("@playwright/test").Locator}
   */
  findDeclarationContent() {
    return this.page.locator(`[data-declaration-id="${this.id}"]`);
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions(expect) {
    const checkbox = this.findCheckbox();
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeEnabled();
    return this;
  }

  async fill() {
    const checkbox = this.findCheckbox();
    await checkbox.check({ force: true , timeout: 5000});
    return this;
  }


  async decline() {
    const checkbox = this.findCheckbox();
    await checkbox.uncheck();
    return this;
  }

  /**
   * Check if the declaration is accepted
   * @returns {Promise<boolean>}
   */
  async isAccepted() {
    return await this.findCheckbox().isChecked();
  }

  /**
   * Toggle the declaration checkbox
   */
  async toggle() {
    await this.findCheckbox().click();
    return this;
  }
}
