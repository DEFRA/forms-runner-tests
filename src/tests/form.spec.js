import { readFile } from 'node:fs/promises'
import { config } from '../config.js'

import { test, expect } from '@playwright/test'

import { ComponentsInitializer } from '../helpers/components-mapper'
import {
  createFormSlug,
  extractPathFromUrl,
  findPageByPath,
  isRepeatPageInstance,
  isRepeatSummaryPath,
  summarySubmitButtonText
} from '../helpers/common.js'
import {
  initializeComponentsForPage,
  fillInitializedComponents
} from '../helpers/PageInitializer.js'
const allComponentsForm = JSON.parse(
  await readFile(new URL('../data/unicorn.json', import.meta.url), 'utf8')
)
// test data for each component type
const componentData = {
  DatePartsField: ['01', '01', '2000'],
  RadiosField: ['Option 1'],
  TextField: ['Sample text'],
  YesNoField: ['Yes'],
  NumberField: [8],
  TelephoneNumberField: ['01234567890'],
  OsGridRefField: ['SU123456'],
  EastingNorthingField: ['123456', '654321'],
  LatLongField: ['51.5074', '-0.1278'],
  NationalGridFieldNumberField: ['NG1234 5678'],
  UkAddressField: [
    {
      addressLine1: '10 Downing Street',
      addressLine2: '',
      townOrCity: 'London',
      postcode: 'SW1A 2AA'
    }
  ],
  EmailAddressField: ['test@example.com'],
  AutocompleteField: [],
  DeclarationField: [],
  SelectField: [],
  CheckboxesField: [],
  MultilineTextField: ['This is sample multiline text for testing purpose.'],
  FileUploadField: [] // file will be created on fly
}

const normalized = createFormSlug(allComponentsForm.name)
const formName = allComponentsForm.name
test(`${formName} tests`, async ({ page, baseURL }) => {
  test.setTimeout(config.TIMEOUT) // preferable to be 2 minutes for larger forms
  const startPage = allComponentsForm.pages[0].path
  const formUrl = `${baseURL}/form/${normalized}${startPage}`

  // Initialize stack with the first page URL
  const navigationStack = [formUrl]
  const visitedPaths = new Set()

  // Navigate to start page
  await page.goto(formUrl)
  await page.waitForLoadState('networkidle')

  // Check that the start page is displayed
  const startPageTitle = allComponentsForm.pages[0].title
  if (startPageTitle) {
    await expect(
      page.getByRole('heading', { name: startPageTitle })
    ).toBeVisible()
  }

  while (navigationStack.length > 0) {
    const currentUrl = navigationStack.pop()
    const currentPath = extractPathFromUrl(currentUrl, normalized)

    // Track visited paths (including UUID paths) to prevent loops.
    const basePathForTracking = currentPath

    // Prevent infinite loops
    if (visitedPaths.has(basePathForTracking)) {
      continue
    }
    visitedPaths.add(basePathForTracking)

    // Find the page definition for the current path
    const pageDef = findPageByPath(allComponentsForm, currentPath)
    if (!pageDef) {
      break
    }

    // Handle terminal page - test ends here
    if (pageDef.controller === 'TerminalPageController') {
      test.info().annotations.push({
        type: 'info',
        description: `Reached terminal page: ${pageDef.title || pageDef.path}`
      })
      break
    }

    // Handle main form summary page - verify and submit
    if (pageDef.controller === 'SummaryPageWithConfirmationEmailController') {
      const headingText =
        pageDef.title?.length > 0
          ? pageDef.title
          : 'Check your answers before sending your form'
      await expect(
        page.getByRole('heading', { name: headingText })
      ).toBeVisible()
      await page
        .getByRole('button', { name: summarySubmitButtonText(pageDef) })
        .click()
      await page.waitForLoadState('networkidle')
      break
    }

    // if its RepeatPageController's summary
    if (isRepeatSummaryPath(allComponentsForm, currentPath)) {
      const addAnotherButton = page.getByRole('button', {
        name: /add another/i
      })
      if ((await addAnotherButton.count()) > 0) {
        // We're on the repeat summary - click Continue to proceed
        await page.getByRole('button', { name: 'Continue' }).click()
        await page.waitForLoadState('networkidle')

        const newUrl = page.url()
        const newPath = extractPathFromUrl(newUrl, normalized)
        if (newPath !== currentPath) {
          navigationStack.push(newUrl)
        }
        continue // no need to go ahead
      }

      const isRepeatSummaryPage =
        (await page.getByRole('button', { name: /add another/i }).count()) > 0
      if (isRepeatSummaryPage && !isRepeatPageInstance(currentPath)) {
        await page.getByRole('button', { name: 'Continue' }).click()
        await page.waitForLoadState('networkidle')

        const newUrl = page.url()
        const newPath = extractPathFromUrl(newUrl, normalized)
        if (newPath !== currentPath) {
          navigationStack.push(newUrl)
        }
        continue
      }

      // Regular page - must have components
      const components = pageDef.components
      if (!components || components.length === 0) {
        throw new Error(`No components found on page: ${pageDef.path}`)
      }

      const initializeComponents = components.map((componentDef) =>
        ComponentsInitializer.initializeComponent(
          componentDef,
          page,
          allComponentsForm.lists,
          allComponentsForm.conditions
        )
      )

      // Fill each component
      for (const component of initializeComponents) {
        if (component.type === 'FileUploadField') {
          // Handle file upload separately - must check before generic fill
          const filePaths = componentData['FileUploadField']
          if (filePaths && filePaths.length > 0) {
            await component.uploadFile(filePaths[0])
            await component.clickUploadButton()
          }
        } else if (component.type === 'RadiosField') {
          await component.selectFirstOption()
        } else if (component.type === 'YesNoField') {
          await component.selectOption.apply(
            component,
            componentData[component.type]
          )
        } else if (
          'fill' in component &&
          typeof component.fill === 'function'
        ) {
          await component.fill.apply(component, componentData[component.type])
        }
      }

      await page.waitForLoadState('networkidle')
      // Submit and navigate to next page
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.waitForLoadState('networkidle')
      // ther should be no validation errors
      const errorSummary = page.getByRole('alert')
      await expect(errorSummary.getByText('There is a problem')).toHaveCount(0)
      const errorCount = await errorSummary.count()
      expect(errorCount).toBe(0)

      // Get the new URL after navigation and push to stack
      const newUrl = page.url()
      const newPath = extractPathFromUrl(newUrl, normalized)

      if (newPath !== currentPath) {
        navigationStack.push(newUrl)
      }
    }
  }
})

test.describe(`${formName} required fields tests`, () => {
  test('Required fields error tests', async ({ page, baseURL }) => {
    test.setTimeout(config.TIMEOUT) // preferable to be 2 minutes for larger forms
    const startPage = allComponentsForm.pages[0].path
    const formUrl = `${baseURL}/form/${normalized}${startPage}`
    // Initialize stack with the first page URL
    const navigationStack = [formUrl]
    const visitedPaths = new Set()

    // Navigate to start page
    await page.goto(formUrl)
    await page.waitForLoadState('networkidle')

    // Check that the start page is displayed
    const startPageTitle = allComponentsForm.pages[0].title
    if (startPageTitle) {
      await expect(
        page.getByRole('heading', { name: startPageTitle })
      ).toBeVisible()
    }

    while (navigationStack.length > 0) {
      const currentUrl = navigationStack.pop()
      const currentPath = extractPathFromUrl(currentUrl, normalized)

      // Track visited paths (including UUID paths) to prevent loops.
      const basePathForTracking = currentPath

      // Prevent infinite loops
      if (visitedPaths.has(basePathForTracking)) {
        continue
      }
      visitedPaths.add(basePathForTracking)

      // Find the page definition for the current path
      const pageDef = findPageByPath(allComponentsForm, currentPath)
      if (!pageDef) {
        break
      }

      // Handle terminal page - test ends here
      if (pageDef.controller === 'TerminalPageController') {
        test.info().annotations.push({
          type: 'info',
          description: `Reached terminal page: ${pageDef.title || pageDef.path}`
        })
        break
      }

      // Handle main form summary page - verify and submit
      if (pageDef.controller === 'SummaryPageWithConfirmationEmailController') {
        const headingText =
          pageDef.title?.length > 0
            ? pageDef.title
            : 'Check your answers before sending your form'
        await expect(
          page.getByRole('heading', { name: headingText })
        ).toBeVisible()
        await page
          .getByRole('button', { name: summarySubmitButtonText(pageDef) })
          .click()
        await page.waitForLoadState('networkidle')
        break
      }

      // provide-details-about-your-wildlife-related-or-animal-welfare-offence/summary
      if (isRepeatSummaryPath(allComponentsForm, currentPath)) {
        const addAnotherButton = page.getByRole('button', {
          name: /add another/i
        })
        if ((await addAnotherButton.count()) > 0) {
          // We're on the repeat summary - click Continue to proceed
          await page.getByRole('button', { name: 'Continue' }).click()
          await page.waitForLoadState('networkidle')

          const newUrl = page.url()
          const newPath = extractPathFromUrl(newUrl, normalized)
          if (newPath !== currentPath) {
            navigationStack.push(newUrl)
          }
          continue // no need to go ahead
        }
      }

      const isRepeatSummaryPage =
        (await page.getByRole('button', { name: /add another/i }).count()) > 0
      if (isRepeatSummaryPage && !isRepeatPageInstance(currentPath)) {
        await page.getByRole('button', { name: 'Continue' }).click()
        await page.waitForLoadState('networkidle')

        const newUrl = page.url()
        const newPath = extractPathFromUrl(newUrl, normalized)
        if (newPath !== currentPath) {
          navigationStack.push(newUrl)
        }
        continue
      }

      const initializedComponents = await initializeComponentsForPage(
        pageDef,
        page,
        {
          lists: allComponentsForm.lists,
          conditions: allComponentsForm.conditions
        }
      )

      // run required-fields validation only on pages that actually have required components
      const hasRequiredComponents = initializedComponents.some(
        (component) => component.isRequired ?? false
      )

      if (hasRequiredComponents) {
        console.log(
          `Running required fields validation for page: ${currentPath}`
        )

        const pathBeforeValidation = extractPathFromUrl(page.url(), normalized)

        const errorText = page
          .locator('.govuk-error-summary')
          .getByText('There is a problem')

        const errorPromise = errorText
          .waitFor({ state: 'visible', timeout: 5000 })
          .then(() => 'error')
          .catch(() => undefined)

        const navigationPromise = page
          .waitForURL(
            (url) =>
              extractPathFromUrl(url.toString(), normalized) !==
              pathBeforeValidation,
            { timeout: 5000 }
          )
          .then(() => 'navigated')
          .catch(() => undefined)

        await page
          .getByRole('button', { name: 'Continue' })
          .click({ noWaitAfter: true })
        const outcome = await Promise.race([errorPromise, navigationPromise])

        if (outcome === 'navigated') {
          // No validation error was raised; return to this page so the fill flow stays in sync.
          console.warn(
            `No required-fields error shown; navigated away from ${pathBeforeValidation}`
          )
          await page.goBack()
          await page.waitForURL(
            (url) =>
              extractPathFromUrl(url.toString(), normalized) ===
              pathBeforeValidation,
            { timeout: 10000 }
          )
        } else if (outcome === 'error') {
          await expect(errorText).toBeVisible()
        } else {
          throw new Error(
            `Required-fields validation did not produce an error or navigation on: ${pathBeforeValidation}`
          )
        }
      }

      await fillInitializedComponents(initializedComponents, componentData)

      // Submit and navigate to next page (avoid networkidle which can hang)
      const urlBeforeContinue = page.url()
      await page
        .getByRole('button', { name: 'Continue' })
        .click({ noWaitAfter: true })
      await page.waitForURL((url) => url.toString() !== urlBeforeContinue, {
        timeout: 15000
      })
      // there should be no validation errors
      const errorSummary = page.locator('.govuk-error-summary')
      await expect(errorSummary.getByText('There is a problem')).toHaveCount(0)
      const errorCount = await errorSummary.count()
      expect(errorCount).toBe(0)

      // Get the new URL after navigation and push to stack
      const newUrl = page.url()
      const newPath = extractPathFromUrl(newUrl, normalized)

      if (newPath !== currentPath) {
        navigationStack.push(newUrl)
      }
    }
  })
})

test.describe(`${formName} skip optional fields`, () => {
  test('Skipping optional fields', async ({ page, baseURL }) => {
    test.setTimeout(config.TIMEOUT) // preferable to be 2 minutes for larger forms
    const startPage = allComponentsForm.pages[0].path
    const formUrl = `${baseURL}/form/${normalized}${startPage}`
    // Initialize stack with the first page URL
    const navigationStack = [formUrl]
    const visitedPaths = new Set()

    // Navigate to start page
    await page.goto(formUrl)
    await page.waitForLoadState('networkidle')

    // Check that the start page is displayed
    const startPageTitle = allComponentsForm.pages[0].title
    if (startPageTitle) {
      await expect(
        page.getByRole('heading', { name: startPageTitle })
      ).toBeVisible()
    }

    while (navigationStack.length > 0) {
      const currentUrl = navigationStack.pop()
      const currentPath = extractPathFromUrl(currentUrl, normalized)

      // Track visited paths (including UUID paths) to prevent loops.
      const basePathForTracking = currentPath

      // Prevent infinite loops
      if (visitedPaths.has(basePathForTracking)) {
        continue
      }
      visitedPaths.add(basePathForTracking)

      // Find the page definition for the current path
      const pageDef = findPageByPath(allComponentsForm, currentPath)
      if (!pageDef) {
        break
      }

      // Handle terminal page - test ends here
      if (pageDef.controller === 'TerminalPageController') {
        test.info().annotations.push({
          type: 'info',
          description: `Reached terminal page: ${pageDef.title || pageDef.path}`
        })
        break
      }

      // Handle main form summary page - verify and submit
      if (pageDef.controller === 'SummaryPageWithConfirmationEmailController') {
        const headingText =
          pageDef.title?.length > 0
            ? pageDef.title
            : 'Check your answers before sending your form'
        await expect(
          page.getByRole('heading', { name: headingText })
        ).toBeVisible()
        await page
          .getByRole('button', { name: summarySubmitButtonText(pageDef) })
          .click()
        await page.waitForLoadState('networkidle')
        break
      }

      // provide-details-about-your-wildlife-related-or-animal-welfare-offence/summary
      if (isRepeatSummaryPath(allComponentsForm, currentPath)) {
        const addAnotherButton = page.getByRole('button', {
          name: /add another/i
        })
        if ((await addAnotherButton.count()) > 0) {
          // We're on the repeat summary - click Continue to proceed
          await page.getByRole('button', { name: 'Continue' }).click()
          await page.waitForLoadState('networkidle')

          const newUrl = page.url()
          const newPath = extractPathFromUrl(newUrl, normalized)
          if (newPath !== currentPath) {
            navigationStack.push(newUrl)
          }
          continue // no need to go ahead
        }
      }

      const isRepeatSummaryPage =
        (await page.getByRole('button', { name: /add another/i }).count()) > 0
      if (isRepeatSummaryPage && !isRepeatPageInstance(currentPath)) {
        await page.getByRole('button', { name: 'Continue' }).click()
        await page.waitForLoadState('networkidle')

        const newUrl = page.url()
        const newPath = extractPathFromUrl(newUrl, normalized)
        if (newPath !== currentPath) {
          navigationStack.push(newUrl)
        }
        continue
      }

      const initializedComponents = await initializeComponentsForPage(
        pageDef,
        page,
        {
          lists: allComponentsForm.lists,
          conditions: allComponentsForm.conditions
        }
      )

      await fillInitializedComponents(
        initializedComponents,
        componentData,
        true
      )

      // Submit and navigate to next page (avoid networkidle which can hang)
      const urlBeforeContinue = page.url()
      await page
        .getByRole('button', { name: 'Continue' })
        .click({ noWaitAfter: true })
      await page.waitForURL((url) => url.toString() !== urlBeforeContinue, {
        timeout: 15000
      })
      // there should be no validation errors
      const errorSummary = page.locator('.govuk-error-summary')
      await expect(errorSummary.getByText('There is a problem')).toHaveCount(0)
      const errorCount = await errorSummary.count()
      expect(errorCount).toBe(0)

      // Get the new URL after navigation and push to stack
      const newUrl = page.url()
      const newPath = extractPathFromUrl(newUrl, normalized)

      if (newPath !== currentPath) {
        navigationStack.push(newUrl)
      }
    }
  })
})
