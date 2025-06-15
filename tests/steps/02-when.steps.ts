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

When('I change the font size to {int}', async function (this: MarkVimWorld, targetSize: number) {
  const markVimPage = await getMarkVimPage(this)
  
  // Open settings modal if not already open
  await markVimPage.openSettingsWithKeyboard()
  
  // Get current font size
  const fontSizeDisplay = markVimPage.page.locator('[data-testid="font-size-display"]')
  await expect(fontSizeDisplay).toBeVisible()
  
  const currentSizeText = await fontSizeDisplay.textContent()
  const currentSize = parseInt(currentSizeText?.replace('px', '') || '14')
  
  // Calculate how many clicks are needed
  const difference = targetSize - currentSize
  
  if (difference > 0) {
    // Need to increase font size
    const increaseButton = markVimPage.page.locator('[data-testid="font-size-increase"]')
    for (let i = 0; i < difference; i++) {
      await increaseButton.click()
      await markVimPage.page.waitForTimeout(100) // Small delay for UI updates
    }
  } else if (difference < 0) {
    // Need to decrease font size
    const decreaseButton = markVimPage.page.locator('[data-testid="font-size-decrease"]')
    for (let i = 0; i < Math.abs(difference); i++) {
      await decreaseButton.click()
      await markVimPage.page.waitForTimeout(100) // Small delay for UI updates
    }
  }
  
  // Verify the font size changed
  await expect(fontSizeDisplay).toHaveText(`${targetSize}px`)
})

When('I verify the editor font size is {int}px', async function (this: MarkVimWorld, expectedSize: number) {
  const markVimPage = await getMarkVimPage(this)
  
  // Check that the CSS custom property is set correctly
  const rootFontSize = await markVimPage.page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--font-size-base')
  })
  
  expect(rootFontSize.trim()).toBe(`${expectedSize}px`)
  
  // Check that CodeMirror editor is using the correct font size
  const editorFontSize = await markVimPage.page.locator('.cm-editor').evaluate((element) => {
    return getComputedStyle(element).fontSize
  })
  
  expect(editorFontSize).toBe(`${expectedSize}px`)
})
