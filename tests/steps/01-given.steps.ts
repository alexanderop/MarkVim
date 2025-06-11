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

Given('I navigate to the application', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')
})

Given('I open the MarkVim homepage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.navigate()
})

Given('I am on the MarkVim homepage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.navigate()
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
