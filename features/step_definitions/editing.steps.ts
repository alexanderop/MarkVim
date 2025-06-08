import type { CustomWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

Given('I have selected the {string} view mode', async function (this: CustomWorld, mode: string) {
  // From HeaderToolbar.vue - look for button with the mode text (capitalize first letter)
  const capitalizedMode = mode.charAt(0).toUpperCase() + mode.slice(1)
  await this.page.locator(`button:has-text("${capitalizedMode}")`).click()
})

When('I clear the editor content', async function (this: CustomWorld) {
  const editorLocator = this.page.locator('.cm-content')
  await editorLocator.click() // Focus the editor
  // Select all and delete
  const isMac = (await this.page.evaluate(() => navigator.platform)).includes('Mac')
  const modifier = isMac ? 'Meta' : 'Control'
  await this.page.keyboard.press(`${modifier}+A`)
  await this.page.keyboard.press('Backspace')
})

When('I type {string} into the editor', async function (this: CustomWorld, text: string) {
  await this.page.locator('.cm-content').pressSequentially(text)

  // Wait for the preview to update
  await this.page.waitForTimeout(500)
})

When('I type {string} on a new line in the editor', async function (this: CustomWorld, text: string) {
  await this.page.keyboard.press('Enter')
  await this.page.locator('.cm-content').pressSequentially(text)
})

Then('the preview pane should show an {string} element with the text {string}', async function (this: CustomWorld, elementType: string, text: string) {
  // Use the new data-testid for the markdown preview
  const preview = this.page.getByTestId('markdown-preview')
  const heading = preview.locator(elementType, { hasText: text })
  await expect(heading).toBeVisible()
})

Then('the preview pane should show a {string} element with the text {string}', async function (this: CustomWorld, elementType: string, text: string) {
  // Use the new data-testid for the markdown preview
  const preview = this.page.getByTestId('markdown-preview')
  const element = preview.locator(elementType, { hasText: text })
  await expect(element).toBeVisible()
})
