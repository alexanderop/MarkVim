# BDD Integration Test Coverage Plan: 20% → 80%

## Philosophy

**The Core Principle:** Always render the **full `app.vue`** and test real user journeys. We're not testing isolated components - we're testing how users actually interact with the application.

```
❌ WRONG: mountSuspended(ColorThemePicker)  // Isolated component
✅ RIGHT: mountSuspended(App)               // Full app, real user flow
```

This aligns with Kent C. Dodds' Testing Trophy and our existing Cucumber E2E tests - but runs in jsdom for speed.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         app.vue                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                      UApp (Nuxt UI)                      ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │                    BaseLayout                        │││
│  │  │  ┌─────────────────────────────────────────────────┐│││
│  │  │  │                   AppShell                       ││││
│  │  │  │                                                  ││││
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌─────────────────┐  ││││
│  │  │  │  │ Document │ │  Editor  │ │ MarkdownPreview │  ││││
│  │  │  │  │   List   │ │CodeMirror│ │                 │  ││││
│  │  │  │  └──────────┘ └──────────┘ └─────────────────┘  ││││
│  │  │  │                                                  ││││
│  │  │  │  ┌──────────────────────────────────────────┐   ││││
│  │  │  │  │ Modals: Share, ColorTheme, Settings, etc │   ││││
│  │  │  │  └──────────────────────────────────────────┘   ││││
│  │  │  └─────────────────────────────────────────────────┘│││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

By mounting `app.vue`, we get:
- Real Pinia stores with cross-module state
- Real event bus communication
- Real keyboard shortcut handling
- Real modal flows
- Real localStorage persistence

---

## Test File Structure

```
src/tests/integration/
├── app-page.ts                    # Shared Page Object Factory
├── journeys/
│   ├── document-management.test.ts
│   ├── share-document.test.ts
│   ├── color-theme.test.ts
│   ├── editor-settings.test.ts
│   ├── view-modes.test.ts
│   └── keyboard-shortcuts.test.ts
└── setup.ts                       # Test-specific setup if needed
```

---

## The Page Object Factory

**File:** `src/tests/integration/app-page.ts`

This is the **single source of truth** for all DOM interactions. Tests never touch selectors directly.

```typescript
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import App from '~/app.vue'

export async function createAppPage() {
  const user = userEvent.setup()

  await mountSuspended(App, { route: '/' })

  // Wait for full hydration
  await waitFor(() => {
    expect(screen.getByRole('banner')).toBeVisible() // Header
  })

  return {
    user,

    // ═══════════════════════════════════════════════════════════
    // DOCUMENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    getDocumentList: () => screen.queryByTestId('document-list'),

    getDocumentCount: async (): Promise<number> => {
      const list = screen.queryByTestId('document-list')
      if (!list) return 0
      const items = list.querySelectorAll('[data-testid^="document-item"]')
      return items.length
    },

    getDocumentByTitle: (title: string) => {
      return screen.queryByRole('button', { name: new RegExp(title, 'i') })
    },

    getActiveDocument: () => {
      return screen.queryByTestId('document-item-active')
    },

    clickCreateDocument: async () => {
      const createBtn = screen.getByRole('button', { name: /new document|create/i })
      await user.click(createBtn)
    },

    selectDocument: async (title: string) => {
      const doc = screen.getByRole('button', { name: new RegExp(title, 'i') })
      await user.click(doc)
    },

    deleteDocument: async (title: string) => {
      const doc = screen.getByRole('button', { name: new RegExp(title, 'i') })
      const deleteBtn = within(doc.closest('[data-testid^="document-item"]')!)
        .getByRole('button', { name: /delete/i })
      await user.click(deleteBtn)
    },

    confirmDeletion: async () => {
      const dialog = await screen.findByRole('dialog')
      const confirmBtn = within(dialog).getByRole('button', { name: /delete|confirm/i })
      await user.click(confirmBtn)
    },

    cancelDeletion: async () => {
      const dialog = await screen.findByRole('dialog')
      const cancelBtn = within(dialog).getByRole('button', { name: /cancel/i })
      await user.click(cancelBtn)
    },

    renameDocument: async (newTitle: string) => {
      const titleInput = screen.getByLabelText(/document title/i)
      await user.clear(titleInput)
      await user.type(titleInput, newTitle)
    },

    // ═══════════════════════════════════════════════════════════
    // EDITOR
    // ═══════════════════════════════════════════════════════════

    getEditor: () => screen.queryByTestId('editor-pane'),

    getEditorContent: () => {
      const editor = screen.queryByTestId('editor-pane')
      return editor?.querySelector('.cm-content')?.textContent ?? ''
    },

    typeInEditor: async (text: string) => {
      const editor = screen.getByTestId('editor-pane')
      const cmContent = editor.querySelector('.cm-content')!
      await user.click(cmContent)
      await user.type(cmContent, text)
    },

    clearEditor: async () => {
      const editor = screen.getByTestId('editor-pane')
      const cmContent = editor.querySelector('.cm-content')!
      await user.click(cmContent)
      await user.keyboard('{Control>}a{/Control}{Backspace}')
    },

    focusEditor: async () => {
      const editor = screen.getByTestId('editor-pane')
      const cmContent = editor.querySelector('.cm-content')!
      await user.click(cmContent)
    },

    // ═══════════════════════════════════════════════════════════
    // PREVIEW
    // ═══════════════════════════════════════════════════════════

    getPreview: () => screen.queryByTestId('preview-pane'),

    getPreviewContent: () => {
      const preview = screen.queryByTestId('preview-pane')
      return preview?.textContent ?? ''
    },

    verifyPreviewContains: async (text: string) => {
      await waitFor(() => {
        const preview = screen.getByTestId('preview-pane')
        expect(preview).toHaveTextContent(text)
      })
    },

    verifyPreviewHasHeading: async (level: 'h1' | 'h2' | 'h3', text: string) => {
      await waitFor(() => {
        const preview = screen.getByTestId('preview-pane')
        const heading = preview.querySelector(level)
        expect(heading).toHaveTextContent(text)
      })
    },

    verifyMermaidDiagramRendered: async () => {
      await waitFor(() => {
        const preview = screen.getByTestId('preview-pane')
        expect(preview.querySelector('svg.mermaid')).toBeInTheDocument()
      })
    },

    // ═══════════════════════════════════════════════════════════
    // VIEW MODES
    // ═══════════════════════════════════════════════════════════

    toggleSidebar: async () => {
      const btn = screen.getByRole('button', { name: /toggle sidebar|hide sidebar|show sidebar/i })
      await user.click(btn)
    },

    verifySidebarVisible: async () => {
      await waitFor(() => {
        expect(screen.getByTestId('document-list')).toBeVisible()
      })
    },

    verifySidebarHidden: async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('document-list')).not.toBeVisible()
      })
    },

    switchToEditorOnly: async () => {
      const btn = screen.getByRole('button', { name: /editor only|editor mode/i })
      await user.click(btn)
    },

    switchToPreviewOnly: async () => {
      const btn = screen.getByRole('button', { name: /preview only|preview mode/i })
      await user.click(btn)
    },

    switchToSplitView: async () => {
      const btn = screen.getByRole('button', { name: /split view|split mode/i })
      await user.click(btn)
    },

    verifyEditorVisible: async () => {
      await waitFor(() => {
        expect(screen.getByTestId('editor-pane')).toBeVisible()
      })
    },

    verifyEditorHidden: async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('editor-pane')).not.toBeVisible()
      })
    },

    verifyPreviewVisible: async () => {
      await waitFor(() => {
        expect(screen.getByTestId('preview-pane')).toBeVisible()
      })
    },

    verifyPreviewHidden: async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('preview-pane')).not.toBeVisible()
      })
    },

    // ═══════════════════════════════════════════════════════════
    // SHARE
    // ═══════════════════════════════════════════════════════════

    clickShareButton: async () => {
      const btn = screen.getByRole('button', { name: /share/i })
      await user.click(btn)
    },

    verifyShareDialogVisible: async () => {
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeVisible()
        expect(screen.getByTestId('share-dialog')).toBeVisible()
      })
    },

    getShareLink: async (): Promise<string> => {
      const input = await screen.findByTestId('share-link-input')
      return (input as HTMLInputElement).value
    },

    clickCopyShareLink: async () => {
      const dialog = screen.getByRole('dialog')
      const copyBtn = within(dialog).getByRole('button', { name: /copy/i })
      await user.click(copyBtn)
    },

    closeShareDialog: async () => {
      const dialog = screen.getByRole('dialog')
      const closeBtn = within(dialog).getByRole('button', { name: /close/i })
      await user.click(closeBtn)
    },

    // ═══════════════════════════════════════════════════════════
    // COLOR THEME
    // ═══════════════════════════════════════════════════════════

    clickColorThemeButton: async () => {
      const btn = screen.getByRole('button', { name: /color|theme/i })
      await user.click(btn)
    },

    verifyColorThemeModalVisible: async () => {
      await waitFor(() => {
        expect(screen.getByTestId('color-theme-modal')).toBeVisible()
      })
    },

    selectColorChannel: async (channel: 'foreground' | 'background' | 'accent') => {
      const btn = screen.getByRole('button', { name: new RegExp(channel, 'i') })
      await user.click(btn)
    },

    setLightnessValue: async (value: number) => {
      const slider = screen.getByLabelText(/lightness/i)
      await user.clear(slider)
      await user.type(slider, String(value))
    },

    resetColorTheme: async () => {
      const btn = screen.getByRole('button', { name: /reset|defaults/i })
      await user.click(btn)
    },

    closeColorThemeModal: async () => {
      await user.keyboard('{Escape}')
    },

    // ═══════════════════════════════════════════════════════════
    // SETTINGS
    // ═══════════════════════════════════════════════════════════

    openSettings: async () => {
      const btn = screen.getByRole('button', { name: /settings/i })
      await user.click(btn)
    },

    verifySettingsModalVisible: async () => {
      await waitFor(() => {
        expect(screen.getByTestId('settings-modal')).toBeVisible()
      })
    },

    toggleVimMode: async () => {
      const modal = screen.getByTestId('settings-modal')
      const toggle = within(modal).getByRole('switch', { name: /vim mode/i })
      await user.click(toggle)
    },

    toggleLineNumbers: async () => {
      const modal = screen.getByTestId('settings-modal')
      const toggle = within(modal).getByRole('switch', { name: /line numbers/i })
      await user.click(toggle)
    },

    closeSettings: async () => {
      await user.keyboard('{Escape}')
    },

    // ═══════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════

    pressKey: async (key: string) => {
      await user.keyboard(`{${key}}`)
    },

    pressKeyCombo: async (combo: string) => {
      // e.g., '{Control>}s{/Control}' for Ctrl+S
      await user.keyboard(combo)
    },

    pressKeySequence: async (keys: string[]) => {
      for (const key of keys) {
        await user.keyboard(key)
      }
    },

    // ═══════════════════════════════════════════════════════════
    // STATUS BAR
    // ═══════════════════════════════════════════════════════════

    getVimModeIndicator: () => {
      return screen.queryByTestId('vim-mode-indicator')?.textContent ?? ''
    },

    verifyVimModeIndicator: async (mode: 'NORMAL' | 'INSERT' | 'VISUAL') => {
      await waitFor(() => {
        const indicator = screen.getByTestId('vim-mode-indicator')
        expect(indicator).toHaveTextContent(mode)
      })
    },

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    closeModal: async () => {
      await user.keyboard('{Escape}')
    },

    waitForHydration: async () => {
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeVisible()
      })
    },
  }
}

export type AppPage = Awaited<ReturnType<typeof createAppPage>>
```

---

## User Journey Tests

### Journey 1: Document Management

**File:** `src/tests/integration/journeys/document-management.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createAppPage } from '../app-page'

describe('Feature: Document Management', () => {

  describe('Scenario: Create new document from sidebar', () => {
    it('Given the app is loaded, When I create a new document, Then it appears in the list', async () => {
      // GIVEN
      const page = await createAppPage()
      const initialCount = await page.getDocumentCount()

      // WHEN
      await page.clickCreateDocument()

      // THEN
      expect(await page.getDocumentCount()).toBe(initialCount + 1)
    })
  })

  describe('Scenario: Switch between documents', () => {
    it('Given I have multiple documents, When I select one, Then its content loads in editor', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clickCreateDocument()
      await page.typeInEditor('# Document Two')
      await page.clickCreateDocument()
      await page.typeInEditor('# Document Three')

      // WHEN - select the second document
      await page.selectDocument('Document Two')

      // THEN
      expect(page.getEditorContent()).toContain('Document Two')
    })
  })

  describe('Scenario: Delete document with confirmation', () => {
    it('Given I have 2 documents, When I delete one and confirm, Then only 1 remains', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clickCreateDocument() // Now we have 2
      expect(await page.getDocumentCount()).toBe(2)

      // WHEN
      await page.deleteDocument('Untitled')
      await page.confirmDeletion()

      // THEN
      expect(await page.getDocumentCount()).toBe(1)
    })
  })

  describe('Scenario: Cancel document deletion', () => {
    it('Given I click delete, When I cancel, Then document is preserved', async () => {
      // GIVEN
      const page = await createAppPage()
      const initialCount = await page.getDocumentCount()

      // WHEN
      await page.deleteDocument('Welcome')
      await page.cancelDeletion()

      // THEN
      expect(await page.getDocumentCount()).toBe(initialCount)
    })
  })

  describe('Scenario: Toggle sidebar visibility', () => {
    it('Given sidebar is visible, When I toggle it, Then it hides and shows', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.verifySidebarVisible()

      // WHEN
      await page.toggleSidebar()

      // THEN
      await page.verifySidebarHidden()

      // AND WHEN I toggle again
      await page.toggleSidebar()

      // THEN
      await page.verifySidebarVisible()
    })
  })
})
```

### Journey 2: Editor and Preview

**File:** `src/tests/integration/journeys/editor-preview.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createAppPage } from '../app-page'

describe('Feature: Markdown Editing and Preview', () => {

  describe('Scenario: Live preview updates as I type', () => {
    it('Given I am in split view, When I type markdown, Then preview updates', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clearEditor()

      // WHEN
      await page.typeInEditor('# Hello World')

      // THEN
      await page.verifyPreviewContains('Hello World')
      await page.verifyPreviewHasHeading('h1', 'Hello World')
    })
  })

  describe('Scenario: Render Mermaid diagrams', () => {
    it('Given I type a mermaid code block, When preview renders, Then I see SVG diagram', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clearEditor()

      // WHEN
      await page.typeInEditor('```mermaid\ngraph TD\n  A --> B\n```')

      // THEN
      await page.verifyMermaidDiagramRendered()
    })
  })

  describe('Scenario: Code syntax highlighting', () => {
    it('Given I type a code block, When preview renders, Then code is highlighted', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clearEditor()

      // WHEN
      await page.typeInEditor('```javascript\nconst x = 42\n```')

      // THEN
      await page.verifyPreviewContains('const')
      // Shiki adds specific classes for highlighting
    })
  })
})
```

### Journey 3: View Mode Switching

**File:** `src/tests/integration/journeys/view-modes.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createAppPage } from '../app-page'

describe('Feature: View Mode Switching', () => {

  describe('Scenario: Switch to editor-only mode', () => {
    it('Given I am in split view, When I switch to editor-only, Then preview hides', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.verifyEditorVisible()
      await page.verifyPreviewVisible()

      // WHEN
      await page.switchToEditorOnly()

      // THEN
      await page.verifyEditorVisible()
      await page.verifyPreviewHidden()
    })
  })

  describe('Scenario: Switch to preview-only mode', () => {
    it('Given I am in split view, When I switch to preview-only, Then editor hides', async () => {
      // GIVEN
      const page = await createAppPage()

      // WHEN
      await page.switchToPreviewOnly()

      // THEN
      await page.verifyEditorHidden()
      await page.verifyPreviewVisible()
    })
  })

  describe('Scenario: Return to split view', () => {
    it('Given I am in preview-only, When I switch to split, Then both are visible', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.switchToPreviewOnly()

      // WHEN
      await page.switchToSplitView()

      // THEN
      await page.verifyEditorVisible()
      await page.verifyPreviewVisible()
    })
  })
})
```

### Journey 4: Share Document

**File:** `src/tests/integration/journeys/share-document.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAppPage } from '../app-page'

describe('Feature: Document Sharing', () => {

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })
  })

  describe('Scenario: Generate share link', () => {
    it('Given a document with content, When I open share dialog, Then I see a share URL', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clearEditor()
      await page.typeInEditor('# Shared Document\n\nThis is shared content.')

      // WHEN
      await page.clickShareButton()

      // THEN
      await page.verifyShareDialogVisible()
      const shareLink = await page.getShareLink()
      expect(shareLink).toContain('#share=')
    })
  })

  describe('Scenario: Copy share link to clipboard', () => {
    it('Given share dialog is open, When I click copy, Then link is in clipboard', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clickShareButton()
      await page.verifyShareDialogVisible()

      // WHEN
      await page.clickCopyShareLink()

      // THEN
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  describe('Scenario: Close share dialog', () => {
    it('Given share dialog is open, When I close it, Then dialog disappears', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clickShareButton()
      await page.verifyShareDialogVisible()

      // WHEN
      await page.closeShareDialog()

      // THEN
      // Dialog should be closed (not visible)
    })
  })
})
```

### Journey 5: Color Theme Customization

**File:** `src/tests/integration/journeys/color-theme.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createAppPage } from '../app-page'

describe('Feature: Color Theme Customization', () => {

  describe('Scenario: Open color theme modal', () => {
    it('Given the app is loaded, When I click color theme button, Then modal opens', async () => {
      // GIVEN
      const page = await createAppPage()

      // WHEN
      await page.clickColorThemeButton()

      // THEN
      await page.verifyColorThemeModalVisible()
    })
  })

  describe('Scenario: Change foreground color', () => {
    it('Given color modal is open, When I adjust lightness, Then preview updates', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clickColorThemeButton()
      await page.verifyColorThemeModalVisible()

      // WHEN
      await page.selectColorChannel('foreground')
      await page.setLightnessValue(0.9)

      // THEN
      // CSS variable should update (can check computed style)
    })
  })

  describe('Scenario: Reset to default theme', () => {
    it('Given I changed colors, When I reset, Then defaults are restored', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.clickColorThemeButton()
      await page.selectColorChannel('foreground')
      await page.setLightnessValue(0.5)

      // WHEN
      await page.resetColorTheme()

      // THEN
      // Colors should be back to defaults
    })
  })

  describe('Scenario: Open color theme with keyboard shortcut', () => {
    it('Given app is focused, When I press g then c, Then color modal opens', async () => {
      // GIVEN
      const page = await createAppPage()

      // WHEN
      await page.pressKeySequence(['g', 'c'])

      // THEN
      await page.verifyColorThemeModalVisible()
    })
  })
})
```

### Journey 6: Editor Settings

**File:** `src/tests/integration/journeys/editor-settings.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createAppPage } from '../app-page'

describe('Feature: Editor Settings', () => {

  describe('Scenario: Enable Vim mode', () => {
    it('Given settings modal is open, When I enable Vim mode, Then status bar shows NORMAL', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.openSettings()
      await page.verifySettingsModalVisible()

      // WHEN
      await page.toggleVimMode()
      await page.closeSettings()

      // THEN
      await page.focusEditor()
      await page.verifyVimModeIndicator('NORMAL')
    })
  })

  describe('Scenario: Vim mode INSERT state', () => {
    it('Given Vim mode enabled, When I press i, Then mode changes to INSERT', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.openSettings()
      await page.toggleVimMode()
      await page.closeSettings()
      await page.focusEditor()

      // WHEN
      await page.pressKey('i')

      // THEN
      await page.verifyVimModeIndicator('INSERT')
    })
  })

  describe('Scenario: Toggle line numbers', () => {
    it('Given settings modal, When I toggle line numbers, Then editor updates', async () => {
      // GIVEN
      const page = await createAppPage()
      await page.openSettings()

      // WHEN
      await page.toggleLineNumbers()
      await page.closeSettings()

      // THEN
      // Line numbers should be hidden/shown in editor
    })
  })

  describe('Scenario: Open settings with keyboard shortcut', () => {
    it('Given app is focused, When I press g then s, Then settings opens', async () => {
      // GIVEN
      const page = await createAppPage()

      // WHEN
      await page.pressKeySequence(['g', 's'])

      // THEN
      await page.verifySettingsModalVisible()
    })
  })
})
```

### Journey 7: Complete New User Flow

**File:** `src/tests/integration/journeys/new-user-flow.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAppPage } from '../app-page'

describe('User Journey: New User Creates and Shares a Document', () => {

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
  })

  it('complete flow from app load to sharing', async () => {
    const page = await createAppPage()

    // Step 1: User sees welcome document
    expect(await page.getDocumentCount()).toBeGreaterThan(0)

    // Step 2: User creates new document
    await page.clickCreateDocument()
    const countAfterCreate = await page.getDocumentCount()
    expect(countAfterCreate).toBeGreaterThan(1)

    // Step 3: User types content
    await page.clearEditor()
    await page.typeInEditor('# My First Note\n\nHello world!')

    // Step 4: User verifies preview shows rendered markdown
    await page.verifyPreviewContains('My First Note')
    await page.verifyPreviewHasHeading('h1', 'My First Note')

    // Step 5: User toggles to preview-only mode
    await page.switchToPreviewOnly()
    await page.verifyEditorHidden()
    await page.verifyPreviewVisible()

    // Step 6: User goes back to split and shares
    await page.switchToSplitView()
    await page.clickShareButton()
    await page.verifyShareDialogVisible()

    const shareUrl = await page.getShareLink()
    expect(shareUrl).toContain('#share=')

    // Step 7: User copies link
    await page.clickCopyShareLink()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(shareUrl)
  })
})
```

---

## What to Mock vs Keep Real

### KEEP REAL ✅
| Component | Why |
|-----------|-----|
| Pinia stores | Test real state management |
| Vue Router | Test real navigation |
| Event Bus | Test cross-module events |
| All composables | Test reactive behavior |
| localStorage | Test persistence (cleared in beforeEach) |
| Nuxt UI components | Test actual rendering |

### MOCK ⚠️
| Component | Why | How |
|-----------|-----|-----|
| `navigator.clipboard` | Not in jsdom | `vi.fn()` |
| `window.location` | For share URL tests | `Object.defineProperty` |
| External APIs | Would be slow/flaky | Not applicable yet |

The existing `tests/setup/vitest.setup.ts` already mocks:
- `ResizeObserver`
- `crypto.randomUUID`
- `matchMedia`

---

## Implementation Priority

| Priority | Journey | Coverage Impact | Modules Covered |
|----------|---------|-----------------|-----------------|
| 1 | Document Management | HIGH | documents/, shared/composables |
| 2 | Editor + Preview | HIGH | editor/, markdown-preview/ |
| 3 | View Modes | MEDIUM | shared/composables/useViewMode |
| 4 | Share Document | MEDIUM | share/ |
| 5 | Color Theme | MEDIUM | color-theme/ |
| 6 | Editor Settings | MEDIUM | editor/composables |
| 7 | Keyboard Shortcuts | MEDIUM | shortcuts/ |
| 8 | Full User Journey | HIGH | All modules |

---

## Running Tests

```bash
# Run all integration tests
pnpm test:vitest

# Run specific journey
pnpm test:vitest src/tests/integration/journeys/document-management.test.ts

# Run with coverage
pnpm test:vitest --coverage

# Watch mode
pnpm test:vitest --watch
```

---

## Key Differences from Previous Plan

| Aspect | ❌ Previous (Wrong) | ✅ Current (Correct) |
|--------|---------------------|----------------------|
| Mount target | Isolated components | Full `app.vue` |
| Test style | Unit-like assertions | BDD user journeys |
| Selectors | Direct DOM queries | Page Object encapsulation |
| State | Mocked stores | Real Pinia stores |
| Coverage source | Testing internals | Testing user behavior |
