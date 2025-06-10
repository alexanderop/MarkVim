import type { MarkVimWorld } from '../support/world'
import { When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

When('I generate large document content', async function (this: MarkVimWorld) {
  const page = this.page!

  // Generate content that exceeds 8KB limit (approximately 8000+ characters)
  const baseContent = '# Large Document\n\nThis document will exceed the 8KB sharing limit.\n'
  const filler = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(150)
  const largeContent = baseContent + filler

  // Clear current content and type large content
  await page.keyboard.press('Meta+a')
  await page.keyboard.press('Delete')

  // Type content in smaller chunks to avoid timeout
  const chunkSize = 1000
  for (let i = 0; i < largeContent.length; i += chunkSize) {
    const chunk = largeContent.slice(i, i + chunkSize)
    await page.keyboard.type(chunk, { delay: 1 })
  }

  // Wait for the editor to contain enough content
  await expect(page.locator('.cm-editor')).toContainText(largeContent.substring(0, 100), { timeout: 15000 })
})
