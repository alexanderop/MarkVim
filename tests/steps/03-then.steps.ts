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

Then('the document should show a preview text', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyDocumentPreviewText()
})

Then('the document should show a timestamp', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyDocumentTimestamp()
})

Then('the first document should be {string}', async function (this: MarkVimWorld, expectedTitle: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyDocumentAtIndex(0, expectedTitle)
})

// Generic visibility steps that can be reused
Then('the {word} should be visible', async function (this: MarkVimWorld, elementName: string) {
  const markVimPage = await getMarkVimPage(this)

  const elementMap: Record<string, () => Promise<void>> = {
    'sidebar': () => markVimPage.verifySidebarVisible(),
    'document-list': () => markVimPage.verifySidebarVisible(),
    'editor': () => expect(markVimPage.editorPane).toBeVisible(),
    'preview': () => expect(markVimPage.previewPane).toBeVisible(),
  }

  const verifyMethod = elementMap[elementName]
  if (!verifyMethod) {
    throw new Error(`Unknown element: ${elementName}. Available elements: ${Object.keys(elementMap).join(', ')}`)
  }

  await verifyMethod()
})

Then('the {word} should be hidden', async function (this: MarkVimWorld, elementName: string) {
  const markVimPage = await getMarkVimPage(this)

  const elementMap: Record<string, () => Promise<void>> = {
    'sidebar': () => markVimPage.verifySidebarHidden(),
    'document-list': () => markVimPage.verifySidebarHidden(),
    'editor': () => expect(markVimPage.editorPane).not.toBeVisible(),
    'preview': () => expect(markVimPage.previewPane).not.toBeVisible(),
  }

  const verifyMethod = elementMap[elementName]
  if (!verifyMethod) {
    throw new Error(`Unknown element: ${elementName}. Available elements: ${Object.keys(elementMap).join(', ')}`)
  }

  await verifyMethod()
})

// Generic counting step that can be extended for different elements
Then('the {word} should contain {int} {word}(s)', async function (this: MarkVimWorld, containerName: string, expectedCount: number, itemType: string) {
  const markVimPage = await getMarkVimPage(this)

  // Normalize item type to handle both singular and plural forms
  const normalizedItemType = itemType.endsWith('s') ? itemType.slice(0, -1) : itemType

  const countMap: Record<string, Record<string, () => Promise<void>>> = {
    'document-list': {
      document: () => markVimPage.verifyDocumentCount(expectedCount),
      item: () => markVimPage.verifyDocumentCount(expectedCount),
    },
  }

  const container = countMap[containerName]
  if (!container) {
    throw new Error(`Unknown container: ${containerName}. Available containers: ${Object.keys(countMap).join(', ')}`)
  }

  const countMethod = container[normalizedItemType]
  if (!countMethod) {
    throw new Error(`Unknown item type: ${normalizedItemType}. Available types for ${containerName}: ${Object.keys(container).join(', ')}`)
  }

  await countMethod()
})

// Generic text verification step
Then('I should see {string} in the {word}', async function (this: MarkVimWorld, expectedText: string, location: string) {
  const markVimPage = await getMarkVimPage(this)

  const locationMap: Record<string, () => Promise<void>> = {
    'document-list': () => markVimPage.verifyDocumentListContainsTitle(expectedText),
    'editor': () => markVimPage.verifyActiveDocumentContent(expectedText),
    'preview': () => markVimPage.verifyPreviewContains(expectedText),
    'header': () => expect(markVimPage.headerTitle).toContainText(expectedText),
  }

  const verifyMethod = locationMap[location]
  if (!verifyMethod) {
    throw new Error(`Unknown location: ${location}. Available locations: ${Object.keys(locationMap).join(', ')}`)
  }

  await verifyMethod()
})

// Generic element state verification
Then('the {word} should be active', async function (this: MarkVimWorld, elementType: string) {
  const markVimPage = await getMarkVimPage(this)

  const stateMap: Record<string, () => Promise<void>> = {
    document: () => markVimPage.verifyActiveDocumentHighlight(),
  }

  const verifyMethod = stateMap[elementType]
  if (!verifyMethod) {
    throw new Error(`Unknown element type: ${elementType}. Available types: ${Object.keys(stateMap).join(', ')}`)
  }

  await verifyMethod()
})

// Generic creation verification
Then('a new {word} should be created', async function (this: MarkVimWorld, itemType: string) {
  const markVimPage = await getMarkVimPage(this)

  const creationMap: Record<string, () => Promise<void>> = {
    document: () => markVimPage.verifyNewDocumentCreated(),
  }

  const verifyMethod = creationMap[itemType]
  if (!verifyMethod) {
    throw new Error(`Unknown item type: ${itemType}. Available types: ${Object.keys(creationMap).join(', ')}`)
  }

  await verifyMethod()
})
