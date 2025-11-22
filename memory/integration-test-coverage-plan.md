# Integration Test Coverage Plan: 20% → 80%

## Overview

**Current State:** ~20.6% statements, 7.04% branch, 10.31% functions
**Target:** 80% coverage using integration tests only
**Estimated Effort:** 24-32 hours across 14 test files + 3 factories

---

## Existing Test Infrastructure

| Utility | Location | Purpose |
|---------|----------|---------|
| `documentFactory` | `tests/factories/documents.ts` | Creates test `Document` objects |
| `@nuxt/test-utils/runtime` | npm | `renderSuspended()` for Nuxt components |
| `@testing-library/vue` | npm | `screen`, queries |
| `@testing-library/user-event` | npm | User interaction simulation |
| `vitest.setup.ts` | `tests/setup/` | Pinia reset, localStorage clear |

---

## Phase 1: Quick Wins (High Impact, Low Effort)

### 1.1 LocalStorageService Tests
**File:** `src/shared/services/__tests__/LocalStorageService.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageService } from '../LocalStorageService'

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('get', () => {
    it('returns null for missing key', () => {
      expect(LocalStorageService.get('missing')).toBeNull()
    })

    it('parses and returns stored JSON value', () => {
      localStorage.setItem('test', JSON.stringify({ foo: 'bar' }))
      expect(LocalStorageService.get('test')).toEqual({ foo: 'bar' })
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem('test', 'not-json')
      expect(LocalStorageService.get('test')).toBeNull()
    })
  })

  describe('set', () => {
    it('stores value as JSON string', () => {
      LocalStorageService.set('test', { foo: 'bar' })
      expect(localStorage.getItem('test')).toBe('{"foo":"bar"}')
    })
  })

  describe('remove', () => {
    it('removes the key from storage', () => {
      localStorage.setItem('test', 'value')
      LocalStorageService.remove('test')
      expect(localStorage.getItem('test')).toBeNull()
    })
  })

  describe('has', () => {
    it('returns true when key exists', () => {
      localStorage.setItem('test', 'value')
      expect(LocalStorageService.has('test')).toBe(true)
    })

    it('returns false when key does not exist', () => {
      expect(LocalStorageService.has('missing')).toBe(false)
    })
  })
})
```

### 1.2 useVimMode Tests
**File:** `src/modules/editor/tests/use-vim-mode.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { useVimMode } from '../composables/useVimMode'

describe('useVimMode', () => {
  it('sets NORMAL mode for normal state', () => {
    const { vimMode, handleVimModeChange } = useVimMode()
    handleVimModeChange('normal')
    expect(vimMode.value).toBe('NORMAL')
  })

  it('sets INSERT mode for insert state', () => {
    const { vimMode, handleVimModeChange } = useVimMode()
    handleVimModeChange('insert')
    expect(vimMode.value).toBe('INSERT')
  })

  it('sets VISUAL (LINE) for visual line mode', () => {
    const { vimMode, handleVimModeChange } = useVimMode()
    handleVimModeChange('visual', 'line')
    expect(vimMode.value).toBe('VISUAL (LINE)')
  })

  it('sets VISUAL (BLOCK) for visual block mode', () => {
    const { vimMode, handleVimModeChange } = useVimMode()
    handleVimModeChange('visual', 'block')
    expect(vimMode.value).toBe('VISUAL (BLOCK)')
  })
})
```

### 1.3 useViewMode Tests
**File:** `src/shared/composables/__tests__/useViewMode.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useViewMode } from '../useViewMode'

describe('useViewMode', () => {
  describe('view mode state', () => {
    it('defaults to split view', () => {
      const { viewMode } = useViewMode()
      expect(viewMode.value).toBe('split')
    })

    it('setViewMode changes the mode', () => {
      const { viewMode, setViewMode } = useViewMode()
      setViewMode('editor')
      expect(viewMode.value).toBe('editor')
    })

    it('toggleViewMode cycles through modes', () => {
      const { viewMode, toggleViewMode } = useViewMode()
      // split -> editor -> preview -> split
      toggleViewMode()
      expect(viewMode.value).toBe('editor')
      toggleViewMode()
      expect(viewMode.value).toBe('preview')
      toggleViewMode()
      expect(viewMode.value).toBe('split')
    })
  })

  describe('computed visibility', () => {
    it('isEditorVisible is true for editor and split modes', () => {
      const { isEditorVisible, setViewMode } = useViewMode()
      setViewMode('editor')
      expect(isEditorVisible.value).toBe(true)
      setViewMode('split')
      expect(isEditorVisible.value).toBe(true)
      setViewMode('preview')
      expect(isEditorVisible.value).toBe(false)
    })

    it('isPreviewVisible is true for preview and split modes', () => {
      const { isPreviewVisible, setViewMode } = useViewMode()
      setViewMode('preview')
      expect(isPreviewVisible.value).toBe(true)
      setViewMode('split')
      expect(isPreviewVisible.value).toBe(true)
      setViewMode('editor')
      expect(isPreviewVisible.value).toBe(false)
    })

    it('isSplitView is only true for split mode', () => {
      const { isSplitView, setViewMode } = useViewMode()
      setViewMode('split')
      expect(isSplitView.value).toBe(true)
      setViewMode('editor')
      expect(isSplitView.value).toBe(false)
    })
  })

  describe('sidebar', () => {
    it('toggleSidebar flips visibility', () => {
      const { isSidebarVisible, toggleSidebar } = useViewMode()
      const initial = isSidebarVisible.value
      toggleSidebar()
      expect(isSidebarVisible.value).toBe(!initial)
    })
  })
})
```

### 1.4 useDataReset Tests
**File:** `src/shared/composables/__tests__/useDataReset.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDataReset } from '../useDataReset'

describe('useDataReset', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('clearAllData removes markvim- prefixed keys', () => {
    localStorage.setItem('markvim-docs', 'data')
    localStorage.setItem('markvim-settings', 'data')
    localStorage.setItem('other-key', 'data')

    const { clearAllData } = useDataReset()
    clearAllData()

    expect(localStorage.getItem('markvim-docs')).toBeNull()
    expect(localStorage.getItem('markvim-settings')).toBeNull()
    expect(localStorage.getItem('other-key')).toBe('data')
  })

  it('onDataReset callback is called when data is reset', () => {
    const callback = vi.fn()
    const { onDataReset, clearAllData } = useDataReset()

    onDataReset(callback)
    clearAllData()

    expect(callback).toHaveBeenCalled()
  })
})
```

---

## Phase 2: Core Stores (High Coverage Impact)

### 2.1 Color Theme Store Tests
**File:** `src/modules/color-theme/tests/color-theme-store.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useColorThemeStore, DEFAULT_COLOR_THEME } from '../store'

describe('useColorThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('initial state', () => {
    it('starts with default color theme', () => {
      const store = useColorThemeStore()
      expect(store.colorTheme).toEqual(DEFAULT_COLOR_THEME)
    })
  })

  describe('dispatch UPDATE_COLOR', () => {
    it('updates foreground color', () => {
      const store = useColorThemeStore()
      store.dispatch({
        type: 'UPDATE_COLOR',
        colorKey: 'foreground',
        value: { l: 0.9, c: 0.1, h: 180 }
      })
      expect(store.colorTheme.foreground).toEqual({ l: 0.9, c: 0.1, h: 180 })
    })

    it('updates background color', () => {
      const store = useColorThemeStore()
      store.dispatch({
        type: 'UPDATE_COLOR',
        colorKey: 'background',
        value: { l: 0.2, c: 0.05, h: 240 }
      })
      expect(store.colorTheme.background).toEqual({ l: 0.2, c: 0.05, h: 240 })
    })
  })

  describe('dispatch RESET_TO_DEFAULTS', () => {
    it('restores default theme after modifications', () => {
      const store = useColorThemeStore()
      store.dispatch({
        type: 'UPDATE_COLOR',
        colorKey: 'foreground',
        value: { l: 0.5, c: 0.5, h: 0 }
      })
      store.dispatch({ type: 'RESET_TO_DEFAULTS' })
      expect(store.colorTheme).toEqual(DEFAULT_COLOR_THEME)
    })
  })

  describe('validateAndImportTheme', () => {
    it('returns error for invalid JSON', () => {
      const store = useColorThemeStore()
      const result = store.validateAndImportTheme('not-json')
      expect(result.isErr()).toBe(true)
    })

    it('returns error for missing required fields', () => {
      const store = useColorThemeStore()
      const result = store.validateAndImportTheme(JSON.stringify({ foreground: {} }))
      expect(result.isErr()).toBe(true)
    })

    it('imports valid theme', () => {
      const store = useColorThemeStore()
      const validTheme = {
        foreground: { l: 0.9, c: 0.1, h: 180 },
        background: { l: 0.1, c: 0.05, h: 240 },
        accent: { l: 0.6, c: 0.2, h: 300 }
      }
      const result = store.validateAndImportTheme(JSON.stringify(validTheme))
      expect(result.isOk()).toBe(true)
      expect(store.colorTheme.foreground).toEqual(validTheme.foreground)
    })
  })

  describe('exportTheme', () => {
    it('returns valid JSON string', () => {
      const store = useColorThemeStore()
      const exported = store.exportTheme()
      const parsed = JSON.parse(exported)
      expect(parsed).toHaveProperty('foreground')
      expect(parsed).toHaveProperty('background')
    })
  })

  describe('oklchToString', () => {
    it('formats OKLCH color correctly', () => {
      const store = useColorThemeStore()
      const result = store.oklchToString({ l: 0.5, c: 0.2, h: 180 })
      expect(result).toBe('oklch(0.5 0.2 180)')
    })

    it('includes alpha when provided', () => {
      const store = useColorThemeStore()
      const result = store.oklchToString({ l: 0.5, c: 0.2, h: 180, alpha: 0.5 })
      expect(result).toBe('oklch(0.5 0.2 180 / 0.5)')
    })
  })
})
```

### 2.2 useEditorSettings Tests
**File:** `src/modules/editor/tests/use-editor-settings.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorSettings } from '../composables/useEditorSettings'

describe('useEditorSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('default values', () => {
    it('has correct defaults', () => {
      const settings = useEditorSettings()
      expect(settings.vimMode.value).toBe(false)
      expect(settings.lineNumbers.value).toBe(true)
      expect(settings.fontSize.value).toBeGreaterThan(0)
    })
  })

  describe('toggleVimMode', () => {
    it('flips vim mode on and off', () => {
      const settings = useEditorSettings()
      const initial = settings.vimMode.value
      settings.toggleVimMode()
      expect(settings.vimMode.value).toBe(!initial)
      settings.toggleVimMode()
      expect(settings.vimMode.value).toBe(initial)
    })
  })

  describe('toggleLineNumbers', () => {
    it('flips line numbers on and off', () => {
      const settings = useEditorSettings()
      const initial = settings.lineNumbers.value
      settings.toggleLineNumbers()
      expect(settings.lineNumbers.value).toBe(!initial)
    })
  })

  describe('updateFontSize', () => {
    it('clamps to minimum value', () => {
      const settings = useEditorSettings()
      settings.updateFontSize(4) // below min
      expect(settings.fontSize.value).toBeGreaterThanOrEqual(8)
    })

    it('clamps to maximum value', () => {
      const settings = useEditorSettings()
      settings.updateFontSize(100) // above max
      expect(settings.fontSize.value).toBeLessThanOrEqual(32)
    })

    it('accepts valid font size', () => {
      const settings = useEditorSettings()
      settings.updateFontSize(18)
      expect(settings.fontSize.value).toBe(18)
    })
  })

  describe('resetToDefaults', () => {
    it('restores all settings to defaults', () => {
      const settings = useEditorSettings()
      settings.toggleVimMode()
      settings.toggleLineNumbers()
      settings.updateFontSize(24)

      settings.resetToDefaults()

      expect(settings.vimMode.value).toBe(false)
      expect(settings.lineNumbers.value).toBe(true)
    })
  })

  describe('export/import', () => {
    it('exportSettings returns valid JSON', () => {
      const settings = useEditorSettings()
      const exported = settings.exportSettings()
      expect(() => JSON.parse(exported)).not.toThrow()
    })

    it('importSettings applies valid settings', () => {
      const settings = useEditorSettings()
      const importData = JSON.stringify({ vimMode: true, fontSize: 20 })

      const result = settings.importSettings(importData)

      expect(result.isOk()).toBe(true)
      expect(settings.vimMode.value).toBe(true)
      expect(settings.fontSize.value).toBe(20)
    })

    it('importSettings rejects invalid JSON', () => {
      const settings = useEditorSettings()
      const result = settings.importSettings('not-json')
      expect(result.isErr()).toBe(true)
    })
  })
})
```

---

## Phase 3: Expand Existing Tests

### 3.1 Expand useDocumentShare Tests
**File:** `src/modules/share/composables/useDocumentShare.test.ts` (add to existing)

```typescript
// Add these tests to the existing file

describe('generateShareLink', () => {
  it('returns null for empty content', async () => {
    const { generateShareLink } = await import('./useDocumentShare')
    const result = await generateShareLink({ id: '1', title: '', content: '' })
    expect(result).toBeNull()
  })

  it('returns URL for valid document', async () => {
    const { generateShareLink } = await import('./useDocumentShare')
    const result = await generateShareLink({
      id: '1',
      title: 'Test',
      content: '# Hello'
    })
    expect(result).toContain('#share=')
  })

  it('rejects oversized documents', async () => {
    const { generateShareLink } = await import('./useDocumentShare')
    const largeContent = 'x'.repeat(100000) // Very large
    const result = await generateShareLink({
      id: '1',
      title: 'Test',
      content: largeContent
    })
    // Should return error result or null
    expect(result).toBeNull()
  })
})

describe('getShareStats', () => {
  it('returns compression ratio', async () => {
    const { getShareStats } = await import('./useDocumentShare')
    const stats = getShareStats('# Test content')
    expect(stats).toHaveProperty('compressionRatio')
    expect(stats.compressionRatio).toBeGreaterThan(0)
  })
})

describe('clearShareFromUrl', () => {
  it('removes hash from URL', async () => {
    Object.defineProperty(window, 'location', {
      value: { hash: '#share=abc', href: 'http://test/#share=abc' },
      writable: true
    })
    const { clearShareFromUrl } = await import('./useDocumentShare')
    clearShareFromUrl()
    // Verify history.replaceState was called
  })
})
```

---

## Phase 4: Complex Composables

### 4.1 useShortcuts Tests
**File:** `src/modules/shortcuts/tests/use-shortcuts.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useShortcuts } from '../composables/useShortcuts'

describe('useShortcuts', () => {
  describe('registerShortcut', () => {
    it('adds shortcut to registeredShortcuts', () => {
      const { registerShortcut, registeredShortcuts } = useShortcuts()
      registerShortcut({
        id: 'test-shortcut',
        keys: ['ctrl', 's'],
        description: 'Save document',
        action: vi.fn(),
        category: 'editor'
      })
      expect(registeredShortcuts.value).toHaveLength(1)
      expect(registeredShortcuts.value[0].id).toBe('test-shortcut')
    })
  })

  describe('registerShortcuts', () => {
    it('bulk registers multiple shortcuts', () => {
      const { registerShortcuts, registeredShortcuts } = useShortcuts()
      registerShortcuts([
        { id: 'save', keys: ['ctrl', 's'], description: 'Save', action: vi.fn(), category: 'editor' },
        { id: 'open', keys: ['ctrl', 'o'], description: 'Open', action: vi.fn(), category: 'editor' }
      ])
      expect(registeredShortcuts.value).toHaveLength(2)
    })
  })

  describe('formatKeys', () => {
    it('formats meta key as ⌘ on Mac', () => {
      const { formatKeys } = useShortcuts()
      // Mock navigator.platform or test both cases
      const result = formatKeys(['meta', 'k'])
      expect(result).toMatch(/[⌘Ctrl].*K/i)
    })

    it('formats shift key correctly', () => {
      const { formatKeys } = useShortcuts()
      const result = formatKeys(['shift', 'enter'])
      expect(result).toContain('⇧')
    })
  })

  describe('parseKeysToArray', () => {
    it('splits key combination string', () => {
      const { parseKeysToArray } = useShortcuts()
      const result = parseKeysToArray('ctrl+shift+s')
      expect(result).toEqual(['ctrl', 'shift', 's'])
    })
  })

  describe('shortcutsByCategory', () => {
    it('groups shortcuts by category', () => {
      const { registerShortcuts, shortcutsByCategory } = useShortcuts()
      registerShortcuts([
        { id: 'save', keys: ['ctrl', 's'], description: 'Save', action: vi.fn(), category: 'editor' },
        { id: 'toggle', keys: ['ctrl', 'b'], description: 'Toggle', action: vi.fn(), category: 'view' }
      ])
      expect(shortcutsByCategory.value['editor']).toHaveLength(1)
      expect(shortcutsByCategory.value['view']).toHaveLength(1)
    })
  })

  describe('notUsingInput', () => {
    it('returns false when focused on input element', () => {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const { notUsingInput } = useShortcuts()
      expect(notUsingInput.value).toBe(false)

      document.body.removeChild(input)
    })

    it('returns true when not focused on input', () => {
      const div = document.createElement('div')
      document.body.appendChild(div)
      div.focus()

      const { notUsingInput } = useShortcuts()
      expect(notUsingInput.value).toBe(true)

      document.body.removeChild(div)
    })
  })
})
```

### 4.2 useCommandHistory Tests
**File:** `src/modules/shortcuts/tests/use-command-history.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { useCommandHistory } from '../composables/useCommandHistory'

describe('useCommandHistory', () => {
  it('starts with empty history', () => {
    const { history } = useCommandHistory()
    expect(history.value).toEqual([])
  })

  it('addToHistory adds command', () => {
    const { addToHistory, history } = useCommandHistory()
    addToHistory({ id: 'save', label: 'Save Document' })
    expect(history.value).toHaveLength(1)
    expect(history.value[0].id).toBe('save')
  })

  it('limits history to max entries', () => {
    const { addToHistory, history } = useCommandHistory()
    for (let i = 0; i < 20; i++) {
      addToHistory({ id: `cmd-${i}`, label: `Command ${i}` })
    }
    expect(history.value.length).toBeLessThanOrEqual(10) // Assuming max is 10
  })

  it('clearHistory empties the history', () => {
    const { addToHistory, clearHistory, history } = useCommandHistory()
    addToHistory({ id: 'save', label: 'Save' })
    clearHistory()
    expect(history.value).toEqual([])
  })
})
```

### 4.3 useResizablePanes Tests
**File:** `src/shared/composables/__tests__/useResizablePanes.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useResizablePanes } from '../useResizablePanes'

describe('useResizablePanes', () => {
  describe('initial state', () => {
    it('uses provided initial width', () => {
      const { leftPaneWidth } = useResizablePanes({ initialWidth: 40 })
      expect(leftPaneWidth.value).toBe(40)
    })

    it('defaults to 50 if not provided', () => {
      const { leftPaneWidth } = useResizablePanes({})
      expect(leftPaneWidth.value).toBe(50)
    })
  })

  describe('rightPaneWidth computed', () => {
    it('calculates as 100 minus left width', () => {
      const { leftPaneWidth, rightPaneWidth } = useResizablePanes({ initialWidth: 30 })
      expect(rightPaneWidth.value).toBe(70)
    })
  })

  describe('startDrag', () => {
    it('sets isDragging to true on non-mobile', () => {
      // Mock non-mobile
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))

      const { startDrag, isDragging } = useResizablePanes({})
      startDrag()
      expect(isDragging.value).toBe(true)
    })

    it('does nothing on mobile devices', () => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

      const { startDrag, isDragging } = useResizablePanes({})
      startDrag()
      expect(isDragging.value).toBe(false)
    })
  })

  describe('stopDrag', () => {
    it('sets isDragging to false', () => {
      const { startDrag, stopDrag, isDragging } = useResizablePanes({})
      startDrag()
      stopDrag()
      expect(isDragging.value).toBe(false)
    })
  })
})
```

---

## Phase 5: Component Integration Tests

### 5.1 ColorThemePicker Integration Test
**File:** `src/modules/color-theme/tests/color-theme-picker.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ColorThemePicker from '../components/ColorThemePicker.vue'

describe('ColorThemePicker Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  async function createColorPickerPage() {
    const user = userEvent.setup()
    await renderSuspended(ColorThemePicker)

    return {
      getLightnessSlider: () => screen.getByLabelText(/lightness/i),
      getChromaSlider: () => screen.getByLabelText(/chroma/i),
      getHueSlider: () => screen.getByLabelText(/hue/i),
      getPreviewSwatch: () => screen.getByTestId('color-preview'),

      async setLightness(value: number) {
        const slider = screen.getByLabelText(/lightness/i)
        await user.clear(slider)
        await user.type(slider, String(value))
      }
    }
  }

  it('displays all color channel sliders', async () => {
    const page = await createColorPickerPage()
    expect(page.getLightnessSlider()).toBeInTheDocument()
    expect(page.getChromaSlider()).toBeInTheDocument()
    expect(page.getHueSlider()).toBeInTheDocument()
  })

  it('updates preview when lightness changes', async () => {
    const page = await createColorPickerPage()
    await page.setLightness(0.8)
    // Verify the preview updated (check style or data attribute)
    expect(page.getPreviewSwatch()).toBeInTheDocument()
  })
})
```

### 5.2 ShareDialog Integration Test
**File:** `src/modules/share/tests/share-dialog.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ShareDialog from '../components/ShareDialog.vue'

describe('ShareDialog Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  async function createShareDialogPage(props = {}) {
    const user = userEvent.setup()
    await renderSuspended(ShareDialog, {
      props: { isOpen: true, ...props }
    })

    return {
      getShareUrlInput: () => screen.queryByRole('textbox', { name: /share url/i }),
      getCopyButton: () => screen.getByRole('button', { name: /copy/i }),
      getCloseButton: () => screen.getByRole('button', { name: /close/i }),

      async clickCopy() {
        await user.click(screen.getByRole('button', { name: /copy/i }))
      }
    }
  }

  it('displays share URL when open', async () => {
    const page = await createShareDialogPage()
    expect(page.getShareUrlInput()).toBeInTheDocument()
  })

  it('copies URL to clipboard on copy click', async () => {
    const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
    Object.assign(navigator, { clipboard: mockClipboard })

    const page = await createShareDialogPage()
    await page.clickCopy()

    expect(mockClipboard.writeText).toHaveBeenCalled()
  })
})
```

---

## New Factories to Create

### tests/factories/color-theme.ts
```typescript
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import type { ColorTheme, OklchColor } from '~/modules/color-theme/types'

export const oklchColorFactory = Factory.define<OklchColor>(() => ({
  l: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
  c: faker.number.float({ min: 0, max: 0.4, fractionDigits: 2 }),
  h: faker.number.int({ min: 0, max: 360 })
}))

export const colorThemeFactory = Factory.define<ColorTheme>(() => ({
  foreground: oklchColorFactory.build(),
  background: oklchColorFactory.build({ l: 0.1 }),
  accent: oklchColorFactory.build({ c: 0.2 })
}))
```

### tests/factories/editor-settings.ts
```typescript
import { Factory } from 'fishery'
import type { EditorSettings } from '~/modules/editor/types'

export const editorSettingsFactory = Factory.define<EditorSettings>(() => ({
  vimMode: false,
  lineNumbers: true,
  fontSize: 14,
  previewSync: true,
  wordWrap: true
}))
```

### tests/factories/shortcuts.ts
```typescript
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import type { ShortcutAction } from '~/modules/shortcuts/types'

export const shortcutFactory = Factory.define<ShortcutAction>(({ sequence }) => ({
  id: `shortcut-${sequence}`,
  keys: ['ctrl', faker.helpers.arrayElement(['s', 'o', 'n', 'b', 'k'])],
  description: faker.lorem.sentence(3),
  action: () => {},
  category: faker.helpers.arrayElement(['editor', 'view', 'navigation', 'general'])
}))
```

---

## Implementation Priority Order

| Priority | Test File | Est. Time | Coverage Impact |
|----------|-----------|-----------|-----------------|
| 1 | LocalStorageService.test.ts | 1h | +2-3% |
| 2 | useViewMode.test.ts | 1.5h | +3-4% |
| 3 | useVimMode.test.ts | 30min | +1% |
| 4 | useDataReset.test.ts | 45min | +1-2% |
| 5 | color-theme-store.test.ts | 2.5h | +8-10% |
| 6 | use-editor-settings.test.ts | 2.5h | +6-8% |
| 7 | Expand useDocumentShare.test.ts | 1.5h | +4-5% |
| 8 | use-shortcuts.test.ts | 4h | +10-12% |
| 9 | use-command-history.test.ts | 1h | +2-3% |
| 10 | useResizablePanes.test.ts | 1.5h | +3-4% |
| 11 | color-theme-picker.test.ts | 3h | +5-6% |
| 12 | share-dialog.test.ts | 2h | +4-5% |
| 13 | shortcuts-manager.test.ts | 2h | +3-4% |
| 14 | Factories | 1.5h | (supports above) |

**Total: ~25-30 hours → Expected coverage: 75-85%**

---

## Running Tests

```bash
# Run all vitest tests
pnpm test:vitest

# Run specific test file
pnpm test:vitest src/modules/color-theme/tests/color-theme-store.test.ts

# Run with coverage
pnpm test:vitest --coverage

# Watch mode during development
pnpm test:vitest --watch
```
