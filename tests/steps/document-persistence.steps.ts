import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { MarkVimPage } from '../page-objects/markvim-page.js'

let markVimPage: MarkVimPage

Given('I am on the MarkVim home page', async function () {
  markVimPage = new MarkVimPage(this.page)
  await markVimPage.navigate()
})

When('I create a new document with content {string}', async function (content: string) {
  console.log(`Creating document with content: "${content}"`)
  await markVimPage.createDocumentWithContent(content)

  // Debug: check content after creation
  const editorContent = await markVimPage.editorContent.textContent()
  const headerTitle = await markVimPage.headerTitle.textContent()
  console.log(`After creation - Editor content: "${editorContent}"`)
  console.log(`After creation - Header title: "${headerTitle}"`)

  // Wait for client-only components to load and document to be saved to localStorage
  await this.page.waitForTimeout(1000)
})

When('I select the first document {string}', async function (documentTitle: string) {
  // Wait for client-only DocumentList to load
  await markVimPage.page.waitForSelector('[data-testid="document-list"]', { timeout: 10000 })

  // Find the document with the given title - use partial text match to handle truncation
  const documentTitleElement = markVimPage.documentList.locator(`[data-testid^="document-title-"]`).filter({ hasText: documentTitle })
  await documentTitleElement.waitFor({ timeout: 10000 })

  // Click the document item (the parent container)
  const documentItem = documentTitleElement.locator('..').locator('..')
  await documentItem.click()

  // Wait for the document to become active
  await this.page.waitForTimeout(1000)
})

When('I check the browser console', async function () {
  // Start monitoring console messages
  const consoleLogs: string[] = []
  this.page.on('console', (msg: any) => {
    consoleLogs.push(msg.text())
  })
  this.consoleLogs = consoleLogs
})

Then('I should see the document {string} is still active', async (documentTitle: string) => {
  // Debug: check what the actual title is and editor content
  const actualTitle = await markVimPage.headerTitle.textContent()
  const editorContent = await markVimPage.editorContent.textContent()
  console.log(`Expected title: "${documentTitle}"`)
  console.log(`Actual title: "${actualTitle}"`)
  console.log(`Editor content: "${editorContent}"`)
  console.log(`Editor content first line: "${editorContent?.split('\n')[0]}"`)

  await markVimPage.verifyDocumentTitle(documentTitle)
})

Then('the document content should contain {string}', async (expectedContent: string) => {
  await markVimPage.verifyActiveDocumentContent(expectedContent)
})

Then('the active document should be {string}', async (documentTitle: string) => {
  await markVimPage.verifyDocumentTitle(documentTitle)
})

Then('I should not see any hydration mismatch warnings', async function () {
  const consoleLogs = this.consoleLogs as string[]
  const hydrationWarnings = consoleLogs.filter(log =>
    log.includes('hydration')
    || log.includes('mismatch')
    || log.includes('Hydration completed but contains mismatches'),
  )

  expect(hydrationWarnings).toHaveLength(0)
  console.log('✅ No hydration warnings detected')
})
