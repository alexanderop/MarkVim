import type { MarkVimWorld } from '../support/world'
import { Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

When('I wait for the share dialog to load', async function (this: MarkVimWorld) {
  const page = this.page!

  await expect(page.locator('[data-testid="share-link-input"]')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('[data-testid="copy-share-link-btn"]')).toBeEnabled({ timeout: 5000 })
})

Then('element with testid {string} should contain value {string}', async function (this: MarkVimWorld, testid: string, expectedValue: string) {
  const page = this.page!
  const element = page.locator(`[data-testid="${testid}"]`)

  const value = await element.inputValue()
  expect(value).toContain(expectedValue)
})
