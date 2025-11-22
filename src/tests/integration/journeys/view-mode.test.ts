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

describe('feature: View Mode Management', () => {
  describe('scenario: Default view mode is split', () => {
    it('given I open the app, Then both editor and preview panes are visible', async () => {
      // GIVEN & WHEN
      const app = await mountFullApp()
      await settle(app.wrapper)

      // THEN - Both panes should be visible in split mode
      expect(app.hasElement('editor-pane')).toBe(true)
      expect(app.hasElement('preview-pane')).toBe(true)
      expect(app.hasElement('view-mode-split-active')).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('scenario: Switch to editor-only mode hides preview', () => {
    it('given the app is loaded, When I click the editor button, Then preview pane is hidden', async () => {
      // GIVEN
      const app = await mountFullApp()
      await settle(app.wrapper)

      // WHEN - Click the editor-only view mode button
      await app.clickButton('view-mode-editor')
      await settle(app.wrapper)

      // THEN - Editor should be visible, preview should be hidden
      expect(app.hasElement('editor-pane')).toBe(true)
      expect(app.hasElement('preview-pane')).toBe(false)
      expect(app.hasElement('view-mode-editor-active')).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('scenario: View mode toggle buttons show active state', () => {
    it('given I switch to editor mode, Then editor button shows active state', async () => {
      const app = await mountFullApp()
      await settle(app.wrapper)

      // Ensure we start from split mode
      await app.clickButton('view-mode-split')
      await settle(app.wrapper)
      expect(app.hasElement('view-mode-split-active')).toBe(true)

      // Switch to editor
      await app.clickButton('view-mode-editor')
      await settle(app.wrapper)

      // Editor button should show active
      expect(app.hasElement('view-mode-editor-active')).toBe(true)
      expect(app.hasElement('view-mode-split-active')).toBe(false)
    }, TEST_TIMEOUT)
  })
})

describe('feature: Sidebar Toggle', () => {
  describe('scenario: Toggle sidebar visibility', () => {
    it('given the sidebar is visible, When I click toggle, Then it hides', async () => {
      // GIVEN
      const app = await mountFullApp()
      await settle(app.wrapper)
      expect(app.html().includes('aria-label="Documents"')).toBe(true)

      // WHEN - Click the sidebar toggle button
      await app.clickButton('sidebar-toggle')
      await settle(app.wrapper)

      // THEN - Sidebar should be hidden
      expect(app.html().includes('aria-label="Documents"')).toBe(false)
    }, TEST_TIMEOUT)
  })

  describe('scenario: Toggle sidebar back on', () => {
    it('given sidebar is toggled off, When I click toggle again, Then it shows', async () => {
      // GIVEN
      const app = await mountFullApp()
      await settle(app.wrapper)

      // Toggle off
      await app.clickButton('sidebar-toggle')
      await settle(app.wrapper)
      expect(app.html().includes('aria-label="Documents"')).toBe(false)

      // WHEN - Toggle back on
      await app.clickButton('sidebar-toggle')
      await settle(app.wrapper)

      // THEN
      expect(app.html().includes('aria-label="Documents"')).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('scenario: Sidebar toggle button accessibility', () => {
    it('given sidebar is visible, Then toggle button has Hide aria-label', async () => {
      const app = await mountFullApp()
      await settle(app.wrapper)

      const toggleBtn = app.wrapper.find('[data-testid="sidebar-toggle"]')
      expect(toggleBtn.attributes('aria-label')).toBe('Hide sidebar')
    }, TEST_TIMEOUT)
  })
})
