import type { MarkVimWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'

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

When('I press the key {string}', async function (this: MarkVimWorld, key: string) {
  const page = await ensurePage(this)

  const keyMap: Record<string, string> = {
    'Cmd+K': 'Meta+KeyK',
    'Ctrl+K': 'Control+KeyK',
    'Escape': 'Escape',
    'Tab': 'Tab',
    'Enter': 'Enter',
  }

  const mappedKey = keyMap[key] || key
  await page.keyboard.press(mappedKey)
})

When('I click on element with testid {string}', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).click()
})

When('I click on element with text {string}', async function (this: MarkVimWorld, text: string) {
  const page = await ensurePage(this)
  await page.getByText(text).click()
})

When('I type {string} in element with testid {string}', async function (this: MarkVimWorld, text: string, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).fill(text)
})

When('I hover over element with testid {string}', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).hover()
})

Then('element with testid {string} should be visible', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).waitFor({ state: 'visible' })
})

Then('element with testid {string} should not be visible', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).waitFor({ state: 'hidden' })
})

Then('element with testid {string} should contain text {string}', async function (this: MarkVimWorld, testid: string, expectedText: string) {
  const page = await ensurePage(this)
  const element = page.locator(`[data-testid="${testid}"]`)
  await element.waitFor({ state: 'visible' })
  const text = await element.textContent()
  if (!text?.includes(expectedText)) {
    throw new Error(`Element with testid "${testid}" does not contain expected text "${expectedText}". Actual text: "${text}"`)
  }
})

Then('element with testid {string} should be focused', async function (this: MarkVimWorld, testid: string) {
  const page = await ensurePage(this)
  await page.locator(`[data-testid="${testid}"]`).waitFor({ state: 'visible' })
  const isFocused = await page.locator(`[data-testid="${testid}"]`).evaluate(el => el === document.activeElement)
  if (!isFocused) {
    throw new Error(`Element with testid "${testid}" is not focused`)
  }
})

Then('element with text {string} should be visible', async function (this: MarkVimWorld, text: string) {
  const page = await ensurePage(this)
  await page.getByText(text).waitFor({ state: 'visible' })
})

Then('page title should be {string}', async function (this: MarkVimWorld, expectedTitle: string) {
  const page = await ensurePage(this)
  const title = await page.title()
  if (title !== expectedTitle) {
    throw new Error(`Expected page title to be "${expectedTitle}", but got "${title}"`)
  }
})

Then('current URL should contain {string}', async function (this: MarkVimWorld, expectedUrlPart: string) {
  const page = await ensurePage(this)
  const currentUrl = page.url()
  if (!currentUrl.includes(expectedUrlPart)) {
    throw new Error(`Expected URL to contain "${expectedUrlPart}", but current URL is "${currentUrl}"`)
  }
})

Then('I should be on the page {string}', async function (this: MarkVimWorld, url: string) {
  const page = await ensurePage(this)
  await page.waitForURL(url)
})

Then('I wait for {int} seconds', async function (this: MarkVimWorld, seconds: number) {
  const page = await ensurePage(this)
  await page?.waitForTimeout(seconds * 1000)
})
