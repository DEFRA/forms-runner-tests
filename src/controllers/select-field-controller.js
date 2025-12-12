import { BaseFieldController } from "./base-field-controller.js";

/**
 * Controller for SelectField (dropdown) components.
 * Overrides find() to use combobox role.
 */
export class SelectFieldController extends BaseFieldController {
  /**
   * @returns {import("@playwright/test").Locator}
   */
  find() {
    return this.page.getByRole("combobox", { name: this.title });
  }

  /**
   * Select an option by label text
   * @param {string} value - The label text of the option to select
   */
  async fill(value) {
    await this.find().selectOption({ label: value });
    return this;
  }
}
