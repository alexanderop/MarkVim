import type { MarkVimWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'
import { MarkVimPage } from '../page-objects/markvim-page.js'

async function getMarkVimPage(world: MarkVimWorld): Promise<MarkVimPage> {
  if (!world.page) {
    await world.init()
  }
  if (!world.page) {
    throw new Error('Page not initialized')
  }
  return new MarkVimPage(world.page)
}

Given('I create a document with long content for scrolling', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.createDocumentWithLongContent()
})

Given('synchronized scrolling is enabled', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.openSettingsModal()
  await page.enableSynchronizedScrolling()
  await page.closeSettingsModal()
})

When('I enable synchronized scrolling', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.enableSynchronizedScrolling()
})

When('I disable synchronized scrolling', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.disableSynchronizedScrolling()
})

When('I scroll down in the editor pane', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.scrollDownInEditorPane()
})

When('I scroll up in the preview pane', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.scrollUpInPreviewPane()
})

When('I scroll down in the preview pane', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.scrollDownInPreviewPane()
})

When('I switch to editor only view', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.switchToEditorView()
})

When('I switch to preview only view', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.switchToPreviewView()
})

When('I switch to split view mode', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.switchToSplitView()
})

When('I press {string} to toggle preview sync', async function (this: MarkVimWorld, key: string) {
  const page = await getMarkVimPage(this)
  await page.pressKey(key)
})

Then('synchronized scrolling should be enabled', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifySynchronizedScrollingEnabled()
})

Then('synchronized scrolling should be disabled', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifySynchronizedScrollingDisabled()
})

Then('the preview pane should scroll proportionally', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifyPreviewPaneScrollsProportionally()
})

Then('the editor pane should scroll proportionally', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifyEditorPaneScrollsProportionally()
})

Then('the preview pane should not scroll', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifyPreviewPaneDoesNotScroll()
})

Then('the editor pane should not scroll', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifyEditorPaneDoesNotScroll()
})

Then('sync scroll should not be active', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifySyncScrollNotActive()
})

Then('sync scroll should be active', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifySyncScrollActive()
})

Then('the preview sync state should change', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifyPreviewSyncStateChange()
})

Then('the settings should reflect the new sync state', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifySettingsReflectSyncState()
})

Then('the preview sync state should change back', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifyPreviewSyncStateChange()
})

Then('the settings should reflect the reverted sync state', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.verifySettingsReflectSyncState()
})

When('I press {string} to toggle preview sync again', async function (this: MarkVimWorld, key: string) {
  const page = await getMarkVimPage(this)
  await page.pressKey(key)
})

When('I close the settings modal', async function (this: MarkVimWorld) {
  const page = await getMarkVimPage(this)
  await page.closeSettingsModal()
})
