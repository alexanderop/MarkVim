import { describe, expect, it } from 'vitest'
import { mountFullApp } from '../app-page'

const TEST_TIMEOUT = 10000

describe('feature: Full App Integration (Smoke Test)', () => {
  describe('scenario: App loads with default state', () => {
    it('given I open the app, Then I see the editor, preview, and sidebar', async () => {
      // GIVEN & WHEN
      const app = await mountFullApp()

      // THEN - All main UI elements are rendered
      expect(app.containsText('MarkVim')).toBe(true)
      expect(app.containsText('Notes')).toBe(true)
      expect(app.hasElement('document-list')).toBe(true)
      expect(app.hasElement('editor-pane')).toBe(true)
      expect(app.hasElement('preview-pane')).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('scenario: Default document is loaded', () => {
    it('given I open the app, Then I see the welcome document in the sidebar', async () => {
      // GIVEN & WHEN
      const app = await mountFullApp()

      // THEN - Welcome document is visible
      expect(app.containsText('Welcome to MarkVim')).toBe(true)
      expect(app.getDocumentCount()).toBe(1)
    }, TEST_TIMEOUT)
  })

  describe('scenario: Create new document', () => {
    it('given the app is loaded, When I create a document, Then document count increases', async () => {
      // GIVEN
      const app = await mountFullApp()
      const initialCount = app.getDocumentCount()

      // WHEN
      await app.clickCreateDocument()

      // THEN
      expect(app.getDocumentCount()).toBe(initialCount + 1)
    }, TEST_TIMEOUT)
  })
})
