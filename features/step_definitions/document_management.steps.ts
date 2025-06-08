import type { CustomWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

Given('I am on the MarkVim application', async function (this: CustomWorld) {
  // Wait for the app to fully load by checking for a key element
  await this.page.waitForSelector('[data-testid="document-title"]', { timeout: 10000 })
})

Given('I see the default document titled {string}', async function (this: CustomWorld, title: string) {
  const headerTitle = this.page.getByTestId('document-title')
  await expect(headerTitle).toHaveText(title, { timeout: 10000 })
})

When('I click the "New note" button', async function (this: CustomWorld) {
  // Wait for the button to be available and click it
  const newNoteButton = this.page.getByTestId('new-note-button')
  await expect(newNoteButton).toBeVisible({ timeout: 5000 })
  await newNoteButton.click()

  // Wait for the document to be created and UI to update
  await this.page.waitForTimeout(2000)
})

When('I click the "Delete note" button in the header', async function (this: CustomWorld) {
  // Wait for the delete button to be available and click it
  const deleteButton = this.page.getByTestId('delete-document-button')
  await expect(deleteButton).toBeVisible({ timeout: 5000 })
  await deleteButton.click()

  // Wait for the modal to appear
  await this.page.waitForTimeout(1000)
})

Then('the document title in the header should be {string}', async function (this: CustomWorld, title: string) {
  const headerTitle = this.page.getByTestId('document-title')
  // Use waitFor with a condition for more reliable waiting
  await this.page.waitForFunction(
    (expectedTitle) => {
      const titleElement = document.querySelector('[data-testid="document-title"]')
      return titleElement?.textContent?.trim() === expectedTitle
    },
    title,
    { timeout: 15000 },
  )
  await expect(headerTitle).toHaveText(title)
})

Then('I should see {string} in the editor content', async function (this: CustomWorld, content: string) {
  // Wait for CodeMirror to load and render content
  const editorContent = this.page.locator('.cm-content')
  await expect(editorContent).toBeVisible({ timeout: 10000 })

  // Wait for the content to actually appear
  await this.page.waitForFunction(
    (expectedContent) => {
      const editorElement = document.querySelector('.cm-content')
      return editorElement?.textContent?.includes(expectedContent)
    },
    content,
    { timeout: 10000 },
  )

  await expect(editorContent).toContainText(content)
})

Then('I should see the "Delete Document" confirmation modal', async function (this: CustomWorld) {
  // Wait for the modal to appear with a more specific selector
  const modal = this.page.getByTestId('modal-content')
  await expect(modal).toBeVisible({ timeout: 10000 })

  const modalTitle = this.page.getByTestId('modal-title')
  await expect(modalTitle).toBeVisible({ timeout: 5000 })
  await expect(modalTitle).toHaveText('Delete Document')
})

Then('the modal should contain the text {string}', async function (this: CustomWorld, text: string) {
  const modalContent = this.page.getByTestId('modal-content')
  await expect(modalContent).toContainText(text, { timeout: 5000 })
})

When('I click the "Delete" confirmation button', async function (this: CustomWorld) {
  const confirmButton = this.page.getByTestId('confirm-delete-button')
  await expect(confirmButton).toBeVisible({ timeout: 5000 })
  await confirmButton.click()

  // Wait for the deletion to complete and modal to close
  await this.page.waitForTimeout(1000)
})

Then('the {string} document should no longer be in the document list', async function (this: CustomWorld, title: string) {
  // Wait for the UI to update after deletion
  await this.page.waitForTimeout(2000)

  // Look in the aside element (DocumentList component)
  const documentList = this.page.locator('aside')
  await expect(documentList.getByText(title)).not.toBeVisible({ timeout: 10000 })
})

Given('the sidebar is visible', async function (this: CustomWorld) {
  const sidebar = this.page.locator('aside')
  await expect(sidebar).toBeVisible({ timeout: 5000 })
})

When('I press {string}', async function (this: CustomWorld, keyCombo: string) {
  // Convert the key combination to Playwright format
  const keys = keyCombo.replace('Meta+', 'Meta+').replace('Shift+', 'Shift+').replace('Backslash', '\\')
  await this.page.keyboard.press(keys)

  // Wait longer for view mode changes to complete
  await this.page.waitForTimeout(1000)
})

When('I press {string} again', async function (this: CustomWorld, keyCombo: string) {
  // Convert the key combination to Playwright format
  const keys = keyCombo.replace('Meta+', 'Meta+').replace('Shift+', 'Shift+').replace('Backslash', '\\')
  await this.page.keyboard.press(keys)

  // Wait a moment for the action to complete
  await this.page.waitForTimeout(500)
})

Then('the sidebar should be hidden', async function (this: CustomWorld) {
  const sidebar = this.page.locator('aside')

  // Wait for the sidebar to become hidden with CSS transitions
  await this.page.waitForFunction(
    () => {
      const sidebarElement = document.querySelector('aside')
      if (!sidebarElement)
        return true

      const style = window.getComputedStyle(sidebarElement)
      return style.transform === 'translateX(-100%)' || style.opacity === '0' || !sidebarElement.offsetParent
    },
    { timeout: 5000 },
  )

  // For visual confirmation, check if it's not visible or has the hidden class/style
  await expect(sidebar).not.toBeVisible({ timeout: 1000 }).catch(async () => {
    // If still visible, check for hidden transform
    const transform = await sidebar.evaluate(el => window.getComputedStyle(el).transform)
    expect(transform).toContain('translateX(-100%)')
  })
})

Then('the sidebar should be visible', async function (this: CustomWorld) {
  const sidebar = this.page.locator('aside')

  // Wait for the sidebar to become visible with CSS transitions
  await this.page.waitForFunction(
    () => {
      const sidebarElement = document.querySelector('aside')
      if (!sidebarElement)
        return false

      const style = window.getComputedStyle(sidebarElement)
      return style.transform === 'translateX(0px)' || style.transform === 'none' || style.opacity === '1'
    },
    { timeout: 5000 },
  )

  await expect(sidebar).toBeVisible({ timeout: 1000 })
})

Given('the view mode is {string}', async function (this: CustomWorld, mode: string) {
  // Map mode names to their button titles
  const modeToTitle = {
    editor: 'Editor',
    split: 'Split',
    preview: 'Preview',
  }

  const titleText = modeToTitle[mode as keyof typeof modeToTitle] || mode

  // Check that the correct view mode button is active by looking for the active indicator
  const activeButton = this.page.locator(`button[title*="${titleText}"]`).locator('div[class*="bg-white/5"]')
  await expect(activeButton).toBeVisible({ timeout: 5000 })
})

Then('the view mode should be {string}', async function (this: CustomWorld, mode: string) {
  // Map mode names to their button titles
  const modeToTitle = {
    editor: 'Editor',
    split: 'Split',
    preview: 'Preview',
  }

  const titleText = modeToTitle[mode as keyof typeof modeToTitle] || mode

  // Wait for the view mode to change and check the active indicator
  await this.page.waitForFunction(
    (expectedTitle) => {
      const buttons = document.querySelectorAll('button[title*="Editor"], button[title*="Split"], button[title*="Preview"]')
      for (const button of buttons) {
        const title = button.getAttribute('title') || ''
        const indicator = button.querySelector('div[class*="bg-white/5"]')

        if (title.includes(expectedTitle) && indicator) {
          return true
        }
      }
      return false
    },
    titleText,
    { timeout: 10000 },
  )

  const activeButton = this.page.locator(`button[title*="${titleText}"]`).locator('div[class*="bg-white/5"]')
  await expect(activeButton).toBeVisible({ timeout: 5000 })
})

Then('only the editor should be visible', async function (this: CustomWorld) {
  // Check that editor is visible and preview is not visible
  const editorContainer = this.page.locator('.cm-editor')
  const previewContainer = this.page.locator('[data-testid="markdown-preview"]')

  await expect(editorContainer).toBeVisible({ timeout: 5000 })
  await expect(previewContainer).not.toBeVisible({ timeout: 1000 })
})

Then('both editor and preview should be visible', async function (this: CustomWorld) {
  // Check that both editor and preview are visible
  const editorContainer = this.page.locator('.cm-editor')
  const previewContainer = this.page.locator('[data-testid="markdown-preview"]')

  await expect(editorContainer).toBeVisible({ timeout: 5000 })
  await expect(previewContainer).toBeVisible({ timeout: 5000 })
})

Then('only the preview should be visible', async function (this: CustomWorld) {
  // Check that preview is visible and editor is not visible
  const editorContainer = this.page.locator('.cm-editor')
  const previewContainer = this.page.locator('[data-testid="markdown-preview"]')

  await expect(previewContainer).toBeVisible({ timeout: 5000 })
  await expect(editorContainer).not.toBeVisible({ timeout: 1000 })
})
