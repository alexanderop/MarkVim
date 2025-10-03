import type { MarkVimWorld } from '../support/world.js'
import { Given } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'
import { DAYS_IN_YEAR, HOURS_IN_DAY, LONG_WAIT_MS, MEDIUM_WAIT_MS, MILLISECONDS_IN_SECOND, MINUTES_IN_HOUR, SECONDS_IN_MINUTE } from '../support/constants.js'
import { ensurePage } from '../support/utils.js'

Given('I navigate to {string}', async function (this: MarkVimWorld, url: string) {
  const page = await ensurePage(this)
  const markVimPage = getMarkVimPage(this)
  await page.goto(url)
  await markVimPage.waitForAppReady()
})

Given('I navigate to the App', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  const markVimPage = getMarkVimPage(this)
  await page.goto('http://localhost:3000')
  await markVimPage.waitForAppReady()
  // Clear localStorage to ensure clean state for each test
  await page.evaluate(() => localStorage.clear())
  // Set welcome as seen so tests go directly to the main interface
  await page.context().addCookies([
    {
      name: 'markvim_welcome_seen',
      value: 'true',
      domain: 'localhost',
      path: '/',
      expires: Date.now() / MILLISECONDS_IN_SECOND + SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY * DAYS_IN_YEAR, // 1 year from now
    },
  ])
  // Reload to apply the cookie setting
  await page.reload()
  await markVimPage.waitForAppReady()
})

Given('I am on the application page', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  const markVimPage = getMarkVimPage(this)
  await page.goto('http://localhost:3000')
  await markVimPage.waitForAppReady()
  // Set welcome as seen so tests go directly to the main interface
  await page.context().addCookies([
    {
      name: 'markvim_welcome_seen',
      value: 'true',
      domain: 'localhost',
      path: '/',
      expires: Date.now() / MILLISECONDS_IN_SECOND + SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY * DAYS_IN_YEAR, // 1 year from now
    },
  ])
  // Reload to apply the cookie setting
  await page.reload()
  await markVimPage.waitForAppReady()
})

Given('the keyboard shortcuts modal is open', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickKeyboardShortcutsButton()
  await expect(markVimPage.keyboardShortcutsModal).toBeVisible()
})

Given('I have some data stored in localStorage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

  await markVimPage.page.evaluate(() => {
    try {
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
    }
    catch {
      // Ignore localStorage errors in test environments
    }
  })

  // Set the welcome cookie separately
  await markVimPage.page.context().addCookies([
    {
      name: 'markvim_welcome_seen',
      value: 'true',
      domain: 'localhost',
      path: '/',
      expires: Date.now() / MILLISECONDS_IN_SECOND + SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY * DAYS_IN_YEAR, // 1 year from now
    },
  ])
})

Given('I have modified settings in localStorage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

  await markVimPage.page.evaluate(() => {
    try {
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
    }
    catch {
      // Ignore localStorage errors in test environments
    }
  })

  // Set the welcome cookie separately
  await markVimPage.page.context().addCookies([
    {
      name: 'markvim_welcome_seen',
      value: 'true',
      domain: 'localhost',
      path: '/',
      expires: Date.now() / MILLISECONDS_IN_SECOND + SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY * DAYS_IN_YEAR, // 1 year from now
    },
  ])
})

Given('I create a document with long content for scrolling', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.createDocumentWithLongContent()
})

Given('synchronized scrolling is enabled', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openSettingsModal()
  await markVimPage.enableSynchronizedScrolling()
  await markVimPage.closeSettingsModal()
})

Given('the sidebar is visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  // Check if sidebar is currently visible, if not make it visible
  const isVisible = await markVimPage.documentList.isVisible()
  if (!isVisible) {
    await markVimPage.toggleSidebarWithButton()
  }
  await markVimPage.verifySidebarVisible()
})

Given('the sidebar is hidden', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  // Check if sidebar is currently hidden, if not hide it
  const isVisible = await markVimPage.documentList.isVisible()
  if (isVisible) {
    await markVimPage.toggleSidebarWithButton()
  }
  await markVimPage.verifySidebarHidden()
})

Given('I have an empty document', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

  // Create a new document using the existing method
  await markVimPage.createNewDocument()

  // Wait for the new document to become active and ready
  await markVimPage.page.waitForTimeout(LONG_WAIT_MS)

  // Focus the editor and select all content, then delete it
  await markVimPage.focusEditor()
  await markVimPage.page.keyboard.press('Meta+a')
  await markVimPage.page.keyboard.press('Backspace')

  // Wait a moment for the editor to update
  await markVimPage.page.waitForTimeout(MEDIUM_WAIT_MS)
})

Given('I create a document with the content {string}', async function (this: MarkVimWorld, content: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.createDocumentWithContent(content)
})

// Add these new steps for the scroll-sync feature
Given('I am in split view', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.switchToSplitView()
  await markVimPage.verifyCurrentViewMode('split')
})

Given('I have disabled synchronized scrolling in the settings', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.openSettingsModal()
  await markVimPage.disableSynchronizedScrolling()
  await markVimPage.closeSettingsModal()
  await markVimPage.verifySynchronizedScrollingDisabled()
})

// Welcome Screen Steps
Given('I visit the MarkVim application for the first time', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  const markVimPage = getMarkVimPage(this)
  await page.evaluate(() => {
    try {
      localStorage.clear()
    }
    catch {
      // Ignore localStorage errors in test environments
    }
  })
  await page.context().clearCookies()
  await page.goto('http://localhost:3000')
  await markVimPage.waitForAppReady()
})
