import * as Controllers from "../controllers/index";

export const componentsMapper = {
  TextField: Controllers.TextFieldController,
  DatePartsField: Controllers.DatePartsFieldController,
  UkAddressField: Controllers.UkAddressFieldController,
  EastingNorthingField: Controllers.EastingNorthingFieldController,
  OsGridRefField: Controllers.OsGridRefFieldController,
  NationalGridFieldNumberField: Controllers.NationalGridFieldNumberController,
  LatLongField: Controllers.LatLongFieldController,
  TelephoneNumberField: Controllers.TelephoneNumberFieldController,
  EmailAddressField: Controllers.EmailAddressFieldController,
  DeclarationField: Controllers.DeclarationFieldController,
  Markdown: Controllers.MarkdownController,
  RadiosField: Controllers.RadioFieldController,
  NumberField: Controllers.NumberFieldController,
  // Add other component mappings here
};

/**
 *  @typedef {object} EmailAddressFieldDefinition
 *  @property {string} type
 *  @property {string} title
 *  @property {string} name
 *  @property {string} hint
 *  @property {object} options
 *  @property {string} id
 *
 * @typedef {object} TextFieldDefinition
 * @property {string} type
 * @property {string} title
 * @property {string} name
 * @property {string} hint
 * @property {object} options
 * @property {string} id
 */

export class ComponentsInitializer {
  /**
   *
   * @param {*} componentDefinition
   * @param {import('@playwright/test').Page} page
   * @returns typeof
   */
  static initializeComponent(componentDefinition, page) {
    const ComponentClass = componentsMapper[componentDefinition.type];
    if (!ComponentClass) {
      throw new Error(
        `Unsupported component type: ${componentDefinition.type}`
      );
    }
    /**
     *  @type {.}
     */
    return new ComponentClass({
      ...componentDefinition,
      page,
    });
  }
}
