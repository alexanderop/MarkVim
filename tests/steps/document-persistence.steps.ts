import type { MarkVimWorld } from '../support/world.js'
import { Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'
import { EXTRA_LONG_WAIT_MS } from '../support/constants.js'

When('I create a new document with content {string}', async function (this: MarkVimWorld, content: string) {
  const markVimPage = getMarkVimPage(this)
  await markVimPage.createDocumentWithContent(content)

  // Wait for client-only components to load and document to be saved to localStorage
  await this.page.waitForTimeout(EXTRA_LONG_WAIT_MS)
})

When('I select the first document {string}', async function (this: MarkVimWorld, documentTitle: string) {
  const markVimPage = getMarkVimPage(this)

  // Wait for client-only DocumentList to load using semantic selector
  const documentList = markVimPage.page.getByRole('complementary', { name: 'Documents' })
  await documentList.waitFor({ state: 'visible', timeout: 10000 })

  // Find the document with the given title - use data-testid for complex structural element
  const documentTitleElement = documentList.locator(`[data-testid^="document-title-"]`).filter({ hasText: documentTitle })
  await documentTitleElement.waitFor({ timeout: 10000 })

  // Click the document item (the parent container)
  const documentItem = documentTitleElement.locator('..').locator('..')
  await documentItem.click()

  // Wait for the document to become active
  await this.page.waitForTimeout(EXTRA_LONG_WAIT_MS)
})

When('I check the browser console', function (this: MarkVimWorld) {
  // Start monitoring console messages
  const consoleLogs: string[] = []
  this.page!.on('console', (msg: any) => {
    consoleLogs.push(msg.text())
  })
  this.consoleLogs = consoleLogs
})

Then('I should see the document {string} is still active', async function (this: MarkVimWorld, documentTitle: string) {
  const markVimPage = getMarkVimPage(this)
  await markVimPage.verifyDocumentTitle(documentTitle)
})

Then('the document content should contain {string}', async function (this: MarkVimWorld, expectedContent: string) {
  const markVimPage = getMarkVimPage(this)
  await markVimPage.verifyActiveDocumentContent(expectedContent)
})

Then('the active document should be {string}', async function (this: MarkVimWorld, documentTitle: string) {
  const markVimPage = getMarkVimPage(this)
  await markVimPage.verifyDocumentTitle(documentTitle)
})

Then('I should not see any hydration mismatch warnings', function (this: MarkVimWorld) {
  const consoleLogs: string[] = this.consoleLogs
  const hydrationWarnings = consoleLogs.filter(log =>
    log.includes('hydration')
    || log.includes('mismatch')
    || log.includes('Hydration completed but contains mismatches'),
  )

  expect(hydrationWarnings).toHaveLength(0)
})
