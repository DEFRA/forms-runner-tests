import { test, expect } from '@playwright/test';
import allComponentsForm from './data/crop-form.json' with { type: 'json' };
import { ComponentsInitializer } from './helpers/components-mapper';

const componentData = {
  'DatePartsField': ['01', '01', '2000'],
  'RadiosField': ['Option 1'],
  'TextField': ['Sample text'],
  'NumberField': [8],
  'TelephoneNumberField': ['01234567890'],
  'OsGridRefField': ['SU123456'],
  'EastingNorthingField': ['123456', '654321'],
  'LatLongField': ['51.5074', '-0.1278'],
  'NationalGridFieldNumberField': ['NG1234 5678'],
  'UkAddressField': [{
    addressLine1: '10 Downing Street',
    addressLine2: '',
    townOrCity: 'London',
    postcode: 'SW1A 2AA'
  }],
  'EmailAddressField': ['test@example.com'],
  'DeclarationField': [],
};

/**
 * Find a page definition by its path
 * @param {string} path
 * @returns {object | undefined}
 */
function findPageByPath(path) {
  return allComponentsForm.pages.find(p => p.path === path);
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
    return pathname.slice(formPrefix.length) || '/';
  }
  return pathname;
}

test('Form poc test', async ({ page, baseURL }) => {
  const normalized = allComponentsForm.name.toLocaleLowerCase().replace(/\s+/g, '-');
  const startPage = allComponentsForm.pages[0].path;
  const formUrl = `${baseURL}/form/${normalized}${startPage}`;

  // Initialize stack with the first page URL
  const navigationStack = [formUrl];
  const visitedPaths = new Set();

  // Navigate to start page
  await page.goto(formUrl);
  await page.waitForLoadState('networkidle');

  // Check that the start page is displayed
  const startPageTitle = allComponentsForm.pages[0].title;
  if (startPageTitle) {
    await expect(page.getByRole('heading', { name: startPageTitle })).toBeVisible();
  }

  while (navigationStack.length > 0) {
    const currentUrl = navigationStack.pop();
    const currentPath = extractPathFromUrl(currentUrl, normalized);

    // Prevent infinite loops
    if (visitedPaths.has(currentPath)) {
      console.log(`Already visited ${currentPath}, skipping`);
      continue;
    }
    visitedPaths.add(currentPath);

    // Find the page definition for the current path
    const pageDef = findPageByPath(currentPath);
    if (!pageDef) {
      console.warn(`No page definition found for path: ${currentPath}`);
      break;
    }

    console.log(`Processing page: ${pageDef.title || pageDef.path}`);

    // Handle terminal page - test ends here
    if (pageDef.controller === 'TerminalPageController') {
      test.info().annotations.push({
        type: 'info',
        description: `Reached terminal page: ${pageDef.title || pageDef.path}`
      });
      break;
    }

    // Handle summary page - verify and submit
    if (pageDef.controller === 'SummaryPageWithConfirmationEmailController') {
      await expect(page.getByRole('heading', { name: 'Check your answers before sending your form' })).toBeVisible();
      await page.getByRole('button', { name: 'Send' }).click();
      await page.waitForLoadState('networkidle');
      break;
    }

    // Regular page - must have components
    const components = pageDef.components;
    if (!components || components.length === 0) {
      throw new Error(`No components found on page: ${pageDef.path}`);
    }

    const initializeComponents = components.map(componentDef => 
      ComponentsInitializer.initializeComponent(componentDef, page)
    );

    // Fill each component
    for (const component of initializeComponents) {
      if (component.type === 'RadiosField') {
        await component.selectFirstOption();
      } else if ('fill' in component && typeof component.fill === 'function') {
        await component.fill.apply(component, componentData[component.type]);
      }
    }

    // Submit and navigate to next page
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForLoadState('networkidle');

    // Get the new URL after navigation and push to stack
    const newUrl = page.url();
    const newPath = extractPathFromUrl(newUrl, normalized);

    if (newPath !== currentPath) {
      navigationStack.push(newUrl);
      console.log(`Navigated to: ${newPath}`);
    }
  }
});