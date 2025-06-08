import type { CustomWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

Given('I have selected the {string} view mode', async function (this: CustomWorld, mode: string) {
  // Wait for the header toolbar to be available
  await this.page.waitForSelector('header', { timeout: 5000 })
  
  // Find and click the mode button - look for the button in the view mode toggle
  const capitalizedMode = mode.charAt(0).toUpperCase() + mode.slice(1)
  const modeButton = this.page.locator(`button:has-text("${capitalizedMode}")`)
  
  await expect(modeButton).toBeVisible({ timeout: 5000 })
  await modeButton.click()
  
  // Wait for the view to change and elements to be visible
  await this.page.waitForTimeout(1000)
  
  // Verify the view mode is actually selected by checking if the preview is visible for split mode
  if (mode === 'split') {
    await expect(this.page.getByTestId('markdown-preview')).toBeVisible({ timeout: 5000 })
  }
})

When('I clear the editor content', async function (this: CustomWorld) {
  // Wait for CodeMirror to be ready
  const editorLocator = this.page.locator('.cm-content')
  await expect(editorLocator).toBeVisible({ timeout: 10000 })
  await editorLocator.click() // Focus the editor
  
  // Wait a bit for the editor to be focused
  await this.page.waitForTimeout(500)
  
  // Use vim motions to clear all content
  // First ensure we're in normal mode (press Escape)
  await this.page.keyboard.press('Escape')
  await this.page.waitForTimeout(100)
  
  // Go to beginning of document and delete all content using vim commands
  // gg = go to beginning, dG = delete from current position to end of file
  await this.page.keyboard.type('ggdG')
  
  // Wait for the content to be cleared
  await this.page.waitForTimeout(500)
})

When('I type {string} into the editor', async function (this: CustomWorld, text: string) {
  // Ensure the editor is focused
  const editorLocator = this.page.locator('.cm-content')
  await editorLocator.click()
  await this.page.waitForTimeout(100)
  
  // Enter insert mode in vim (press 'i')
  await this.page.keyboard.press('i')
  await this.page.waitForTimeout(100)
  
  // Type the text
  await editorLocator.pressSequentially(text, { delay: 50 })

  // Wait for the preview to update
  await this.page.waitForTimeout(1000)
})

When('I type {string} on a new line in the editor', async function (this: CustomWorld, text: string) {
  // Press Enter to create a new line
  await this.page.keyboard.press('Enter')
  await this.page.waitForTimeout(100)
  
  // Type the text
  const editorLocator = this.page.locator('.cm-content')
  await editorLocator.pressSequentially(text, { delay: 50 })
  
  // Wait for the preview to update
  await this.page.waitForTimeout(1000)
})

Then('the preview pane should show an {string} element with the text {string}', async function (this: CustomWorld, elementType: string, text: string) {
  // Wait for the markdown preview to be visible
  const preview = this.page.getByTestId('markdown-preview')
  await expect(preview).toBeVisible({ timeout: 10000 })
  
  // Wait for the specific element to appear in the preview
  await this.page.waitForFunction(
    ({ element, content }) => {
      const previewElement = document.querySelector('[data-testid="markdown-preview"]')
      if (!previewElement) return false
      const targetElement = previewElement.querySelector(element)
      return targetElement && targetElement.textContent?.trim() === content
    },
    { element: elementType, content: text },
    { timeout: 10000 }
  )
  
  const heading = preview.locator(elementType, { hasText: text })
  await expect(heading).toBeVisible({ timeout: 5000 })
})

Then('the preview pane should show a {string} element with the text {string}', async function (this: CustomWorld, elementType: string, text: string) {
  // Wait for the markdown preview to be visible
  const preview = this.page.getByTestId('markdown-preview')
  await expect(preview).toBeVisible({ timeout: 10000 })
  
  // Wait for the specific element to appear in the preview
  await this.page.waitForFunction(
    ({ element, content }) => {
      const previewElement = document.querySelector('[data-testid="markdown-preview"]')
      if (!previewElement) return false
      const targetElement = previewElement.querySelector(element)
      return targetElement && targetElement.textContent?.trim() === content
    },
    { element: elementType, content: text },
    { timeout: 10000 }
  )
  
  const element = preview.locator(elementType, { hasText: text })
  await expect(element).toBeVisible({ timeout: 5000 })
})
