import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I am on the MarkVim application', async function (this: CustomWorld) {
  // This step is handled by the Before hook, but we keep it for readability.
});

Given('I see the default document titled {string}', async function (this: CustomWorld, title: string) {
  const headerTitle = this.page.locator('header h1');
  await expect(headerTitle).toHaveText(title);
});

When('I click the "New note" button', async function (this: CustomWorld) {
  // From DocumentList.vue
  await this.page.getByRole('button', { name: 'New note' }).click();
});

When('I click the "Delete note" button in the header', async function (this: CustomWorld) {
  // From HeaderToolbar.vue
  await this.page.getByRole('button', { name: 'Delete note' }).click();
});

Then('the document title in the header should be {string}', async function (this: CustomWorld, title: string) {
  const headerTitle = this.page.locator('header h1');
  await expect(headerTitle).toHaveText(title);
});

Then('I should see {string} in the editor content', async function (this: CustomWorld, content: string) {
  const editorContent = this.page.locator('.cm-content');
  // Use toContainText to handle potential extra whitespace or lines from CodeMirror
  await expect(editorContent).toContainText(content);
});

Then('I should see the "Delete Document" confirmation modal', async function (this: CustomWorld) {
  // From BaseModal.vue
  const modalTitle = this.page.getByRole('heading', { name: 'Delete Document' });
  await expect(modalTitle).toBeVisible();
});

Then('the modal should contain the text {string}', async function (this: CustomWorld, text: string) {
  const modalContent = this.page.locator('[role="dialog"]');
  await expect(modalContent).toContainText(text);
});

When('I click the "Delete" confirmation button', async function (this: CustomWorld) {
  await this.page.getByRole('button', { name: 'Delete' }).click();
});

Then('the {string} document should no longer be in the document list', async function (this: CustomWorld, title: string) {
  const documentList = this.page.locator('aside[aria-label="Document list"]'); // You might add an aria-label for easier selection
  await expect(documentList.getByText(title)).not.toBeVisible();
});