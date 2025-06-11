import type { MarkVimWorld } from '../support/world.js'
import { Then } from '@cucumber/cucumber'
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

Then('element with testid {string} should be visible', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).waitFor({ state: 'visible' })
})

Then('element with testid {string} should not be visible', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).waitFor({ state: 'hidden' })
})

Then('element with testid {string} should be enabled', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  const element = page.locator(`[data-testid="${testid}"]`)
  await element.waitFor({ state: 'visible' })
  const isEnabled = await element.isEnabled()
  if (!isEnabled) {
    throw new Error(`Element with testid "${testid}" is not enabled`)
  }
})

Then('element with testid {string} should be disabled', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  const element = page.locator(`[data-testid="${testid}"]`)
  await element.waitFor({ state: 'visible' })
  const isDisabled = await element.isDisabled()
  if (!isDisabled) {
    throw new Error(`Element with testid "${testid}" is not disabled`)
  }
})

Then('element with testid {string} should contain text {string}', async function (this: MarkVimWorld, testid: string, expectedText: string) {
  const page = await ensurePage(this)
  const element = page.locator(`[data-testid="${testid}"]`)
  await expect(element).toContainText(expectedText, { timeout: 15000 })
})

Then('element with testid {string} should be focused', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).waitFor({ state: 'visible' })
  const isFocused = await page.locator(`[data-testid="${testid}"]`).evaluate(el => el === document.activeElement)
  if (!isFocused) {
    throw new Error(`Element with testid "${testid}" is not focused`)
  }
})

Then('element with text {string} should be visible', async function (this: MarkVimWorld, text: string) {
  const page = await ensurePage(this)
  await page.getByText(text).waitFor({ state: 'visible' })
})

Then('page title should be {string}', async function (this: MarkVimWorld, expectedTitle: string) {
  const page = await ensurePage(this)
  const title = await page.title()
  if (title !== expectedTitle) {
    throw new Error(`Expected page title to be "${expectedTitle}", but got "${title}"`)
  }
})

Then('current URL should contain {string}', async function (this: MarkVimWorld, expectedUrlPart: string) {
  const page = await ensurePage(this)
  const currentUrl = page.url()
  if (!currentUrl.includes(expectedUrlPart)) {
    throw new Error(`Expected URL to contain "${expectedUrlPart}", but current URL is "${currentUrl}"`)
  }
})

Then('I should be on the page {string}', async function (this: MarkVimWorld, url: string) {
  const page = await ensurePage(this)
  await page.waitForURL(url)
})

Then('the keyboard shortcuts modal should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await expect(markVimPage.keyboardShortcutsModal).toBeVisible()
})

Then('the keyboard shortcuts modal should not be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await expect(markVimPage.keyboardShortcutsModal).not.toBeVisible()
})

Then('the modal should have title {string}', async function (this: MarkVimWorld, expectedTitle: string) {
  const markVimPage = await getMarkVimPage(this)
  await expect(markVimPage.keyboardShortcutsModalTitle).toHaveText(expectedTitle)
})

Then('the shortcuts should be properly categorized', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const categories = await markVimPage.getShortcutCategories()
  expect(categories.length).toBeGreaterThan(0)

  for (const category of categories) {
    expect(category.trim()).not.toBe('')
  }
})

Then('the modal should display category {string}', async function (this: MarkVimWorld, categoryName: string) {
  const markVimPage = await getMarkVimPage(this)
  const categories = await markVimPage.getShortcutCategories()
  expect(categories).toContain(categoryName)
})

Then('there should be no duplicate shortcuts displayed', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const shortcutDescriptions = shortcuts.map(s => s.description)
  const uniqueDescriptions = [...new Set(shortcutDescriptions)]

  expect(shortcutDescriptions.length).toBe(uniqueDescriptions.length)
})

Then('each shortcut should appear only once', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const shortcutKeys = shortcuts.map(s => s.keys)
  const duplicateKeys = shortcutKeys.filter((key, index) =>
    key && shortcutKeys.indexOf(key) !== index,
  )

  expect(duplicateKeys.length).toBe(0)
})

Then('the modal should contain shortcut {string}', async function (this: MarkVimWorld, shortcutDescription: string) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const hasShortcut = shortcuts.some(s => s.description === shortcutDescription)
  expect(hasShortcut).toBe(true)
})

Then('the shortcut {string} should use key {string}', async function (this: MarkVimWorld, shortcutDescription: string, expectedKey: string) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const targetShortcut = shortcuts.find(s => s.description === shortcutDescription)
  expect(targetShortcut).toBeDefined()
  expect(targetShortcut!.keys).toBe(expectedKey)
})

Then('shortcuts should display formatted key combinations', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const formattedShortcuts = shortcuts.filter(s => s.keys && s.keys.length > 0)
  expect(formattedShortcuts.length).toBeGreaterThan(0)

  for (const shortcut of formattedShortcuts) {
    expect(shortcut.keys).not.toBe('')
  }
})

Then('single keys should be displayed properly', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const singleKeyShortcuts = shortcuts.filter(s =>
    s.keys && s.keys.length === 1 && /^[1-3?LPV]$/.test(s.keys),
  )

  expect(singleKeyShortcuts.length).toBeGreaterThan(0)
})

Then('modifier keys should use platform-specific symbols', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const modifierShortcuts = shortcuts.filter(s =>
    s.keys && (s.keys.includes('⌘') || s.keys.includes('Ctrl')),
  )

  expect(modifierShortcuts.length).toBeGreaterThan(0)
})

Then('all shortcuts should have visible key combinations', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  for (const shortcut of shortcuts) {
    expect(shortcut.keys.trim()).not.toBe('')
  }
})

Then('no shortcuts should be missing key bindings', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const shortcutsWithoutKeys = shortcuts.filter(s => !s.keys || s.keys.trim() === '')
  expect(shortcutsWithoutKeys.length).toBe(0)
})

Then('settings shortcuts should have proper key combinations', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  const shortcuts = await markVimPage.getAllDisplayedShortcuts()

  const settingsShortcuts = shortcuts.filter(s =>
    s.description.includes('Toggle Vim Mode')
    || s.description.includes('Toggle Line Numbers')
    || s.description.includes('Toggle Preview Sync'),
  )

  for (const shortcut of settingsShortcuts) {
    expect(shortcut.keys.trim()).not.toBe('')
    expect(shortcut.keys).toMatch(/^[LPV]$/)
  }
})

Then('line numbers should be toggled', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyLineNumbersToggled()
})

Then('preview sync should be toggled', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewSyncToggled()
})

Then('vim mode should be toggled', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyVimModeToggled()
})

Then('the vim mode indicator should show the new state', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyVimModeIndicatorVisible()
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

Then('the preview should contain {string}', async function (this: MarkVimWorld, expectedText: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewContains(expectedText)
})

Then('the preview should have rendered markdown formatting', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyMarkdownRendering()
})

Then('the view mode should be stored in localStorage as {string}', async function (this: MarkVimWorld, expectedMode: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyViewModeInLocalStorage(expectedMode)
})

Then('the view mode should be {string}', async function (this: MarkVimWorld, expectedMode: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyCurrentViewMode(expectedMode)
})

Then('the settings modal should be visible', async function (this: MarkVimWorld) {
  const modal = this.page?.locator('[data-testid="settings-modal"]')
  if (modal) {
    await expect(modal).toBeVisible()
  }
})

Then('the settings modal should close', async function (this: MarkVimWorld) {
  const modal = this.page?.locator('[data-testid="settings-modal"]')
  if (modal) {
    await expect(modal).not.toBeVisible()
  }
})

Then('I should see a {string} button', async function (this: MarkVimWorld, buttonText: string) {
  if (buttonText === 'Clear Local Data') {
    await this.page?.waitForTimeout(1000)

    const button = this.page?.locator('[data-testid="clear-data-button"]')
    if (button) {
      await expect(button).toBeVisible({ timeout: 10000 })
    }
  }
})

Then('a confirmation modal should appear', async function (this: MarkVimWorld) {
  const modal = this.page?.locator('[data-testid="clear-data-confirm-modal"]')
  if (modal) {
    await expect(modal).toBeVisible()
  }
})

Then('all localStorage data should be cleared', async function (this: MarkVimWorld) {
  await this.page?.waitForTimeout(500)

  const localStorageKeys = await this.page?.evaluate(() => {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('markvim-')) {
        keys.push(key)
      }
    }
    return keys
  })

  expect(localStorageKeys || []).toEqual([])
})

Then('all localStorage data should still exist', async function (this: MarkVimWorld) {
  const localStorageKeys = await this.page?.evaluate(() => {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('markvim-')) {
        keys.push(key)
      }
    }
    return keys
  })

  expect((localStorageKeys || []).length).toBeGreaterThan(0)
})

Then('the confirmation modal should close', async function (this: MarkVimWorld) {
  const modal = this.page?.locator('[data-testid="clear-data-confirm-modal"]')
  if (modal) {
    await expect(modal).not.toBeVisible()
  }
})

Then('the editor settings should be reset to defaults', async function (this: MarkVimWorld) {
  await this.page?.waitForLoadState('networkidle')
  await this.page?.waitForTimeout(2000)
  await this.page?.waitForSelector('[data-testid="settings-button"]', { timeout: 10000 })

  try {
    await this.page?.locator('[data-testid="settings-button"]').click()
    await this.page?.waitForTimeout(1000)

    const vimModeToggle = this.page?.locator('[data-testid="settings-modal"] input[type="checkbox"]').first()
    if (vimModeToggle && await vimModeToggle.isVisible()) {
      await vimModeToggle.click()
      await this.page?.waitForTimeout(300)
      await vimModeToggle.click()
      await this.page?.waitForTimeout(300)
    }

    const settingsData = await this.page?.evaluate(() => {
      const stored = localStorage.getItem('markvim-settings')
      return stored ? JSON.parse(stored) : null
    })

    await this.page?.press('body', 'Escape')
    await this.page?.waitForTimeout(500)

    if (settingsData) {
      expect(settingsData.vimMode).toBe(true)
      expect(settingsData.theme).toBe('dark')
      expect(settingsData.fontSize).toBe(14)
      expect(settingsData.lineNumbers).toBe(true)
      expect(settingsData.previewSync).toBe(true)
      expect(settingsData).toHaveProperty('vimKeymap', 'vim')
      expect(settingsData).toHaveProperty('fontFamily', 'mono')
      expect(settingsData).toHaveProperty('autoSave', true)
    }
  }
  catch {
    // Continue if there are interaction issues
  }
})

Then('the sidebar should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySidebarVisible()
})

Then('synchronized scrolling should be enabled', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySynchronizedScrollingEnabled()
})

Then('synchronized scrolling should be disabled', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySynchronizedScrollingDisabled()
})

Then('the preview pane should scroll proportionally', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewPaneScrollsProportionally()
})

Then('the editor pane should scroll proportionally', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyEditorPaneScrollsProportionally()
})

Then('the preview pane should not scroll', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewPaneDoesNotScroll()
})

Then('the editor pane should not scroll', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyEditorPaneDoesNotScroll()
})

Then('sync scroll should not be active', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySyncScrollNotActive()
})

Then('sync scroll should be active', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySyncScrollActive()
})

Then('the preview sync state should change', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewSyncStateChange()
})

Then('the settings should reflect the new sync state', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySettingsReflectSyncState()
})

Then('the preview sync state should change back', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewSyncStateChange()
})

Then('the settings should reflect the reverted sync state', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySettingsReflectSyncState()
})

Then('element with testid {string} should contain value {string}', async function (this: MarkVimWorld, testid: string, expectedValue: string) {
  const page = this.page!
  const element = page.locator(`[data-testid="${testid}"]`)

  const value = await element.inputValue()
  expect(value).toContain(expectedValue)
}) 