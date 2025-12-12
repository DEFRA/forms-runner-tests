import { BaseFieldController } from "./base-field-controller.js";

/**
 * Controller for DeclarationField components (checkbox with declaration text).
 * Uses BaseFieldController but overrides methods for checkbox-specific behavior.
 */
export class DeclarationFieldController extends BaseFieldController {
  /**
   * @returns {import("@playwright/test").Locator}
   */
  findCheckbox() {
    return this.page.getByLabel("I understand and agree");
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
    await checkbox.check({ force: true, timeout: 5000 });
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
