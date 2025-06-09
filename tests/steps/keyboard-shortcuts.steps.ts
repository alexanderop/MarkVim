import type { MarkVimWorld } from '../support/world'
import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'

When('I click the keyboard shortcuts button', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickKeyboardShortcutsButton()
})

When('I open the keyboard shortcuts modal', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openKeyboardShortcutsModal()
})

When('I open the settings modal with keyboard shortcut', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openSettingsWithKeyboard()
})

Given('the keyboard shortcuts modal is open', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickKeyboardShortcutsButton()
  await expect(markVimPage.keyboardShortcutsModal).toBeVisible()
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
    expect(shortcut.keys).toMatch(/^[LPV]$/) // Should be single letters L, P, or V (displayed as uppercase)
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
