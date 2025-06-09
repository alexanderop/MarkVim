import type { MarkVimWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'
import { MarkVimPage } from '../page-objects/markvim-page.js'

async function getMarkVimPage(world: MarkVimWorld): Promise<MarkVimPage> {
  if (!world.browser) {
    world.browser = await chromium.launch({ headless: true })
  }

  if (!world.page) {
    world.page = await world.browser.newPage()
  }

  if (!world.page) {
    throw new Error('Page not initialized')
  }
  return new MarkVimPage(world.page)
}

Given('I open the MarkVim homepage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.navigate()
})

Given('I am on the MarkVim homepage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.navigate()
})

When('I press {string}', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I open the command palette', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openCommandPalette()
})

Then('the following elements are visible', async function (this: MarkVimWorld, dataTable) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyElementsVisible(dataTable)
})

Then('the command palette should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyCommandPaletteVisible()
})

Then('the search input should be focused', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySearchInputFocused()
})

Then('both editor and preview panes should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyBothPanesVisible()
})

Then('the view mode toggle should be present', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyViewModeTogglePresent()
})

Then('the document list should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyDocumentListVisible()
})

Then('the create document button should be present', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyCreateDocumentButtonPresent()
})

Then('the MarkVim UI should be fully loaded', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyUIFullyLoaded()
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

Then('the editor pane should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.editorPane.waitFor({ state: 'visible' })
})

Then('the preview pane should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.previewPane.waitFor({ state: 'visible' })
})

Then('the preview pane should not be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.previewPane.waitFor({ state: 'hidden' })
})

Then('the editor pane should not be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.editorPane.waitFor({ state: 'hidden' })
})

Then('a new document should be created automatically', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyNewDocumentCreated()
})

When('I focus the editor', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.focusEditor()
})

When('I press {string} to enter insert mode', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I type {string} in the editor', async function (this: MarkVimWorld, text: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.typeInEditor(text)
})

When('I press {string} to exit insert mode', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

When('I press {string} to create new line and enter insert mode', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
})

Then('the preview should contain {string}', async function (this: MarkVimWorld, expectedText: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewContains(expectedText)
})

Then('the preview should have rendered markdown formatting', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyMarkdownRendering()
})

When('I toggle the sidebar with keyboard shortcut', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.toggleSidebarWithKeyboard()
})

Then('the view mode should be stored in localStorage as {string}', async function (this: MarkVimWorld, expectedMode: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyViewModeInLocalStorage(expectedMode)
})

Then('the view mode should be {string}', async function (this: MarkVimWorld, expectedMode: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyCurrentViewMode(expectedMode)
})

When('I reload the page', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.reloadPage()
})

When('I open the settings modal', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openSettingsModal()
})

When('I switch to light theme', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToLightTheme()
})

When('I switch to dark theme', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToDarkTheme()
})

Then('the settings modal should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySettingsModalVisible()
})

Then('the theme should be stored in localStorage as {string}', async function (this: MarkVimWorld, expectedTheme: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyThemeInLocalStorage(expectedTheme)
})

Then('the document should have {string} theme class', async function (this: MarkVimWorld, expectedTheme: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyDocumentHasThemeClass(expectedTheme)
})
