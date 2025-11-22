/**
 * View Mode Integration Tests
 *
 * Tests the view mode functionality (split/editor/preview) and sidebar toggle.
 * These tests verify that:
 * - View mode can be changed via UI buttons
 * - Editor and preview panes show/hide correctly based on view mode
 * - Sidebar can be toggled via the header button
 *
 * Note: Tests that show/hide the preview pane trigger async Mermaid rendering.
 * We avoid complex preview transitions to prevent race conditions during cleanup.
 */
import { describe, expect, it } from 'vitest'
import { mountFullApp } from '../app-page'

const TEST_TIMEOUT = 10000

// Helper to wait for async operations to settle
async function settle(wrapper: { vm: { $nextTick: () => Promise<void> } }): Promise<void> {
  await wrapper.vm.$nextTick()
  // Give time for any async Mermaid rendering
  await new Promise(resolve => setTimeout(resolve, 150))
}

describe('View Mode', () => {
  describe('when app loads with default state', () => {
    it('should display both editor and preview panes in split mode', async () => {
      const app = await mountFullApp()
      await settle(app.wrapper)

      expect(app.hasElement('editor-pane')).toBe(true)
      expect(app.hasElement('preview-pane')).toBe(true)
      expect(app.hasElement('view-mode-split-active')).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('when switching to editor-only mode', () => {
    it('should hide preview pane when editor button is clicked', async () => {
      const app = await mountFullApp()
      await settle(app.wrapper)

      await app.clickButton('view-mode-editor')
      await settle(app.wrapper)

      expect(app.hasElement('editor-pane')).toBe(true)
      expect(app.hasElement('preview-pane')).toBe(false)
      expect(app.hasElement('view-mode-editor-active')).toBe(true)
    }, TEST_TIMEOUT)

    it('should show editor button as active', async () => {
      const app = await mountFullApp()
      await settle(app.wrapper)

      await app.clickButton('view-mode-split')
      await settle(app.wrapper)
      expect(app.hasElement('view-mode-split-active')).toBe(true)

      await app.clickButton('view-mode-editor')
      await settle(app.wrapper)

      expect(app.hasElement('view-mode-editor-active')).toBe(true)
      expect(app.hasElement('view-mode-split-active')).toBe(false)
    }, TEST_TIMEOUT)
  })
})

describe('Sidebar Toggle', () => {
  describe('when sidebar is visible', () => {
    it('should hide sidebar when toggle button is clicked', async () => {
      const app = await mountFullApp()
      await settle(app.wrapper)
      expect(app.html().includes('aria-label="Documents"')).toBe(true)

      await app.clickButton('sidebar-toggle')
      await settle(app.wrapper)

      expect(app.html().includes('aria-label="Documents"')).toBe(false)
    }, TEST_TIMEOUT)

    it('should have "Hide sidebar" aria-label on toggle button', async () => {
      const app = await mountFullApp()
      await settle(app.wrapper)

      const toggleBtn = app.wrapper.find('[data-testid="sidebar-toggle"]')
      expect(toggleBtn.attributes('aria-label')).toBe('Hide sidebar')
    }, TEST_TIMEOUT)
  })

  describe('when sidebar is hidden', () => {
    it('should show sidebar when toggle button is clicked again', async () => {
      const app = await mountFullApp()
      await settle(app.wrapper)

      await app.clickButton('sidebar-toggle')
      await settle(app.wrapper)
      expect(app.html().includes('aria-label="Documents"')).toBe(false)

      await app.clickButton('sidebar-toggle')
      await settle(app.wrapper)

      expect(app.html().includes('aria-label="Documents"')).toBe(true)
    }, TEST_TIMEOUT)
  })
})
