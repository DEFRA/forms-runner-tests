import { expect } from "@playwright/test";
import { BaseFieldController } from "./base-field-controller.js";

/**
 * Controller for FileUploadField components.
 * Overrides find(), fill(), assertions(), clear() for file-specific behavior.
 */
export class FileUploadFieldController extends BaseFieldController {
  /**
   * Find the file input element by name attribute
   * @returns {import("@playwright/test").Locator}
   */
  find() {
    // File inputs in GOV.UK forms typically use id attribute
    return this.page.locator(`input[type="file"][id="${this.name}"]`);
  }

  /**
   * Find the file input by label text
   * @returns {import("@playwright/test").Locator}
   */
  findByLabel() {
    return this.page.getByLabel(this.title);
  }

  /**
   * @param {import("@playwright/test").Expect} expect
   */
  async assertions(expect) {
    const element = this.find();
    await expect(element).toBeAttached();
    return this;
  }

  /**
   * Upload a file to the file input
   * @param {string} filePath - The path to the file to upload
   */
  async uploadFile(filePath) {
    await this.find().setInputFiles(filePath);
    return this;
  }

  async clickUploadButton() {
    console.log("Clicking upload button");
    const uploadButton = this.page.getByRole("button", {
      name: /upload file/i,
    });
    await uploadButton.click();
    // wait for upload to complete if necessary
    await expect
      .poll(
        async () => {
          const count = await this.page
            .getByText("1 file uploaded", { exact: true })
            .count();
          return count > 0;
        },
        {
          timeout: 15000,
          interval: 1000,
          message: "Waiting for file to be uploaded",
        }
      )
      .toBe(true);
    await this.page.waitForLoadState("networkidle");
    return this;
  }

  /**
   * Upload multiple files to the file input
   * @param {string[]} filePaths - Array of file paths to upload
   */
  async uploadFiles(filePaths) {
    await this.find().setInputFiles(filePaths);
    return this;
  }

  /**
   * Fill method for compatibility with component filling logic
   * @param {string | string[]} value - File path or array of file paths to upload
   */
  async fill(value) {
    if (Array.isArray(value)) {
      await this.uploadFiles(value);
    } else {
      await this.uploadFile(value);
    }
    await this.clickUploadButton();
    return this;
  }

  /**
   * Clear the file input (remove selected files)
   */
  async clear() {
    await this.find().setInputFiles([]);
    return this;
  }

  /**
   * Get the accepted file types for this input
   * @returns {string | undefined}
   */
  getAcceptedTypes() {
    return this.options?.accept;
  }

  /**
   * Check if a specific file type is accepted
   * @param {string} mimeType - The MIME type to check (e.g., 'application/pdf')
   * @returns {boolean}
   */
  isFileTypeAccepted(mimeType) {
    const accepted = this.getAcceptedTypes();
    if (!accepted) {
      return true; // No restriction means all types accepted
    }
    return accepted.split(",").some((type) => {
      const trimmedType = type.trim();
      if (trimmedType === "*/*") return true;
      if (trimmedType.endsWith("/*")) {
        const category = trimmedType.slice(0, -2);
        return mimeType.startsWith(category);
      }
      return trimmedType === mimeType;
    });
  }
}
