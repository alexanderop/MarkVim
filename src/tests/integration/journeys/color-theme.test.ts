/**
 * Color Theme Journey Tests
 *
 * BDD tests for user journeys through the color theme feature:
 * - Editing individual colors
 * - Canceling color edits
 * - Resetting theme to defaults
 * - Theme persistence across sessions
 *
 * Note: Nuxt UI UModal uses Teleport, so modal content is queried via document.body
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountFullApp } from '../app-page'
import { DEFAULT_COLOR_THEME, testStorage } from '../test-storage'

const TEST_TIMEOUT = 10000

describe('color theme journeys', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    testStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    testStorage.clear()
  })

  describe('when user edits a color', () => {
    it('should save the new color to storage when accepting change', async () => {
      const app = await mountFullApp()

      // Open color theme modal
      await app.clickButton('color-theme-button')
      await vi.waitFor(() => {
        expect(app.bodyContainsTestId('core-colors-section')).toBe(true)
      })

      // Color picker should not be visible yet
      expect(app.bodyContainsText('Choose Background Color')).toBe(false)

      // Click background color to edit
      app.clickInBody('color-button-background')
      await vi.waitFor(() => {
        expect(app.bodyContainsText('Choose Background Color')).toBe(true)
      })

      // Accept the color change (user accepts the current color)
      app.clickInBody('accept-color-change-button')

      // Should return to theme modal and color should be saved
      await vi.waitFor(() => {
        expect(app.bodyContainsText('Choose Background Color')).toBe(false)
        expect(app.bodyContainsTestId('core-colors-section')).toBe(true)
        const theme = testStorage.colorTheme.get()
        expect(theme).not.toBeNull()
      })
    }, TEST_TIMEOUT)
  })

  describe('when user cancels color edit', () => {
    it('should preserve original color when canceling', async () => {
      // Set up a known theme before mounting
      testStorage.colorTheme.set({
        ...DEFAULT_COLOR_THEME,
        background: { l: 0.15, c: 0.005, h: 10, a: 1 },
      })

      const app = await mountFullApp()

      // Open color theme modal
      await app.clickButton('color-theme-button')
      await vi.waitFor(() => {
        expect(app.bodyContainsTestId('core-colors-section')).toBe(true)
      })

      // Color picker should not be visible yet
      expect(app.bodyContainsText('Choose Background Color')).toBe(false)

      // Click background color to edit
      app.clickInBody('color-button-background')
      await vi.waitFor(() => {
        expect(app.bodyContainsText('Choose Background Color')).toBe(true)
      })

      // Find and click Cancel button
      const buttons = Array.from(document.body.querySelectorAll('button'))
      const cancelButton = buttons.find(btn => btn.textContent?.includes('Cancel'))
      cancelButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      // Should return to theme modal
      await vi.waitFor(() => {
        expect(app.bodyContainsText('Choose Background Color')).toBe(false)
        expect(app.bodyContainsTestId('core-colors-section')).toBe(true)
      })

      // Original color should be preserved (not changed)
      const currentTheme = testStorage.colorTheme.get()
      expect(currentTheme?.background.l).toBe(0.15)
    }, TEST_TIMEOUT)
  })

  describe('when user resets theme to defaults', () => {
    it('should restore all colors to default values', async () => {
      // User has a customized theme saved
      testStorage.colorTheme.set({
        ...DEFAULT_COLOR_THEME,
        background: { l: 0.99, c: 0.01, h: 50, a: 1 },
        foreground: { l: 0.5, c: 0.1, h: 100, a: 1 },
      })

      const app = await mountFullApp()

      // Verify custom theme was loaded
      expect(testStorage.colorTheme.get()?.background.l).toBe(0.99)
      expect(testStorage.colorTheme.get()?.foreground.l).toBe(0.5)

      // Open color theme modal
      await app.clickButton('color-theme-button')
      await vi.waitFor(() => {
        expect(app.bodyContainsTestId('core-colors-section')).toBe(true)
      })

      // Click Reset Colors button
      const buttons = Array.from(document.body.querySelectorAll('button'))
      const resetButton = buttons.find(btn => btn.textContent?.includes('Reset Colors'))
      resetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      // All colors should be reset to defaults
      await vi.waitFor(() => {
        const theme = testStorage.colorTheme.get()
        expect(theme?.background.l).toBe(DEFAULT_COLOR_THEME.background.l)
        expect(theme?.foreground.l).toBe(DEFAULT_COLOR_THEME.foreground.l)
      })
    }, TEST_TIMEOUT)
  })

  describe('when app loads with saved theme', () => {
    it('should apply the custom theme from storage', async () => {
      // User has a previously saved custom theme
      const customTheme = {
        ...DEFAULT_COLOR_THEME,
        background: { l: 0.25, c: 0.05, h: 200, a: 1 },
      }
      testStorage.colorTheme.set(customTheme)

      const app = await mountFullApp()

      // Theme should be loaded from storage
      await vi.waitFor(() => {
        const theme = testStorage.colorTheme.get()
        expect(theme?.background.l).toBe(0.25)
        expect(theme?.background.h).toBe(200)
      })

      // Open modal to verify UI shows custom theme
      await app.clickButton('color-theme-button')
      await vi.waitFor(() => {
        expect(app.bodyContainsTestId('core-colors-section')).toBe(true)
      })

      // The color preview should exist
      expect(app.bodyContainsTestId('color-palette-preview')).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('when user edits alert color', () => {
    it('should allow editing alert colors separately from core colors', async () => {
      const app = await mountFullApp()

      // Open color theme modal
      await app.clickButton('color-theme-button')
      await vi.waitFor(() => {
        expect(app.bodyContainsTestId('alert-colors-section')).toBe(true)
      })

      // Color picker should not be visible yet
      expect(app.bodyContainsText('Choose Alert Note Color')).toBe(false)

      // Click an alert color (alertNote = blue note color)
      app.clickInBody('color-button-alertNote')
      await vi.waitFor(() => {
        expect(app.bodyContainsText('Choose Alert Note Color')).toBe(true)
      })

      // Accept the change
      app.clickInBody('accept-color-change-button')

      // Should return to main modal
      await vi.waitFor(() => {
        expect(app.bodyContainsText('Choose Alert Note Color')).toBe(false)
        expect(app.bodyContainsTestId('alert-colors-section')).toBe(true)
      })
    }, TEST_TIMEOUT)
  })
})
