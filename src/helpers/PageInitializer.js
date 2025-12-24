import { ComponentsInitializer } from "./components-mapper";

// UUID regex pattern (repeat page instances often append a UUID)
const UUID_PATTERN =
  /^(.+)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// RepeatPageControllerSummary (repeat summary pages end with /summary)
const REPEAT_SUMMARY_PATTERN = /^(.+)\/summary$/;

/**
 * Normalize a form name to the runner slug format.
 * Mirrors existing behavior in tests.
 * @param {string} formName Form name from the form definition.
 * @returns {string} Normalized slug used in form URLs.
 */
export function normalizeFormName(formName) {
  return formName.toLocaleLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-");
}

/**
 * Extract the path from a full URL for a given form slug.
 * @param {string} url Full URL string.
 * @param {string} formSlug Normalized form slug.
 * @returns {string} Path within the form journey (e.g. "/where-do-you-live").
 */
export function extractPathFromUrl(url, formSlug) {
  const formPrefix = `/form/${formSlug}`;
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  if (pathname.startsWith(formPrefix)) {
    return pathname.slice(formPrefix.length) || "/";
  }

  return pathname;
}

/**
 * Check if a path is a repeat page instance (has UUID suffix)
 * @param {string} path Path portion of a form URL.
 * @returns {boolean} True if the path ends with a UUID segment.
 */
export function isRepeatPageInstance(path) {
  return UUID_PATTERN.test(path);
}

/**
 * Find the page definition for a path, including repeat UUID instances and repeat summaries.
 * @param {object} form Form definition JSON.
 * @param {string} path Path portion of a form URL.
 * @returns {object | undefined} Matching page definition.
 */
export function findPageByPath(form, path) {
  let pageDef = form.pages.find((p) => p.path === path);

  // could be repeat page with UUID?
  if (!pageDef) {
    const uuidMatch = path.match(UUID_PATTERN);
    if (uuidMatch) {
      const basePath = uuidMatch[1];
      pageDef = form.pages.find((p) => p.path === basePath);
    }
  }

  // could be summary?
  if (!pageDef) {
    const summaryMatch = path.match(REPEAT_SUMMARY_PATTERN);
    if (summaryMatch) {
      const basePath = summaryMatch[1];
      pageDef = form.pages.find((p) => p.path === basePath);
    }
  }

  return pageDef;
}

/**
 * Check if a path is a repeat page summary (ends with /summary under a repeat page)
 * @param {object} form Form definition JSON.
 * @param {string} path Path portion of a form URL.
 * @returns {boolean} True if the path is a repeat-page summary.
 */
export function isRepeatSummaryPath(form, path) {
  if (!REPEAT_SUMMARY_PATTERN.test(path)) {
    return false;
  }

  const basePath = path.replace(/\/summary$/, "");
  const pageDef = form.pages.find((p) => p.path === basePath);
  return pageDef?.controller === "RepeatPageController";
}

/**
 * Initialize component helpers for a page definition.
 * @param {object} pageDef Page definition from the form JSON.
 * @param {import('@playwright/test').Page} page Playwright page instance.
 * @param {object} options Optional mapper context.
 * @param {object} [options.lists] Lists from the form definition.
 * @param {object} [options.conditions] Conditions from the form definition.
 * @returns {Promise<Array<import('../controllers/base-field-controller.js').BaseFieldController>>} Initialized controllers.
 */
export async function initializeComponentsForPage(pageDef, page, options = {}) {
  const { lists, conditions } = options;

  const components = pageDef.components;
  if (!components || components.length === 0) {
    throw new Error(`No components found on page: ${pageDef.path}`);
  }

  return components.map((componentDef) =>
    ComponentsInitializer.initializeComponent(
      componentDef,
      page,
      lists,
      conditions
    )
  );
}

/**
 * Fill initialized components with provided test data.
 * Special-cases some component types with bespoke helper methods.
 * @param {Array<import('../controllers/base-field-controller.js').BaseFieldController>} initializedComponents Controllers to fill.
 * @param {Record<string, unknown>} componentData Test data keyed by component type.
 */
export async function fillInitializedComponents(
  initializedComponents,
  componentData
) {
  for (const component of initializedComponents) {
    if (component.type === "FileUploadField") {
      const filePaths = componentData?.FileUploadField;
      if (filePaths && filePaths.length > 0) {
        await component.uploadFile(filePaths[0]);
        await component.clickUploadButton();
      }
      continue;
    }

    if (component.type === "RadiosField") {
      await component.selectFirstOption();
      continue;
    }

    if (component.type === "YesNoField") {
      await component.selectOption.apply(
        component,
        componentData[component.type]
      );
      continue;
    }

    if ("fill" in component && typeof component.fill === "function") {
      await component.fill.apply(component, componentData[component.type]);
    }
  }
}
