// Controller exports
export { TextFieldController } from "./text-field-controller.js";
export { DatePartsFieldController } from "./date-parts-field-controller.js";
export { UkAddressFieldController } from "./uk-address-field-controller.js";
export { EastingNorthingFieldController } from "./easting-northing-field-controller.js";
export { OsGridRefFieldController } from "./os-grid-ref-field-controller.js";
export { NationalGridFieldNumberController } from "./national-grid-field-number-controller.js";
export { LatLongFieldController } from "./lat-long-field-controller.js";
export { TelephoneNumberFieldController } from "./telephone-number-field-controller.js";
export { EmailAddressFieldController } from "./email-address-field-controller.js";
export { DeclarationFieldController } from "./declaration-field-controller.js";
export { MarkdownController } from "./markdown-controller.js";
export { RadioFieldController } from "./radio-field-controller.js";
export { NumberFieldController } from "./number-field-controller.js";
export { ListController, List } from "./list-controller.js";

// Controller factory
import { TextFieldController } from "./text-field-controller.js";
import { DatePartsFieldController } from "./date-parts-field-controller.js";
import { UkAddressFieldController } from "./uk-address-field-controller.js";
import { EastingNorthingFieldController } from "./easting-northing-field-controller.js";
import { OsGridRefFieldController } from "./os-grid-ref-field-controller.js";
import { NationalGridFieldNumberController } from "./national-grid-field-number-controller.js";
import { LatLongFieldController } from "./lat-long-field-controller.js";
import { TelephoneNumberFieldController } from "./telephone-number-field-controller.js";
import { EmailAddressFieldController } from "./email-address-field-controller.js";
import { DeclarationFieldController } from "./declaration-field-controller.js";
import { MarkdownController } from "./markdown-controller.js";
import { RadioFieldController } from "./radio-field-controller.js";
import { NumberFieldController } from "./number-field-controller.js";

/**
 * Map of component types to their controller classes
 */
const CONTROLLER_MAP = {
  TextField: TextFieldController,
  DatePartsField: DatePartsFieldController,
  UkAddressField: UkAddressFieldController,
  EastingNorthingField: EastingNorthingFieldController,
  OsGridRefField: OsGridRefFieldController,
  NationalGridFieldNumberField: NationalGridFieldNumberController,
  LatLongField: LatLongFieldController,
  TelephoneNumberField: TelephoneNumberFieldController,
  EmailAddressField: EmailAddressFieldController,
  DeclarationField: DeclarationFieldController,
  Markdown: MarkdownController,
  RadiosField: RadioFieldController,
};

/**
 * Factory function to create a controller instance from a component definition
 *
 * @typedef {object} ComponentDefinition
 * @property {string} type - The component type
 * @property {string} [title] - Component title
 * @property {string} [name] - Component name
 * @property {string} [hint] - Component hint text
 * @property {string} [content] - Content (for Markdown/Declaration)
 * @property {object} [options] - Component options
 * @property {string} id - Component ID
 *
 * @param {ComponentDefinition} component - The component definition from JSON
 * @param {import("@playwright/test").Page} page - Playwright page object
 * @returns {object|null} - Controller instance or null if type not supported
 */
export function createController(component, page) {
  const ControllerClass = CONTROLLER_MAP[component.type];

  if (!ControllerClass) {
    console.warn(`No controller found for component type: ${component.type}`);
    return null;
  }

  return new ControllerClass({
    title: component.title,
    page,
    name: component.name,
    hint: component.hint,
    content: component.content,
    options: component.options,
    id: component.id,
  });
}

/**
 * Create controllers for all components in a page definition
 *
 * @param {object} pageDefinition - Page definition containing components array
 * @param {import("@playwright/test").Page} page - Playwright page object
 * @returns {object[]} - Array of controller instances
 */
export function createControllersForPage(pageDefinition, page) {
  if (!pageDefinition.components) {
    return [];
  }

  return pageDefinition.components
    .map((component) => createController(component, page))
    .filter((controller) => controller !== null);
}

/**
 * Create controllers for all components across all pages in a form definition
 *
 * @param {object} formDefinition - Form definition containing pages array
 * @param {import("@playwright/test").Page} page - Playwright page object
 * @returns {Map<string, object[]>} - Map of page paths to their controller arrays
 */
export function createControllersForForm(formDefinition, page) {
  const controllersMap = new Map();

  for (const pageDefinition of formDefinition.pages) {
    const controllers = createControllersForPage(pageDefinition, page);
    controllersMap.set(pageDefinition.path, controllers);
  }

  return controllersMap;
}

/**
 * Get list of supported component types
 * @returns {string[]}
 */
export function getSupportedComponentTypes() {
  return Object.keys(CONTROLLER_MAP);
}
