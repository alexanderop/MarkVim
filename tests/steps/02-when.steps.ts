import type { MarkVimWorld } from '../support/world.js'
import { When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { getMarkVimPage } from '../page-objects/markvim-page.js'

async function ensurePage(world: MarkVimWorld) {
  if (!world.page) {
    await world.init()
  }
  if (!world.page) {
    throw new Error('Page not initialized')
  }
  return world.page
}

When('the page is loaded', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="editor-pane"]')).toBeVisible()
  await expect(page.locator('[data-testid="preview-pane"]')).toBeVisible()
})

When('I click on {word} mode', async function (this: MarkVimWorld, mode: string) {
  const markVimPage = await getMarkVimPage(this)

  const modeMap: Record<string, () => Promise<void>> = {
    editor: () => markVimPage.switchToEditorView(),
    split: () => markVimPage.switchToSplitView(),
    preview: () => markVimPage.switchToPreviewView(),
  }

  const switchMethod = modeMap[mode.toLowerCase()]
  if (!switchMethod) {
    throw new Error(`Unknown mode: ${mode}. Available modes: ${Object.keys(modeMap).join(', ')}`)
  }

  await switchMethod()
})
