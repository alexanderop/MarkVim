import type { MarkVimWorld } from '../support/world.js'
import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'

const elementTypeMap: Record<string, string> = {
  headline: 'h1',
  text: '',
  heading: 'h1',
  title: 'h1',
  content: '',
}

async function verifyContentInLocation(markVimPage: any, elementType: string, expectedText: string, location: string, shouldBeVisible: boolean = true) {
  const locationMap: Record<string, (page: any, text: string, elementSelector?: string, visible?: boolean) => Promise<void>> = {
    editor: async (page, text, elementSelector, visible = true) => {
      if (!visible) {
        await expect(page.editorPane).not.toBeVisible()
        return
      }
      await page.verifyActiveDocumentContent(text)
    },
    preview: async (page, text, elementSelector, visible = true) => {
      if (!visible) {
        await expect(page.previewPane).not.toBeVisible()
        return
      }
      if (elementSelector) {
        await expect(page.previewContent.locator(elementSelector)).toContainText(text)
        return
      }
      await page.verifyPreviewContains(text)
    },
    header: async (page, text, elementSelector, visible = true) => {
      if (!visible) {
        await expect(page.headerTitle).not.toContainText(text)
        return
      }
      await expect(page.headerTitle).toContainText(text)
    },
    toolbar: async (page, text, elementSelector, visible = true) => {
      if (!visible) {
        await expect(page.headerToolbar).not.toContainText(text)
        return
      }
      await expect(page.headerToolbar).toContainText(text)
    },
  }

  const verifyMethod = locationMap[location]
  if (!verifyMethod) {
    throw new Error(`Unknown location: ${location}. Available locations: ${Object.keys(locationMap).join(', ')}`)
  }

  const elementSelector = elementTypeMap[elementType]
  await verifyMethod(markVimPage, expectedText, elementSelector, shouldBeVisible)
}

Then('the selected mode should be {string}', async function (this: MarkVimWorld, expectedMode: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyCurrentViewMode(expectedMode)
})

Then('I should see the {word} {string} in the {word}', async function (this: MarkVimWorld, elementType: string, expectedText: string, location: string) {
  const markVimPage = await getMarkVimPage(this)
  await verifyContentInLocation(markVimPage, elementType, expectedText, location, true)
})

Then('I should not see the {word} {string} in the {word}', async function (this: MarkVimWorld, elementType: string, expectedText: string, location: string) {
  const markVimPage = await getMarkVimPage(this)
  await verifyContentInLocation(markVimPage, elementType, expectedText, location, false)
})
