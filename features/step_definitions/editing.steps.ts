import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I have selected the {string} view mode', async function (this: CustomWorld, mode: string) {
  // From HeaderToolbar.vue
  const modeButton = this.page.getByRole('button', { name: mode, exact: true });
  await modeButton.click();
});

When('I clear the editor content', async function (this: CustomWorld) {
  const editorLocator = this.page.locator('.cm-content');
  await editorLocator.click(); // Focus the editor
  // Select all and delete
  const isMac = (await this.page.evaluate(() => navigator.platform)).includes('Mac');
  const modifier = isMac ? 'Meta' : 'Control';
  await this.page.keyboard.press(`${modifier}+A`);
  await this.page.keyboard.press('Backspace');
});

When('I type {string} into the editor', async function (this: CustomWorld, text: string) {
  await this.page.locator('.cm-content').pressSequentially(text);
});

When('I type {string} on a new line in the editor', async function (this: CustomWorld, text: string) {
  await this.page.keyboard.press('Enter');
  await this.page.locator('.cm-content').pressSequentially(text);
});

Then('the preview pane should show an {string} element with the text {string}', async function (this: CustomWorld, elementType: string, text: string) {
    // From MarkdownPreview.vue, the article has class 'prose'
    const preview = this.page.locator('article.prose');
    const heading = preview.locator(elementType, { hasText: text });
    await expect(heading).toBeVisible();
});