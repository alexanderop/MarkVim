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

When('the page is loaded', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="editor-pane"]')).toBeVisible()
  await expect(page.locator('[data-testid="preview-pane"]')).toBeVisible()
})

When('I click on {word} mode', async function (this: MarkVimWorld, mode: string) {
  const markVimPage = await getMarkVimPage(this)

  const modeMap: Record<string, () => Promise<void>> = {
    editor: () => markVimPage.switchToEditorView(),
    split: () => markVimPage.switchToSplitView(),
    preview: () => markVimPage.switchToPreviewView(),
  }

  const switchMethod = modeMap[mode.toLowerCase()]
  if (!switchMethod) {
    throw new Error(`Unknown mode: ${mode}. Available modes: ${Object.keys(modeMap).join(', ')}`)
  }

  await switchMethod()
})

When('I press the {string} keyboard shortcut', async function (this: MarkVimWorld, shortcut: string) {
  const markVimPage = await getMarkVimPage(this)

  const shortcutMap: Record<string, () => Promise<void>> = {
    'g+t': () => markVimPage.toggleSidebarWithKeyboard(),
    'g+s': () => markVimPage.openSettingsWithKeyboard(),
    'gc': () => markVimPage.openColorThemeWithKeyboard(),
  }

  const shortcutMethod = shortcutMap[shortcut]
  if (!shortcutMethod) {
    throw new Error(`Unknown shortcut: ${shortcut}. Available shortcuts: ${Object.keys(shortcutMap).join(', ')}`)
  }

  await shortcutMethod()
})

// Generic button clicking step
When('I click the {word} button', async function (this: MarkVimWorld, buttonName: string) {
  const markVimPage = await getMarkVimPage(this)

  const buttonMap: Record<string, () => Promise<void>> = {
    'sidebar-toggle': () => markVimPage.toggleSidebarWithButton(),
    'create-document': () => markVimPage.createDocumentBtn.click(),
    'delete-document': () => markVimPage.clickDeleteDocumentButton(),
    'delete-confirm': () => markVimPage.clickDeleteConfirm(),
    'delete-cancel': () => markVimPage.clickDeleteCancel(),
  }

  const clickMethod = buttonMap[buttonName]
  if (!clickMethod) {
    throw new Error(`Unknown button: ${buttonName}. Available buttons: ${Object.keys(buttonMap).join(', ')}`)
  }

  await clickMethod()
})

// Generic element interaction step
When('I toggle the {word}', async function (this: MarkVimWorld, elementName: string) {
  const markVimPage = await getMarkVimPage(this)

  const toggleMap: Record<string, () => Promise<void>> = {
    sidebar: () => markVimPage.toggleSidebarWithButton(),
  }

  const toggleMethod = toggleMap[elementName]
  if (!toggleMethod) {
    throw new Error(`Unknown element to toggle: ${elementName}. Available elements: ${Object.keys(toggleMap).join(', ')}`)
  }

  await toggleMethod()
})

// Generic creation step
When('I create a new {word}', async function (this: MarkVimWorld, itemType: string) {
  const markVimPage = await getMarkVimPage(this)

  const creationMap: Record<string, () => Promise<void>> = {
    document: () => markVimPage.createDocumentBtn.click(),
  }

  const createMethod = creationMap[itemType]
  if (!createMethod) {
    throw new Error(`Unknown item type to create: ${itemType}. Available types: ${Object.keys(creationMap).join(', ')}`)
  }

  await createMethod()
})

// High-level workflow steps
When('I create a document and verify it', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.createDocumentAndVerify(2) // Assuming we start with 1 document
})

When('I toggle the sidebar and verify the change', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.toggleSidebarAndVerify('button')
})

When('I toggle the sidebar with {word} and verify the change', async function (this: MarkVimWorld, method: string) {
  const markVimPage = await getMarkVimPage(this)
  const toggleMethod = method === 'keyboard' ? 'keyboard' : 'button'
  await markVimPage.toggleSidebarAndVerify(toggleMethod)
})

When('I delete the active document', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickDeleteDocumentButton()
})

When('I confirm the deletion', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickDeleteConfirm()
})

When('I cancel the deletion', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickDeleteCancel()
})

When('I type {string} into the editor', async function (this: MarkVimWorld, text: string) {
  const markVimPage = await getMarkVimPage(this)

  // Focus the editor and use fill method for reliability
  await markVimPage.focusEditor()
  await markVimPage.editorContent.fill(text)

  // Wait for the content to be processed
  await markVimPage.page.waitForTimeout(300)
})

When('I paste the following {word} code into the editor:', async function (this: MarkVimWorld, _type: string, docString: string) {
  const markVimPage = await getMarkVimPage(this)

  // Focus the editor and set the content
  await markVimPage.focusEditor()
  await markVimPage.editorContent.fill(docString)

  // Wait for the content to be processed
  await markVimPage.page.waitForTimeout(300)
})

// Add this step as well, which is a variation of the one above
When('I paste the following {word} markdown into the editor:', async function (this: MarkVimWorld, _type: string, docString: string) {
  const markVimPage = await getMarkVimPage(this)

  // Focus the editor and set the content
  await markVimPage.focusEditor()
  await markVimPage.editorContent.fill(docString)

  // Wait for the content to be processed
  await markVimPage.page.waitForTimeout(300)
})
