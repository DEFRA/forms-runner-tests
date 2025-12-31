export class MarkdownController {
  /**
   * Controller for Markdown display components (read-only content)
   * @param {string} content - The markdown content
   * @param {import("@playwright/test").Page} page
   * @param {string} type
   * @param {string} id
   */
  constructor({ content, page, type, id }) {
    this.content = content
    this.page = page
    this.id = id
    this.type = type
  }

  /**
   * Markdown components are display-only and not required for form submission
   * @returns {boolean}
   */
  get isRequired() {
    return false
  }

  /**
   * Find the markdown content container
   * @returns {import("@playwright/test").Locator}
   */
  find() {
    return this.page.locator(`[data-component-id="${this.id}"]`)
  }

  /**
   * Find by text content within the markdown
   * @param {string} text
   * @returns {import("@playwright/test").Locator}
   */
  findByText(text) {
    return this.page.getByText(text)
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions(expect) {
    // Check that the markdown content text is visible on the page
    const textToFind = this.content.substring(0, 50).trim()
    if (textToFind) {
      const element = this.findByText(textToFind)
      await expect(element).toBeVisible()
    }
    return this
  }

  /**
   * Check if specific text is present in the markdown content
   * @param {import("@playwright/test").Expect} expect
   * @param {string} text
   */
  async assertContainsText(expect, text) {
    const element = this.findByText(text)
    await expect(element).toBeVisible()
    return this
  }
}
