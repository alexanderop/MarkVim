/**
 * Editor Module API
 *
 * This file defines the public interface for the editor module.
 * Other modules should import from this API file, not directly from internal files.
 */

import type { Ref } from 'vue'
import type { Result } from '~/shared/utils/result'
import { type EditorSettings, useEditorSettings } from './composables/useEditorSettings'
import { useVimMode } from './composables/useVimMode'

// Export components that are used externally
export { default as EditorMarkdown } from './components/EditorMarkdown.vue'

// Export types
export type { EditorSettings } from './composables/useEditorSettings'
export type { EditorEvents } from './events'

/**
 * Public facade for editor module.
 * Provides unified access to editor settings and vim mode.
 * Use this composable from any module (same or cross-module).
 */
export function useEditor(): {
  // Settings state
  settings: Ref<EditorSettings>
  // Vim mode state
  currentVimMode: Readonly<Ref<string>>
  // Settings actions
  toggleVimMode: () => void
  toggleLineNumbers: () => void
  togglePreviewSync: () => void
  updateFontSize: (size: number) => void
  resetToDefaults: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => Result<void, Error>
  clearAllData: () => void
  // Vim mode actions
  handleVimModeChange: (mode: string, subMode?: string) => void
} {
  const editorSettings = useEditorSettings()
  const vimMode = useVimMode()

  return {
    // Settings state
    settings: editorSettings.settings,
    // Vim mode state
    currentVimMode: vimMode.currentVimMode,
    // Settings actions
    toggleVimMode: editorSettings.toggleVimMode,
    toggleLineNumbers: editorSettings.toggleLineNumbers,
    togglePreviewSync: editorSettings.togglePreviewSync,
    updateFontSize: editorSettings.updateFontSize,
    resetToDefaults: editorSettings.resetToDefaults,
    exportSettings: editorSettings.exportSettings,
    importSettings: editorSettings.importSettings,
    clearAllData: editorSettings.clearAllData,
    // Vim mode actions
    handleVimModeChange: vimMode.handleVimModeChange,
  }
}

/**
 * Direct access to editor settings (when vim mode is not needed).
 * For most use cases, prefer useEditor() for the full facade.
 */
export { useEditorSettings }

/**
 * Direct access to vim mode (when editor settings are not needed).
 * For most use cases, prefer useEditor() for the full facade.
 */
export { useVimMode }
