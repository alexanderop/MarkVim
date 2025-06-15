import type { MarkVimWorld } from '../support/world.js'
import { Given } from '@cucumber/cucumber'
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

Given('I navigate to {string}', async function (this: MarkVimWorld, url: string) {
  const page = await ensurePage(this)
  await page.goto(url)
  await page.waitForLoadState('networkidle')
})

Given('I navigate to the App', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')
})

Given('the keyboard shortcuts modal is open', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.clickKeyboardShortcutsButton()
  await expect(markVimPage.keyboardShortcutsModal).toBeVisible()
})

Given('I have some data stored in localStorage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

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
  await markVimPage.page.waitForTimeout(500)

  // Focus the editor and select all content, then delete it
  await markVimPage.focusEditor()
  await markVimPage.page.keyboard.press('Meta+a')
  await markVimPage.page.keyboard.press('Backspace')

  // Wait a moment for the editor to update
  await markVimPage.page.waitForTimeout(200)
})
