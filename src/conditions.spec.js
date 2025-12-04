import { test, expect } from '@playwright/test';
import form from './data/crop-compound-conditions.json' with { type: 'json' };
import { ComponentsInitializer } from './helpers/components-mapper';
import { createConditionsForForm } from './conditions';

const componentData = {
  'DatePartsField': ['01', '01', '2000'],
  'TextField': ['Sample text'],
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
  return form.pages.find(p => p.path === path);
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

const conditions = createConditionsForForm(form);
const conditionIds = [...conditions.keys()];
console.log(`Total conditions loaded: ${conditionIds.length}`);
console.log(`Condition IDs: ${conditionIds.join(', ')}`);
conditionIds.forEach(id => {
  test(`Testing condition ${conditions.get(id).name} of form ${form.name}`, async ({ page, baseURL }) => {
    const condition = conditions.get(id);
    const normalized = form.name.toLocaleLowerCase().replace(/\s+/g, '-');
    const startPage = form.pages[0].path;
    const formUrl = `${baseURL}/form/${normalized}${startPage}`;
    
    // Add initial annotation with condition info
    test.info().annotations.push({
      type: 'condition-info',
      description: `Testing: ${condition.name} | Component: ${condition.componentId} | Trigger: ${condition.triggerValue}`
    });

    // Initialize stack with the first page URL
    const navigationStack = [formUrl];
    const visitedPaths = new Set();

    // Navigate to start page
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');
    let currentCondition = null;
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
      if (currentCondition) {
        const conditionMatched = pageDef?.condition === currentCondition.id;
        expect(conditionMatched).toBeTruthy();
        test.info().annotations.push({
          type: 'condition-check',
          description: `Condition "${currentCondition.name}" ${conditionMatched ? '✓ correctly triggered' : '✗ NOT triggered'} → navigated to ${currentPath}`
        });
        currentCondition = null;
      }
      if (!pageDef) {
        console.warn(`No page definition found for path: ${currentPath}`);
        break;
      }

      console.log(`Processing page: ${pageDef.title || pageDef.path}`);
      
      // Add annotation for each page visited
      test.info().annotations.push({
        type: 'page-visit',
        description: `Page: ${pageDef.title || pageDef.path} (${currentPath})`
      });

      // Handle terminal page - test ends here
      if (pageDef.controller === 'TerminalPageController') {
        test.info().annotations.push({
          type: 'info',
          description: `Reached terminal page: ${pageDef.title || pageDef.path}`
        });
        expect(page.getByRole('button',{name:'Continue'})).toHaveCount(0);
        break;
      }

      // Handle summary page - verify and submit
      if (pageDef.controller === 'SummaryPageWithConfirmationEmailController') {
        await expect(page.getByRole('heading', { name: 'Check your answers before sending your form' })).toBeVisible();
        await page.getByRole('button', { name: 'Send' }).click();
        await page.waitForLoadState('networkidle');
        break;
      }

      // Process components on this page
      const components = pageDef.components ?? [];
      const initializeComponents = components.map(compDef => 
        ComponentsInitializer.initializeComponent(compDef, page)
      );

      for (const component of initializeComponents) {
        let triggerValue;
        if (condition?.componentId === component.id) {
            console.log(`Condition name ${condition.name} trigger value: ${condition.triggerValue}`);
          triggerValue = [condition.triggerValue];
         currentCondition = condition;
        }
        const value = componentData[component.type] || [];

        if (component.type === 'RadiosField') {
          if (triggerValue) {
            await component.selectOption(triggerValue[0]);
          } else {
            await component.selectFirstOption();
          }
        } else if ('fill' in component && typeof component.fill === 'function') {
          await component.fill.apply(component, triggerValue ?? value);
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
});
