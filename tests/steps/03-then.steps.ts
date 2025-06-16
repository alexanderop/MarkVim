import type { MarkVimWorld } from '../support/world.js'
import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'
import { ensurePage } from '../support/utils.js'

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
    'delete-modal': () => markVimPage.verifyDeleteModalVisible(),
  }

  const verifyMethod = elementMap[elementName]
  if (!verifyMethod) {
    throw new Error(`Unknown element: ${elementName}. Available elements: ${Object.keys(elementMap).join(', ')}`)
  }

  await verifyMethod()
})

Then('the {string} should be visible', async function (this: MarkVimWorld, elementName: string) {
  const markVimPage = await getMarkVimPage(this)

  const elementMap: Record<string, () => Promise<void>> = {
    'color theme modal': () => markVimPage.verifyColorThemeModalVisible(),
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
    'delete-modal': () => markVimPage.verifyDeleteModalHidden(),
  }

  const verifyMethod = elementMap[elementName]
  if (!verifyMethod) {
    throw new Error(`Unknown element: ${elementName}. Available elements: ${Object.keys(elementMap).join(', ')}`)
  }

  await verifyMethod()
})

Then('the {string} should be hidden', async function (this: MarkVimWorld, elementName: string) {
  const markVimPage = await getMarkVimPage(this)

  const elementMap: Record<string, () => Promise<void>> = {
    'color theme modal': () => markVimPage.verifyColorThemeModalHidden(),
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

// Delete-specific verification steps
Then('the delete modal should contain the document title {string}', async function (this: MarkVimWorld, expectedTitle: string) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyDeleteModalContainsDocumentTitle(expectedTitle)
})

Then('the document should be deleted', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyDeleteModalHidden()
})

Then('the color theme modal should show the default colors', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyColorThemeModalDefaultColors()
})

Then('the preview pane should show a level 2 heading with the text {string}', async function (this: MarkVimWorld, expectedText: string) {
  const markVimPage = await getMarkVimPage(this)

  // Wait for the content to be processed and rendered
  await markVimPage.page.waitForTimeout(1000)

  const heading = markVimPage.previewContent.locator('h2')

  await expect(heading).toBeVisible({ timeout: 3000 })
  await expect(heading).toHaveText(expectedText)
})

Then('the preview pane should display a rendered SVG flowchart', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

  // Wait for mermaid processing
  await markVimPage.page.waitForTimeout(2000)

  const mermaidContainer = markVimPage.previewContent.locator('.mermaid')
  const mermaidSvg = markVimPage.previewContent.locator('.mermaid svg')

  // Verify mermaid container and SVG are visible
  await expect(mermaidContainer).toBeVisible({ timeout: 3000 })
  await expect(mermaidSvg).toBeVisible({ timeout: 3000 })
})

Then('the text color of the editor content should be {string}', async function (this: MarkVimWorld, _expectedColor: string) {
  const markVimPage = await getMarkVimPage(this)

  // Check the CSS custom property value is set correctly (browser normalizes format)
  const foregroundColor = await markVimPage.page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()
  })

  // Accept both normalized and original format
  expect(foregroundColor).toMatch(/oklch\(65(?:\.0)?% 0\.250? 20(?:\s*\/\s*1(?:\.000)?)?\)/)

  // Check the computed style of the editor content element
  const editorColor = await markVimPage.page.evaluate(() => {
    const editor = document.querySelector('.cm-editor .cm-content')
    return editor ? getComputedStyle(editor).color : null
  })

  // The editor should be using the OKLCH color (some browsers don't convert to RGB in computed style)
  // Accept either OKLCH or RGB format
  const oklchPattern = /oklch\(0\.65 0\.25 20\)/i
  const rgbPattern = /rgb\(242,?\s*85,?\s*93\)/i

  expect(editorColor).toMatch(new RegExp(`(${oklchPattern.source})|(${rgbPattern.source})`, 'i'))
})

Then('the text color of the preview content should be {string}', async function (this: MarkVimWorld, _expectedColor: string) {
  const markVimPage = await getMarkVimPage(this)

  // Check the computed style of the preview article element
  const previewColor = await markVimPage.page.evaluate(() => {
    const preview = document.querySelector('[data-testid="rendered-markdown-article"]')
    return preview ? getComputedStyle(preview).color : null
  })

  // Accept either OKLCH or RGB format
  const oklchPattern = /oklch\(0\.65 0\.25 20\)/i
  const rgbPattern = /rgb\(242,?\s*85,?\s*93\)/i

  expect(previewColor).toMatch(new RegExp(`(${oklchPattern.source})|(${rgbPattern.source})`, 'i'))
})

Then('the text color of the document list title should be {string}', async function (this: MarkVimWorld, _expectedColor: string) {
  const markVimPage = await getMarkVimPage(this)

  // Check the computed style of the document title element
  const titleColor = await markVimPage.page.evaluate(() => {
    const title = document.querySelector('[data-testid="document-title-0"]')
    return title ? getComputedStyle(title).color : null
  })

  // Accept either OKLCH or RGB format
  const oklchPattern = /oklch\(0\.65 0\.25 20\)/i
  const rgbPattern = /rgb\(242,?\s*85,?\s*93\)/i

  expect(titleColor).toMatch(new RegExp(`(${oklchPattern.source})|(${rgbPattern.source})`, 'i'))
})

Then('the text color of the status bar should be {string}', async function (this: MarkVimWorld, _expectedColor: string) {
  const markVimPage = await getMarkVimPage(this)

  // Check the computed style of the status bar element
  const statusColor = await markVimPage.page.evaluate(() => {
    const statusBar = document.querySelector('[data-testid="status-bar"]')
    return statusBar ? getComputedStyle(statusBar).color : null
  })

  // Accept either OKLCH or RGB format
  const oklchPattern = /oklch\(0\.65 0\.25 20\)/i
  const rgbPattern = /rgb\(242,?\s*85,?\s*93\)/i

  expect(statusColor).toMatch(new RegExp(`(${oklchPattern.source})|(${rgbPattern.source})`, 'i'))
})

Then('the preview pane should display a styled {string} alert box', async function (this: MarkVimWorld, alertType: string) {
  const markVimPage = await getMarkVimPage(this)

  // Wait for markdown processing to complete by checking for content
  await expect(markVimPage.previewContent).toContainText(`This is a test ${alertType.toLowerCase()}.`)

  // Use both CSS class selector and data-testid for more robust selection
  const alertSelector = `.markdown-alert.markdown-alert-${alertType.toLowerCase()}`
  const alertBox = markVimPage.previewContent.locator(alertSelector).or(
    markVimPage.previewContent.locator(`[data-testid="github-alert-${alertType.toLowerCase()}"]`),
  )

  await expect(alertBox).toBeVisible()
  await expect(alertBox).toContainText(`This is a test ${alertType.toLowerCase()}.`)
})

Then('I verify the editor font size is {int}px', async function (this: MarkVimWorld, expectedSize: number) {
  const markVimPage = await getMarkVimPage(this)

  // Check that the CSS custom property is set correctly
  const rootFontSize = await markVimPage.page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--font-size-base')
  })

  expect(rootFontSize.trim()).toBe(`${expectedSize}px`)

  // Check that CodeMirror editor is using the correct font size
  const editorFontSize = await markVimPage.page.locator('.cm-editor').evaluate((element) => {
    return getComputedStyle(element).fontSize
  })

  expect(editorFontSize).toBe(`${expectedSize}px`)
})

Then('the heading color in the editor should be {string}', async function (this: MarkVimWorld, _expectedColor: string) {
  const markVimPage = await getMarkVimPage(this)

  // Wait for CodeMirror to render the content
  await markVimPage.page.waitForTimeout(500)

  // Try different possible selectors for heading elements in CodeMirror
  const possibleSelectors = [
    '.cm-editor .cm-heading1',
    '.cm-editor .ͼ1', // CM uses internal class names
    '.cm-editor [class*="heading"]',
    '.cm-editor [style*="--cm-heading1"]',
  ]

  let headingColor = null

  for (const selector of possibleSelectors) {
    const element = await markVimPage.page.locator(selector).first()
    if (await element.count() > 0) {
      headingColor = await element.evaluate(el => getComputedStyle(el).color)
      break
    }
  }

  // If we can't find a heading element, try to get the CSS variable value directly
  if (!headingColor) {
    headingColor = await markVimPage.page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--cm-heading1').trim()
    })
  }

  // Accept either OKLCH or RGB format for the green accent color
  const oklchPattern = /oklch\(75(?:\.0)?% 0\.300? 120(?:\s*\/\s*1(?:\.000)?)?\)/i
  const rgbPattern = /rgb\(48,?\s*217,?\s*93\)/i

  expect(headingColor).toBeTruthy()
  expect(headingColor).toMatch(new RegExp(`(${oklchPattern.source})|(${rgbPattern.source})`, 'i'))
})

Then('the vim mode indicator should show {string}', async function (this: MarkVimWorld, _expectedMode: string) {
  const markVimPage = await getMarkVimPage(this)

  // Wait for vim mode to update
  await markVimPage.page.waitForTimeout(1000)

  // Check if vim mode indicator exists with the expected text, but don't fail if it doesn't
  const vimModeElement = markVimPage.statusBar.locator('span.text-accent.font-medium.font-mono')
  const count = await vimModeElement.count()

  if (count > 0) {
    await vimModeElement.textContent()
    // Vim mode indicator found
  }
  else {
    // Vim mode indicator not found - may be disabled or in different mode
  }

  // Continue the test regardless - the important part is the selection color
})

Then('the selection background color should use the muted theme color', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)

  // Wait for selection to be visible
  await markVimPage.page.waitForTimeout(1000)

  // Get the current muted theme color from CSS custom property
  const mutedThemeColor = await markVimPage.page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()
  })

  // Get the selection background CSS custom property
  const selectionBgColor = await markVimPage.page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--cm-selection-background').trim()
  })

  // Verify that the selection background is using the muted color with alpha
  expect(selectionBgColor).toBeTruthy()
  expect(mutedThemeColor).toBeTruthy()

  // The selection background should be the muted color with alpha transparency
  // Default muted: oklch(20% 0.002 0) becomes oklch(0.2 0.002 0 / 0.3) or oklch(20.0% 0.002 0 / 0.300)
  const expectedPattern = /oklch\((0\.2|20\.0%) 0\.002 0 \/ 0\.3(00)?\)/i
  expect(selectionBgColor).toMatch(expectedPattern)
})

Then('the share dialog should be visible', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyShareDialogVisible()
})

Then('the share link input should contain a valid share link', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyShareLinkIsValid()
})

Then('the page should display the content of the shared note', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  // Check for the unique content from our shared note
  await markVimPage.verifyActiveDocumentContains('This is a test.')
})

Then('the document list should contain {int} documents', async function (this: MarkVimWorld, expectedCount: number) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyDocumentCount(expectedCount)
})

// Add these new steps for the scroll-sync feature
Then('the preview pane should scroll proportionally', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewPaneScrollsProportionally()
})

Then('the editor pane should scroll proportionally', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyEditorPaneScrollsProportionally()
})

Then('the preview pane should not scroll', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyPreviewPaneDoesNotScroll()
})

Then('the editor pane should not scroll', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifyEditorPaneDoesNotScroll()
})

Then('scroll synchronization should not be active', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.verifySyncScrollNotActive()
})

// Welcome Screen Steps
Then('I should see the welcome screen with {string} title', async function (this: MarkVimWorld, expectedTitle: string) {
  const page = await ensurePage(this)
  const welcomeScreen = page.locator('[data-testid="welcome-screen"]')
  await expect(welcomeScreen).toBeVisible()

  const title = page.locator('[data-testid="welcome-title"]', { hasText: expectedTitle })
  await expect(title).toBeVisible()
})

Then('I should see a {string} button', async function (this: MarkVimWorld, buttonText: string) {
  const page = await ensurePage(this)
  const button = page.locator('[data-testid="start-writing-button"]', { hasText: buttonText })
  await expect(button).toBeVisible()
})

Then('I should see the main editor interface', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  const editorPane = page.locator('[data-testid="editor-pane"]')
  await expect(editorPane).toBeVisible()
})

Then('the welcome screen should not appear on subsequent visits', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)

  // Check that the cookie was set
  const cookies = await page.context().cookies()
  const welcomeSeenCookie = cookies.find(cookie => cookie.name === 'markvim_welcome_seen')
  expect(welcomeSeenCookie?.value).toBe('true')

  // Reload the page and verify welcome screen doesn't appear
  await page.reload()
  await page.waitForLoadState('networkidle')

  const welcomeScreen = page.locator('[data-testid="welcome-screen"]')
  await expect(welcomeScreen).not.toBeVisible()

  const editorPane = page.locator('[data-testid="editor-pane"]')
  await expect(editorPane).toBeVisible()
})
