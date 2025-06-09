import { After, Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

Given('I open the MarkVim homepage', async function () {
  if (!this.browser) {
    await this.init()
  }
  this.page = await this.browser.newPage()
  await this.page.goto('http://localhost:3000')
  await this.page.waitForLoadState('networkidle')
})

Then('the following elements are visible', async function (dataTable) {
  const testids: string[] = dataTable.raw().slice(1).flat() // Skip header row
  const results = await Promise.all(
    testids.map(testid => this.page.locator(`[data-testid="${testid}"]`).isVisible()),
  )
  const firstMissing = testids.find((_, i) => !results[i])
  expect(firstMissing, `Missing element with testid: ${firstMissing}`).toBeFalsy()
})

When('I press {string}', async function (key: string) {
  const keyMap: Record<string, string> = {
    'Cmd+K': 'Meta+KeyK',
    'Ctrl+K': 'Control+KeyK',
  }
  const mappedKey = keyMap[key] || key
  await this.page.keyboard.press(mappedKey)
})

Then('the command palette should be visible', async function () {
  const palette = this.page.locator('[data-testid="command-palette"]')
  await expect(palette).toBeVisible()
})

Then('the search input should be focused', async function () {
  const searchInput = this.page.locator('[data-testid="command-palette-search"]')
  await expect(searchInput).toBeFocused()
})

Then('both editor and preview panes should be visible', async function () {
  const editorPane = this.page.locator('[data-testid="editor-pane"]')
  const previewPane = this.page.locator('[data-testid="preview-pane"]')

  await expect(editorPane).toBeVisible()
  await expect(previewPane).toBeVisible()
})

Then('the view mode toggle should be present', async function () {
  const viewModeToggle = this.page.locator('[data-testid="view-mode-toggle"]')
  const editorButton = this.page.locator('[data-testid="view-mode-editor"]')
  const splitButton = this.page.locator('[data-testid="view-mode-split"]')
  const previewButton = this.page.locator('[data-testid="view-mode-preview"]')

  await expect(viewModeToggle).toBeVisible()
  await expect(editorButton).toBeVisible()
  await expect(splitButton).toBeVisible()
  await expect(previewButton).toBeVisible()
})

Then('the document list should be visible', async function () {
  const documentList = this.page.locator('[data-testid="document-list"]')
  await expect(documentList).toBeVisible()
})

Then('the create document button should be present', async function () {
  const createButton = this.page.locator('[data-testid="create-document-btn"]')
  await expect(createButton).toBeVisible()
})

After(async function () {
  if (this.page) {
    await this.page.close()
  }
  if (this.browser) {
    await this.cleanup()
  }
})
