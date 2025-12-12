import RandExp from "randexp";
import { BaseFieldController } from "./base-field-controller.js";

/**
 * Controller for TextField components.
 * Overrides fill() to handle regex-based value generation.
 */
export class TextFieldController extends BaseFieldController {
  /**
   * Fill the text field with a value.
   * If a regex schema is defined, generates a matching value.
   * @param {string} value - The text to enter (may be overridden by regex)
   */
  async fill(value) {
    if (this.schema?.regex) {
      const regex = new RegExp(this.schema.regex);
      console.log(`Generating value matching regex: ${regex} and ${regex.source}`);
      const randExp = new RandExp(regex.source);
      const generatedValue = randExp.gen();
      console.log(`Generated value: ${generatedValue}`);
      await this.find().fill(generatedValue);
      return this;
    }
    await this.find().fill(value);
    return this;
  }
}
