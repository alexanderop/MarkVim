import { describe, expect, it } from 'vitest'
import { mountFullApp } from '../app-page'

const TEST_TIMEOUT = 10000

describe('app smoke test', () => {
  describe('when app loads with default state', () => {
    it('should display the main header', async () => {
      const app = await mountFullApp()

      expect(app.containsText('MarkVim')).toBe(true)
    }, TEST_TIMEOUT)

    it('should display the document sidebar', async () => {
      const app = await mountFullApp()

      expect(app.containsText('Notes')).toBe(true)
      expect(app.hasElement('document-list')).toBe(true)
    }, TEST_TIMEOUT)

    it('should display both editor and preview panes', async () => {
      const app = await mountFullApp()

      expect(app.hasElement('editor-pane')).toBe(true)
      expect(app.hasElement('preview-pane')).toBe(true)
    }, TEST_TIMEOUT)

    it('should show the welcome document in sidebar', async () => {
      const app = await mountFullApp()

      expect(app.containsText('Welcome to MarkVim')).toBe(true)
      expect(app.getDocumentCount()).toBe(1)
    }, TEST_TIMEOUT)
  })

  describe('when creating a new document', () => {
    it('should increase document count when add button is clicked', async () => {
      const app = await mountFullApp()
      const initialCount = app.getDocumentCount()

      await app.clickCreateDocument()

      expect(app.getDocumentCount()).toBe(initialCount + 1)
    }, TEST_TIMEOUT)
  })
})
