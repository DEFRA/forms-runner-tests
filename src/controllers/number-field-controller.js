import { BaseFieldController } from "./base-field-controller.js";

/**
 * Controller for NumberField components.
 * Inherits find(), fill(), assertions(), clear(), getValue() from BaseFieldController.
 */
export class NumberFieldController extends BaseFieldController {
  /**
   * Get the current value as a number
   * @returns {Promise<number>}
   */
  async getNumericValue() {
    const value = await this.getValue();
    return parseFloat(value);
  }
}
