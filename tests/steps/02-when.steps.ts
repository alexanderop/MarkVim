import type { MarkVimWorld } from '../support/world.js'
import { When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'

async function ensurePage(world: MarkVimWorld) {
  if (!world.page) {
    await world.init()
  }
  if (!world.page) {
    throw new Error('Page not initialized')
  }
  return world.page
}

When('I press the key {string}', async function (this: MarkVimWorld, key: string) {
  const page = await ensurePage(this)

  const keyMap: Record<string, string> = {
    'Cmd+K': 'Meta+KeyK',
    'Ctrl+K': 'Control+KeyK',
    'Escape': 'Escape',
    'Tab': 'Tab',
    'Enter': 'Enter',
    'Cmd+I': 'Meta+KeyI',
  }

  const mappedKey = keyMap[key] || key
  await page.keyboard.press(mappedKey)
})

When('I press {string}', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I press {string} to enter insert mode', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I press {string} to exit insert mode', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I press {string} to create new line and enter insert mode', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I click on element with testid {string}', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).click()
})

When('I click on element with text {string}', async function (this: MarkVimWorld, text: string) {
  const page = await ensurePage(this)
  await page.getByText(text).click()
})

When('I click the keyboard shortcuts button', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickKeyboardShortcutsButton()
})

When('I open the keyboard shortcuts modal', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openKeyboardShortcutsModal()
})

When('I open the settings modal', async function (this: MarkVimWorld) {
  await this.page?.locator('[data-testid="settings-button"]').click()
})

When('I open the settings modal with keyboard shortcut', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openSettingsWithKeyboard()
})

When('I open the command palette', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openCommandPalette()
})

When('I click the {string} button', async function (this: MarkVimWorld, buttonText: string) {
  if (buttonText === 'Clear Local Data') {
    await this.page?.locator('[data-testid="clear-data-button"]').click()
  }
})

When('I confirm the clear data action', async function (this: MarkVimWorld) {
  await this.page?.locator('[data-testid="clear-data-confirm-btn"]').click()
})

When('I cancel the clear data action', async function (this: MarkVimWorld) {
  await this.page?.locator('[data-testid="clear-data-cancel-btn"]').click()
})

When('I type {string} in element with testid {string}', async function (this: MarkVimWorld, text: string, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).fill(text)
})

When('I type {string}', async function (this: MarkVimWorld, text: string) {
  const page = await ensurePage(this)
  await page.keyboard.type(text)
})

When('I type {string} in the editor', async function (this: MarkVimWorld, text: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.typeInEditor(text)
})

When('I hover over element with testid {string}', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).hover()
})

When('I switch to editor view', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToEditorView()
})

When('I switch to split view', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToSplitView()
})

When('I switch to preview view', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToPreviewView()
})

When('I create a new document', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.createNewDocument()
})

When('I focus the editor', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.focusEditor()
})

When('I toggle the sidebar with keyboard shortcut', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.toggleSidebarWithKeyboard()
})

When('I reload the page', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.reloadPage()
})

When('I enable synchronized scrolling', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.enableSynchronizedScrolling()
})

When('I disable synchronized scrolling', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.disableSynchronizedScrolling()
})

When('I scroll down in the editor pane', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.scrollDownInEditorPane()
})

When('I scroll up in the preview pane', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.scrollUpInPreviewPane()
})

When('I scroll down in the preview pane', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.scrollDownInPreviewPane()
})

When('I switch to editor only view', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToEditorView()
})

When('I switch to preview only view', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToPreviewView()
})

When('I switch to split view mode', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToSplitView()
})

When('I press {string} to toggle preview sync', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I press {string} to toggle preview sync again', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I close the settings modal', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.closeSettingsModal()
})

When('I wait for the share dialog to load', async function (this: MarkVimWorld) {
  const page = this.page!

  await expect(page.locator('[data-testid="share-link-input"]')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('[data-testid="copy-share-link-btn"]')).toBeEnabled({ timeout: 5000 })
})
