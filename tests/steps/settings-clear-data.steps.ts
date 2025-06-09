import type { MarkVimWorld } from '../support/world'
import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'

Given('I have some data stored in localStorage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

  // Set various localStorage values that the app uses
  await markVimPage.page.evaluate(() => {
    localStorage.setItem('markvim-view-mode', 'editor')
    localStorage.setItem('markvim-sidebar-visible', 'false')
    localStorage.setItem('markvim-settings', JSON.stringify({
      vimMode: false,
      theme: 'light',
      fontSize: 16,
    }))
    localStorage.setItem('markvim-documents', JSON.stringify([
      { id: 'test-doc', content: '# Test Doc', createdAt: Date.now() },
    ]))
    localStorage.setItem('markvim-pane-width', '60')
    localStorage.setItem('markvim-command-history', JSON.stringify(['command1', 'command2']))
  })
})

Given('I have modified settings in localStorage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

  // Set modified settings different from defaults
  await markVimPage.page.evaluate(() => {
    localStorage.setItem('markvim-view-mode', 'editor')
    localStorage.setItem('markvim-sidebar-visible', 'false')
    localStorage.setItem('markvim-settings', JSON.stringify({
      vimMode: false,
      theme: 'light',
      fontSize: 18,
      lineNumbers: false,
      previewSync: false,
    }))
    localStorage.setItem('markvim-pane-width', '70')
  })
})

When('I open the settings modal', async function (this: MarkVimWorld) {
  await this.page?.locator('[data-testid="settings-button"]').click()
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

Then('the settings modal should be visible', async function (this: MarkVimWorld) {
  const modal = this.page?.locator('[data-testid="settings-modal"]')
  if (modal) {
    await expect(modal).toBeVisible()
  }
})

Then('I should see a {string} button', async function (this: MarkVimWorld, buttonText: string) {
  if (buttonText === 'Clear Local Data') {
    // Wait a bit for the modal to fully render
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

Then('the settings modal should close', async function (this: MarkVimWorld) {
  const modal = this.page?.locator('[data-testid="settings-modal"]')
  if (modal) {
    await expect(modal).not.toBeVisible()
  }
})

Then('the editor settings should be reset to defaults', async function (this: MarkVimWorld) {
  // Wait for the page to finish reloading and defaults to be restored
  await this.page?.waitForLoadState('networkidle')

  // Wait a bit more for composables to initialize and set defaults
  await this.page?.waitForTimeout(1000)

  // Verify that settings are back to their default values
  const settingsData = await this.page?.evaluate(() => {
    const stored = localStorage.getItem('markvim-settings')
    return stored ? JSON.parse(stored) : null
  })

  // These should match the defaults from DEFAULT_EDITOR_CONFIG
  // If settingsData is null, defaults haven't been initialized yet, so check again
  if (!settingsData) {
    // Wait for defaults to be initialized by triggering the composable
    await this.page?.locator('[data-testid="settings-button"]').click()
    await this.page?.waitForTimeout(500)
    await this.page?.press('body', 'Escape')

    const retrySettingsData = await this.page?.evaluate(() => {
      const stored = localStorage.getItem('markvim-settings')
      return stored ? JSON.parse(stored) : null
    })

    expect(retrySettingsData?.vimMode).toBe(true)
    expect(retrySettingsData?.theme).toBe('dark')
    expect(retrySettingsData?.fontSize).toBe(14)
    expect(retrySettingsData?.lineNumbers).toBe(true)
    expect(retrySettingsData?.previewSync).toBe(true)
  }
  else {
    expect(settingsData.vimMode).toBe(true)
    expect(settingsData.theme).toBe('dark')
    expect(settingsData.fontSize).toBe(14)
    expect(settingsData.lineNumbers).toBe(true)
    expect(settingsData.previewSync).toBe(true)
  }
})

Then('the sidebar should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySidebarVisible()
})
