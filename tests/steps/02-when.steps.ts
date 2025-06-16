import type { MarkVimWorld } from '../support/world.js'
import { When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'
import { ensurePage } from '../support/utils.js'

When('the page is loaded', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

  // Check if we're on the welcome screen first
  const welcomeScreen = markVimPage.page.locator('[data-testid="welcome-screen"]')

  if (await welcomeScreen.isVisible()) {
    // If we see the welcome screen, click through it to get to the main app
    await markVimPage.page.getByRole('button', { name: 'Start Writing' }).click()
  }

  // Now wait for the editor pane to be visible
  await expect(markVimPage.editorPane).toBeVisible()
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
    'share': () => markVimPage.clickShareButton(),
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

When('I type the following text into the editor:', async function (this: MarkVimWorld, docString: string) {
  const markVimPage = await getMarkVimPage(this)

  // Focus the editor and set the content
  await markVimPage.focusEditor()
  await markVimPage.editorContent.fill(docString)

  // Wait for the content to be processed
  await markVimPage.page.waitForTimeout(300)
})

When('I press {string} to ensure normal mode', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
  await markVimPage.page.waitForTimeout(300)
})

When('I press {string} to enter vim visual mode', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.focusEditor()
  await markVimPage.pressKey(key)
  await markVimPage.page.waitForTimeout(500) // Wait for visual mode to activate
})

When('I press {string} to select down one line', async function (this: MarkVimWorld, key: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.pressKey(key)
  await markVimPage.page.waitForTimeout(300) // Wait for selection to update
})

When('I change the font size to {int}', async function (this: MarkVimWorld, targetSize: number) {
  const markVimPage = await getMarkVimPage(this)

  // Open settings modal if not already open
  await markVimPage.openSettingsWithKeyboard()

  // Get current font size
  const fontSizeDisplay = markVimPage.page.locator('[data-testid="font-size-display"]')
  await expect(fontSizeDisplay).toBeVisible()

  const currentSizeText = await fontSizeDisplay.textContent()
  const currentSize = Number.parseInt(currentSizeText?.replace('px', '') || '14')

  // Calculate how many clicks are needed
  const difference = targetSize - currentSize

  if (difference > 0) {
    // Need to increase font size
    const increaseButton = markVimPage.page.locator('[data-testid="font-size-increase"]')
    for (let i = 0; i < difference; i++) {
      await increaseButton.click()
      await markVimPage.page.waitForTimeout(100) // Small delay for UI updates
    }
  }
  else if (difference < 0) {
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

When('I open the color theme modal', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.colorThemeButton.click()
  await expect(markVimPage.colorThemeModal).toBeVisible()
})

When('I click the {string} color setting to open the picker', async function (this: MarkVimWorld, colorName: string) {
  const markVimPage = await getMarkVimPage(this)
  const colorButton = markVimPage.page.locator(`[data-testid="color-button-${colorName.toLowerCase()}"]`)
  await colorButton.click()
})

When('I set the color picker value to {string} which is a vibrant red', async function (this: MarkVimWorld, colorValue: string) {
  const markVimPage = await getMarkVimPage(this)
  await expect(markVimPage.oklchStringInput).toBeVisible()
  await markVimPage.oklchStringInput.fill(colorValue)
})

When('I set the color picker value to {string} which is a vibrant green', async function (this: MarkVimWorld, colorValue: string) {
  const markVimPage = await getMarkVimPage(this)
  await expect(markVimPage.oklchStringInput).toBeVisible()
  await markVimPage.oklchStringInput.fill(colorValue)
})

When('I set the color picker value to {string} which is a muted blue', async function (this: MarkVimWorld, colorValue: string) {
  const markVimPage = await getMarkVimPage(this)
  await expect(markVimPage.oklchStringInput).toBeVisible()
  await markVimPage.oklchStringInput.fill(colorValue)
})

When('I confirm the new color selection', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.acceptColorChangeButton.click()
  await markVimPage.page.waitForTimeout(1000) // Wait for color changes to apply
})

When('I enable vim mode', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.enableVimMode()
})

When('I enter vim visual mode', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.enterVimVisualMode()
})

When('I select {int} lines down in visual mode', async function (this: MarkVimWorld, lines: number) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.selectTextInVimVisualMode('down', lines)
})

When('I copy the share link', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickCopyShareLinkButton()
})

When('I navigate to the copied share link in the browser', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const copiedLink = await markVimPage.getClipboardText()
  // Store the link in the world context to use it in a Then step if needed
  this.sharedLink = copiedLink
  await markVimPage.navigateToUrl(copiedLink)
})

// Add these new steps for the scroll-sync feature
When('I scroll down in the editor pane', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.scrollDownInEditorPane()
})

When('I scroll down in the preview pane', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.scrollDownInPreviewPane()
})

When('I disable synchronized scrolling', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.disableSynchronizedScrolling()
})

When('I enable synchronized scrolling', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.enableSynchronizedScrolling()
})

When('I switch to editor-only view', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToEditorView()
})

When('I switch to preview-only view', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToPreviewView()
})

When('I open the settings modal', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openSettingsModal()
})

When('I close the settings modal', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.closeSettingsModal()
})

// Welcome Screen Steps
When('I click the {string} button', async function (this: MarkVimWorld, buttonText: string) {
  const page = await ensurePage(this)
  const button = page.locator('button', { hasText: buttonText })
  await button.click()
})

// Moved to given.steps.ts as it's a state setup step, not an action

When('I resize the browser to mobile size', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  await page.setViewportSize({ width: 375, height: 667 })
})
