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

describe('v-feature Directive', () => {
  describe('when app mounts', () => {
    it('should not produce Vue warnings about runtime directives on non-element roots', async () => {
      await mountFullApp()

      const directiveWarnings = vueWarnings.filter(w =>
        w.includes('Runtime directive used on component with non-element root node'),
      )

      expect(directiveWarnings).toHaveLength(0)
    }, TEST_TIMEOUT)
  })
})

describe('feature flags', () => {
  describe('when disabling editor feature', () => {
    it('should hide editor pane with display:none', async () => {
      const app = await mountFullApp()
      const store = useFeatureFlagsStore()

      expect(app.hasElement('editor-pane')).toBe(true)

      store.dispatch({ type: 'DISABLE_FEATURE', payload: { feature: 'editor' } })
      await app.wrapper.vm.$nextTick()

      const editorPane = app.wrapper.find('[data-testid="editor-pane"]')
      const style = editorPane.attributes('style') ?? ''

      expect(style).toContain('display: none')
    }, TEST_TIMEOUT)
  })

  describe('when disabling markdown-preview feature', () => {
    it('should hide preview pane with display:none', async () => {
      const app = await mountFullApp()
      const store = useFeatureFlagsStore()

      expect(app.hasElement('preview-pane')).toBe(true)

      store.dispatch({ type: 'DISABLE_FEATURE', payload: { feature: 'markdown-preview' } })
      await app.wrapper.vm.$nextTick()

      const previewPane = app.wrapper.find('[data-testid="preview-pane"]')
      const style = previewPane.attributes('style') ?? ''

      expect(style).toContain('display: none')
    }, TEST_TIMEOUT)
  })

  describe('when re-enabling editor feature', () => {
    it('should show editor pane again', async () => {
      const app = await mountFullApp()
      const store = useFeatureFlagsStore()

      store.dispatch({ type: 'DISABLE_FEATURE', payload: { feature: 'editor' } })
      await app.wrapper.vm.$nextTick()

      const editorPaneDisabled = app.wrapper.find('[data-testid="editor-pane"]')
      expect(editorPaneDisabled.attributes('style')).toContain('display: none')

      store.dispatch({ type: 'ENABLE_FEATURE', payload: { feature: 'editor' } })
      await app.wrapper.vm.$nextTick()

      const editorPaneEnabled = app.wrapper.find('[data-testid="editor-pane"]')
      const style = editorPaneEnabled.attributes('style') ?? ''

      expect(style).not.toContain('display: none')
    }, TEST_TIMEOUT)
  })
})
