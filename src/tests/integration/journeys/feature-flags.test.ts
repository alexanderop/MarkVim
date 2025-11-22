/**
 * Feature Flags Integration Tests
 *
 * These tests verify that the v-feature directive correctly shows/hides
 * components based on feature flag state WITHOUT producing Vue warnings.
 *
 * Root cause being tested:
 * The v-feature directive manipulates el.style.display, which requires
 * a native DOM element. When applied to components with component roots
 * (not element roots), Vue warns:
 * "Runtime directive used on component with non-element root node.
 *  The directives will not function as intended."
 *
 * Components affected in AppShell.vue:
 * - ShareManager (root: ShareDialogImport component)
 * - ColorThemeModal (root: UModal component)
 * - ShortcutsManager (root: ShortcutsPaletteCommand component)
 * - DocumentManagerAction (root: DocumentModalDelete component)
 *
 * Fix: Wrap these components with native <div> elements that receive the v-feature directive
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useFeatureFlagsStore } from '~/shared/store/feature-flags'
import { mountFullApp } from '../app-page'

const TEST_TIMEOUT = 10000

// Capture Vue warnings during tests
const vueWarnings: string[] = []
let originalWarn: typeof console.warn

beforeEach(() => {
  vueWarnings.length = 0
  originalWarn = console.warn
  console.warn = (...args: unknown[]): void => {
    const message = args.join(' ')
    if (message.includes('[Vue warn]')) {
      vueWarnings.push(message)
    }
    originalWarn.apply(console, args)
  }
})

afterEach(() => {
  console.warn = originalWarn
})

describe('feature: v-feature directive produces no Vue warnings', () => {
  describe('scenario: App mounts without runtime directive warnings', () => {
    it('given I mount the app, Then no Vue warnings about runtime directives on non-element roots are logged', async () => {
      // GIVEN & WHEN - Mount the full app
      await mountFullApp()

      // THEN - Filter for the specific warning about runtime directives
      const directiveWarnings = vueWarnings.filter(w =>
        w.includes('Runtime directive used on component with non-element root node'),
      )

      // This test FAILS because v-feature is applied to components with component roots:
      // - ShareManager, ColorThemeModal, ShortcutsManager, DocumentManagerAction
      // - Also in LayoutHeader: ShareButton, ShortcutsModal, UButton with v-feature
      expect(directiveWarnings).toHaveLength(0)
    }, TEST_TIMEOUT)
  })
})

describe('feature: Feature Flags Work Correctly on Native Elements', () => {
  describe('scenario: v-feature hides editor pane when editor feature disabled', () => {
    it('given the app is loaded, When I disable the editor feature, Then the editor pane has display:none', async () => {
      // GIVEN
      const app = await mountFullApp()
      const store = useFeatureFlagsStore()

      // Editor pane has v-feature="'editor'" on a native <div> element
      expect(app.hasElement('editor-pane')).toBe(true)

      // WHEN - Disable editor feature
      store.dispatch({ type: 'DISABLE_FEATURE', payload: { feature: 'editor' } })
      await app.wrapper.vm.$nextTick()

      // THEN - Editor pane should be hidden via display: none
      // This works because the directive is on a native <div> element
      const editorPane = app.wrapper.find('[data-testid="editor-pane"]')
      const style = editorPane.attributes('style') ?? ''

      expect(style).toContain('display: none')
    }, TEST_TIMEOUT)
  })

  describe('scenario: v-feature hides preview pane when markdown-preview feature disabled', () => {
    it('given the app is loaded, When I disable the markdown-preview feature, Then the preview pane has display:none', async () => {
      // GIVEN
      const app = await mountFullApp()
      const store = useFeatureFlagsStore()

      // Preview pane has v-feature="'markdown-preview'" on a native <div> element
      expect(app.hasElement('preview-pane')).toBe(true)

      // WHEN - Disable markdown-preview feature
      store.dispatch({ type: 'DISABLE_FEATURE', payload: { feature: 'markdown-preview' } })
      await app.wrapper.vm.$nextTick()

      // THEN - Preview pane should be hidden via display: none
      const previewPane = app.wrapper.find('[data-testid="preview-pane"]')
      const style = previewPane.attributes('style') ?? ''

      expect(style).toContain('display: none')
    }, TEST_TIMEOUT)
  })

  describe('scenario: Re-enabling editor feature shows editor pane again', () => {
    it('given the editor is disabled, When I re-enable it, Then the editor pane is visible', async () => {
      // GIVEN
      const app = await mountFullApp()
      const store = useFeatureFlagsStore()

      // Disable editor
      store.dispatch({ type: 'DISABLE_FEATURE', payload: { feature: 'editor' } })
      await app.wrapper.vm.$nextTick()

      const editorPaneDisabled = app.wrapper.find('[data-testid="editor-pane"]')
      expect(editorPaneDisabled.attributes('style')).toContain('display: none')

      // WHEN - Re-enable editor
      store.dispatch({ type: 'ENABLE_FEATURE', payload: { feature: 'editor' } })
      await app.wrapper.vm.$nextTick()

      // THEN - Editor pane should be visible (no display: none)
      const editorPaneEnabled = app.wrapper.find('[data-testid="editor-pane"]')
      const style = editorPaneEnabled.attributes('style') ?? ''

      expect(style).not.toContain('display: none')
    }, TEST_TIMEOUT)
  })
})
