import { BaseFieldController } from "./base-field-controller.js";

/**
 * Controller for AutocompleteField components.
 * Overrides find() and fill() for autocomplete-specific behavior.
 */
export class AutocompleteFieldController extends BaseFieldController {
  /**
   * Find the autocomplete input element
   * @returns {import("@playwright/test").Locator}
   */
  find() {
    return this.page.locator(`input#${this.name}[role="combobox"]`);
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

    const label = value ?? this.list?.getFirstItem()?.text;
    if (!label) {
      throw new Error(
        "No autocomplete value provided and no list items available"
      );
    }

    // Clear any existing value and type the new one
    await input.clear();
    await input.fill(label);

    // Wait for the dropdown to appear and click the matching option
    const option = this.findOption(label);
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
}
