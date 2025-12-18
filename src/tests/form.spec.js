import { readFile } from "node:fs/promises";
import path from "node:path";

import { test, expect } from "@playwright/test";

import { ComponentsInitializer } from "../helpers/components-mapper";

const allComponentsForm = JSON.parse(
  await readFile(new URL("../data/unicorn.json", import.meta.url), "utf8")
);
// test data for each component type
const componentData = {
  DatePartsField: ["01", "01", "2000"],
  RadiosField: ["Option 1"],
  TextField: ["Sample text"],
  YesNoField: ["Yes"],
  NumberField: [8],
  TelephoneNumberField: ["01234567890"],
  OsGridRefField: ["SU123456"],
  EastingNorthingField: ["123456", "654321"],
  LatLongField: ["51.5074", "-0.1278"],
  NationalGridFieldNumberField: ["NG1234 5678"],
  UkAddressField: [
    {
      addressLine1: "10 Downing Street",
      addressLine2: "",
      townOrCity: "London",
      postcode: "SW1A 2AA",
    },
  ],
  EmailAddressField: ["test@example.com"],
  AutocompleteField: [],
  DeclarationField: [],
  SelectField: [],
  CheckboxesField: [],
  MultilineTextField: ["This is sample multiline text for testing purpose."],
  FileUploadField: [
    path.resolve(new URL("../data/sample-file.pdf", import.meta.url).pathname),
  ],
};

// UUID regex pattern
const UUID_PATTERN =
  /^(.+)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// RepeatPageControllerSummary
const REPEAT_SUMMARY_PATTERN = /^(.+)\/summary$/;

/**
 * @param {string} path
 * @returns {object | undefined}
 */
function findPageByPath(path) {
  let pageDef = allComponentsForm.pages.find((p) => p.path === path);

  // could be repeat page with UUID?
  if (!pageDef) {
    const uuidMatch = path.match(UUID_PATTERN);
    if (uuidMatch) {
      const basePath = uuidMatch[1];
      pageDef = allComponentsForm.pages.find((p) => p.path === basePath);
    }
  }

  // could be summary?
  if (!pageDef) {
    const summaryMatch = path.match(REPEAT_SUMMARY_PATTERN);
    if (summaryMatch) {
      const basePath = summaryMatch[1];
      pageDef = allComponentsForm.pages.find((p) => p.path === basePath);
    }
  }

  return pageDef;
}

/**
 * Check if a path is a repeat page summary (ends with /summary under a repeat page)
 * @param {string} path
 * @returns {boolean}
 */
function isRepeatSummaryPath(path) {
  if (!REPEAT_SUMMARY_PATTERN.test(path)) {
    return false;
  }
  const basePath = path.replace(/\/summary$/, "");
  const pageDef = allComponentsForm.pages.find((p) => p.path === basePath);
  return pageDef?.controller === "RepeatPageController";
}

/**
 * Check if a path is a repeat page instance (has UUID suffix)
 * @param {string} path
 * @returns {boolean}
 */
function isRepeatPageInstance(path) {
  return UUID_PATTERN.test(path);
}

/**
 * Extract the path from a full URL
 * @param {string} url
 * @param {string} formSlug
 * @returns {string}
 */
function extractPathFromUrl(url, formSlug) {
  const formPrefix = `/form/${formSlug}`;
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  if (pathname.startsWith(formPrefix)) {
    return pathname.slice(formPrefix.length) || "/";
  }
  return pathname;
}

const normalized = allComponentsForm.name
  .toLocaleLowerCase()
  .replace(/[()]/g, "") // Remove parentheses
  .replace(/\s+/g, "-"); // Replace spaces with hyphens
const formName = allComponentsForm.name;
test(`${formName} tests`, async ({ page, baseURL }) => {
  test.setTimeout(120000); // 2 minutes
  const startPage = allComponentsForm.pages[0].path;
  const formUrl = `${baseURL}/form/${normalized}${startPage}`;

  // Initialize stack with the first page URL
  const navigationStack = [formUrl];
  const visitedPaths = new Set();

  // Navigate to start page
  await page.goto(formUrl);
  await page.waitForLoadState("networkidle");

  // Check that the start page is displayed
  const startPageTitle = allComponentsForm.pages[0].title;
  if (startPageTitle) {
    await expect(
      page.getByRole("heading", { name: startPageTitle })
    ).toBeVisible();
  }

  while (navigationStack.length > 0) {
    const currentUrl = navigationStack.pop();
    const currentPath = extractPathFromUrl(currentUrl, normalized);

    // For repeat pages with UUID, use base path for visited tracking
    // But allow visiting the same repeat page base path with different UUIDs
    const basePathForTracking = isRepeatPageInstance(currentPath)
      ? currentPath // Use full path with UUID to allow multiple repeat instances
      : currentPath;

    // Prevent infinite loops
    if (visitedPaths.has(basePathForTracking)) {
      console.log(`Already visited ${basePathForTracking}, skipping`);
      continue;
    }
    visitedPaths.add(basePathForTracking);

    // Find the page definition for the current path
    const pageDef = findPageByPath(currentPath);
    console.log(
      `Processing page path: ${currentPath} Page definition found: ${!!pageDef}`
    );
    if (!pageDef) {
      console.warn(`No page definition found for path: ${currentPath}`);
      break;
    }

    console.log(`Processing page: ${pageDef.title || pageDef.path}`);

    // Handle terminal page - test ends here
    if (pageDef.controller === "TerminalPageController") {
      test.info().annotations.push({
        type: "info",
        description: `Reached terminal page: ${pageDef.title || pageDef.path}`,
      });
      console.log("Reached terminal page, ending test.");
      break;
    }

    // Handle main form summary page - verify and submit
    if (pageDef.controller === "SummaryPageWithConfirmationEmailController") {
      const headingText =
        pageDef.title?.length > 0
          ? pageDef.title
          : "Check your answers before sending your form";
      await expect(
        page.getByRole("heading", { name: headingText })
      ).toBeVisible();
      await page.getByRole("button", { name: buttonText(pageDef) }).click();
      await page.waitForLoadState("networkidle");
      break;
    }

    //provide-details-about-your-wildlife-related-or-animal-welfare-offence/summary
    if (isRepeatSummaryPath(currentPath)) {
      console.log(
        "On repeat controller summary page, clicking Continue to proceed"
      );
      const addAnotherButton = page.getByRole("button", {
        name: /add another/i,
      });
      if ((await addAnotherButton.count()) > 0) {
        // We're on the repeat summary - click Continue to proceed
        await page.getByRole("button", { name: "Continue" }).click();
        await page.waitForLoadState("networkidle");

        const newUrl = page.url();
        const newPath = extractPathFromUrl(newUrl, normalized);
        if (newPath !== currentPath) {
          navigationStack.push(newUrl);
          console.log(
            `Navigated from repeat controller summary to: ${newPath}`
          );
        }
        continue; // no need to go ahead
      }
    }

    const isRepeatSummaryPage =
      (await page.getByRole("button", { name: /add another/i }).count()) > 0;
    if (isRepeatSummaryPage && !isRepeatPageInstance(currentPath)) {
      console.log("On repeat summary page, clicking Continue to proceed");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.waitForLoadState("networkidle");

      const newUrl = page.url();
      const newPath = extractPathFromUrl(newUrl, normalized);
      if (newPath !== currentPath) {
        navigationStack.push(newUrl);
        console.log(`Navigated from repeat summary to: ${newPath}`);
      }
      continue;
    }

    // Regular page - must have components
    const components = pageDef.components;
    if (!components || components.length === 0) {
      throw new Error(`No components found on page: ${pageDef.path}`);
    }

    const initializeComponents = components.map((componentDef) =>
      ComponentsInitializer.initializeComponent(
        componentDef,
        page,
        allComponentsForm.lists,
        allComponentsForm.conditions
      )
    );

    console.log(
      `Initialized ${initializeComponents.length} components on page: ${pageDef.path}`
    );
    // Fill each component
    for (const component of initializeComponents) {
      if (component.type === "FileUploadField") {
        // Handle file upload separately - must check before generic fill
        const filePaths = componentData["FileUploadField"];
        if (filePaths && filePaths.length > 0) {
          await component.uploadFile(filePaths[0]);
          await component.clickUploadButton();
        }
      } else if (component.type === "RadiosField") {
        await component.selectFirstOption();
      } else if (component.type === "YesNoField") {
        await component.selectOption.apply(
          component,
          componentData[component.type]
        );
      } else if ("fill" in component && typeof component.fill === "function") {
        await component.fill.apply(component, componentData[component.type]);
      }
    }

    await page.waitForLoadState("networkidle");
    // Submit and navigate to next page
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForLoadState("networkidle");
    // ther should be no validation errors
    const errorSummary = page.getByRole("alert");
    await expect(errorSummary.getByText("There is a problem")).toHaveCount(0);
    const errorCount = await errorSummary.count();
    expect(errorCount).toBe(0);

    // Get the new URL after navigation and push to stack
    const newUrl = page.url();
    const newPath = extractPathFromUrl(newUrl, normalized);
    console.log(`Navigate to: ${newPath} from ${currentPath} `);

    if (newPath !== currentPath) {
      navigationStack.push(newUrl);
      console.log(`Navigated to: ${newPath}`);
    }
  }
});

/**
 *
 * @param {object} summaryPageDef
 * @returns {string}
 */
function buttonText(summaryPageDef) {
  if (
    summaryPageDef.components &&
    summaryPageDef.components.some((component) => component.type === "Markdown")
  ) {
    return "Accept and send";
  } else {
    return "send";
  }
}
