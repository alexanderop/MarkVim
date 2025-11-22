/**
 * Test Storage Helpers
 *
 * Provides type-safe helpers for setting up localStorage state in integration tests.
 * Use these helpers to pre-populate storage BEFORE mounting the app to test
 * different initial states.
 *
 * Usage:
 * ```typescript
 * import { testStorage } from '../test-storage'
 *
 * beforeEach(() => {
 *   testStorage.clear()
 * })
 *
 * it('should load custom theme from storage', async () => {
 *   testStorage.colorTheme.set({ ...DEFAULT_COLOR_THEME, background: { l: 0.5, c: 0, h: 0 } })
 *   const app = await mountFullApp()
 *   // ... assertions
 * })
 * ```
 */
import type { ColorTheme } from '@modules/color-theme'

// Storage key constants - must match the keys used in the app
export const STORAGE_KEYS = {
  COLOR_THEME: 'markvim-color-theme',
  DOCUMENTS: 'markvim-documents',
  FEATURE_FLAGS: 'markvim-feature-flags',
  EDITOR_SETTINGS: 'markvim-settings',
  VIEW_MODE: 'markvim-view-mode',
  SIDEBAR_VISIBLE: 'markvim-sidebar-visible',
  PANE_WIDTH: 'markvim-pane-width',
  COMMAND_HISTORY: 'markvim-command-history',
} as const

// Type definitions for stored data
export interface StoredDocument {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface DocumentsState {
  documents: StoredDocument[]
  activeDocumentId: string | null
}

export interface FeatureFlagsState {
  share: boolean
  colorTheme: boolean
  documents: boolean
}

export interface EditorSettings {
  vimMode: boolean
  relativeLineNumbers: boolean
  showLineNumbers: boolean
  wordWrap: boolean
  tabSize: number
}

export type ViewMode = 'split' | 'editor-only' | 'preview-only'

// Generic storage helper
function createStorageHelper<T>(key: string): {
  set: (value: T) => void
  get: () => T | null
  remove: () => void
} {
  return {
    set: (value: T): void => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    get: (): T | null => {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    },
    remove: (): void => {
      localStorage.removeItem(key)
    },
  }
}

// Typed storage helpers for each storage key
export const testStorage = {
  /** Clear all markvim localStorage keys */
  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  },

  /** Clear ALL localStorage (use with caution) */
  clearAll: (): void => {
    localStorage.clear()
  },

  /** Color theme storage helpers */
  colorTheme: createStorageHelper<ColorTheme>(STORAGE_KEYS.COLOR_THEME),

  /** Documents storage helpers */
  documents: createStorageHelper<DocumentsState>(STORAGE_KEYS.DOCUMENTS),

  /** Feature flags storage helpers */
  featureFlags: createStorageHelper<FeatureFlagsState>(STORAGE_KEYS.FEATURE_FLAGS),

  /** Editor settings storage helpers */
  editorSettings: createStorageHelper<EditorSettings>(STORAGE_KEYS.EDITOR_SETTINGS),

  /** View mode storage helpers */
  viewMode: createStorageHelper<ViewMode>(STORAGE_KEYS.VIEW_MODE),

  /** Sidebar visibility storage helpers */
  sidebarVisible: createStorageHelper<boolean>(STORAGE_KEYS.SIDEBAR_VISIBLE),

  /** Pane width storage helpers */
  paneWidth: createStorageHelper<number>(STORAGE_KEYS.PANE_WIDTH),

  /** Command history storage helpers */
  commandHistory: createStorageHelper<string[]>(STORAGE_KEYS.COMMAND_HISTORY),
}

// Default values for testing (matching app defaults)
export const DEFAULT_COLOR_THEME: ColorTheme = {
  background: { l: 0.12, c: 0.002, h: 0 },
  foreground: { l: 0.96, c: 0, h: 0 },
  accent: { l: 0.60, c: 0.18, h: 240 },
  muted: { l: 0.20, c: 0.002, h: 0 },
  border: { l: 0.25, c: 0.003, h: 20 },
  alertNote: { l: 0.60, c: 0.18, h: 240 },
  alertTip: { l: 0.65, c: 0.18, h: 140 },
  alertImportant: { l: 0.65, c: 0.18, h: 280 },
  alertWarning: { l: 0.65, c: 0.18, h: 80 },
  alertCaution: { l: 0.65, c: 0.18, h: 20 },
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlagsState = {
  share: true,
  colorTheme: true,
  documents: true,
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  vimMode: true,
  relativeLineNumbers: false,
  showLineNumbers: true,
  wordWrap: true,
  tabSize: 2,
}
