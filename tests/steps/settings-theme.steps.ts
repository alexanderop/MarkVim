import type { MarkVimWorld } from '../support/world.js'
import { Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'

When('I change the theme to {string}', async function (this: MarkVimWorld, theme: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.changeTheme(theme)
})

Then('the theme should be stored in localStorage as {string}', async function (this: MarkVimWorld, theme: string) {
  const markVimPage = await getMarkVimPage(this)
  const storedTheme = await markVimPage.getStoredTheme()
  expect(storedTheme).toBe(theme)
})
