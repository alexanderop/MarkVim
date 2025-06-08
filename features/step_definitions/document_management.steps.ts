import type { CustomWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

Given('I am on the MarkVim application', async function (this: CustomWorld) {
  // This step is handled by the Before hook, but we keep it for readability.
})

Given('I see the default document titled {string}', async function (this: CustomWorld, title: string) {
  const headerTitle = this.page.getByTestId('document-title')
  await expect(headerTitle).toHaveText(title)
})

When('I click the "New note" button', async function (this: CustomWorld) {
  // Use the new data-testid for the new note button
  await this.page.getByTestId('new-note-button').click()

  // Wait for any navigation or state changes to complete
  await this.page.waitForTimeout(1000)
})

When('I click the "Delete note" button in the header', async function (this: CustomWorld) {
  // Use the new data-testid for the delete button
  await this.page.getByTestId('delete-document-button').click()

  // Wait for the modal to open
  await this.page.waitForTimeout(1000)
})

Then('the document title in the header should be {string}', async function (this: CustomWorld, title: string) {
  const headerTitle = this.page.getByTestId('document-title')
  // Wait for the title to change with a longer timeout
  await expect(headerTitle).toHaveText(title, { timeout: 10000 })
})

Then('I should see {string} in the editor content', async function (this: CustomWorld, content: string) {
  // Use the CodeMirror content selector
  const editorContent = this.page.locator('.cm-content')
  // Use toContainText to handle potential extra whitespace or lines from CodeMirror
  await expect(editorContent).toContainText(content)
})

Then('I should see the "Delete Document" confirmation modal', async function (this: CustomWorld) {
  // Use the new data-testid for the modal title
  const modalTitle = this.page.getByTestId('modal-title')
  await expect(modalTitle).toBeVisible({ timeout: 10000 })
  await expect(modalTitle).toHaveText('Delete Document')
})

Then('the modal should contain the text {string}', async function (this: CustomWorld, text: string) {
  const modalContent = this.page.getByTestId('modal-content')
  await expect(modalContent).toContainText(text)
})

When('I click the "Delete" confirmation button', async function (this: CustomWorld) {
  // Use the new data-testid for the confirm delete button
  await this.page.getByTestId('confirm-delete-button').click()
})

Then('the {string} document should no longer be in the document list', async function (this: CustomWorld, title: string) {
  // Look in the aside element (DocumentList component)
  const documentList = this.page.locator('aside')
  await expect(documentList.getByText(title)).not.toBeVisible()
})
