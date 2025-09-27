import { useState } from '#imports'
import { useCssVar, useMounted } from '@vueuse/core'
import { watch, watchEffect } from 'vue'
import { useDataReset } from '@/shared/composables/useDataReset'
import { onAppEvent } from '@/shared/utils/eventBus'

export interface EditorSettings {
  // Vim configuration
  vimMode: boolean
  vimKeymap: 'vim' | 'emacs' | 'sublime' | 'vscode'

  // Editor appearance
  fontSize: number
  fontFamily: 'mono' | 'sans'
  lineNumbers: boolean
  lineNumberMode: 'absolute' | 'relative' | 'both'
  lineWrapping: boolean

  // Code formatting
  tabSize: number
  insertSpaces: boolean
  autoIndent: boolean

  // Markdown specific
  livePreview: boolean
  previewSync: boolean
  markdownExtensions: {
    tables: boolean
    footnotes: boolean
    mathBlocks: boolean
    codeBlocks: boolean
  }

  // Editor behavior
  autoSave: boolean
  autoSaveDelay: number
  bracketMatching: boolean
  highlightActiveLine: boolean
}

export const DEFAULT_EDITOR_CONFIG: EditorSettings = {
  // Vim configuration
  vimMode: true,
  vimKeymap: 'vim',

  // Editor appearance
  fontSize: 14,
  fontFamily: 'mono',
  lineNumbers: true,
  lineNumberMode: 'relative',
  lineWrapping: false,

  // Code formatting
  tabSize: 2,
  insertSpaces: true,
  autoIndent: true,

  // Markdown specific
  livePreview: true,
  previewSync: true,
  markdownExtensions: {
    tables: true,
    footnotes: true,
    mathBlocks: true,
    codeBlocks: true,
  },

  // Editor behavior
  autoSave: true,
  autoSaveDelay: 1000,
  bracketMatching: true,
  highlightActiveLine: true,
}

export function useEditorSettings() {
  const isMounted = useMounted()

  const settings = useState<EditorSettings>('markvim-settings', () => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('markvim-settings')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          return { ...DEFAULT_EDITOR_CONFIG, ...parsed }
        }
        catch {
          return { ...DEFAULT_EDITOR_CONFIG }
        }
      }
    }
    return { ...DEFAULT_EDITOR_CONFIG }
  })

  // CSS custom property for font size
  const fontSizeVar = useCssVar('--font-size-base')

  // Update CSS custom property when font size changes
  watchEffect(() => {
    fontSizeVar.value = `${settings.value.fontSize}px`
  })

  const saveToLocalStorage = () => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      localStorage.setItem('markvim-settings', JSON.stringify(settings.value))
    }
  }

  const toggleVimMode = () => {
    settings.value.vimMode = !settings.value.vimMode
    saveToLocalStorage()
  }

  const toggleLineNumbers = () => {
    settings.value.lineNumbers = !settings.value.lineNumbers
    saveToLocalStorage()
  }

  const togglePreviewSync = () => {
    settings.value.previewSync = !settings.value.previewSync
    saveToLocalStorage()
  }

  const updateFontSize = (size: number) => {
    settings.value.fontSize = Math.max(8, Math.min(32, size))
    saveToLocalStorage()
  }

  const resetToDefaults = () => {
    settings.value = { ...DEFAULT_EDITOR_CONFIG }
    saveToLocalStorage()
  }

  const exportSettings = () => {
    return JSON.stringify(settings.value, null, 2)
  }

  const importSettings = (settingsJson: string) => {
    try {
      const imported = JSON.parse(settingsJson)
      settings.value = { ...DEFAULT_EDITOR_CONFIG, ...imported }
      saveToLocalStorage()
      return true
    }
    catch {
      return false
    }
  }

  const { clearAllData } = useDataReset()

  const { onDataReset } = useDataReset()
  onDataReset(() => {
    settings.value = { ...DEFAULT_EDITOR_CONFIG }
  })

  // Auto-save settings when they change
  watch(settings, () => {
    saveToLocalStorage()
  }, { deep: true })

  // Listen for settings events from the event bus
  onAppEvent('settings:toggle-vim', () => {
    toggleVimMode()
  })

  onAppEvent('settings:toggle-line-numbers', () => {
    toggleLineNumbers()
  })

  onAppEvent('settings:toggle-preview-sync', () => {
    togglePreviewSync()
  })

  return {
    settings,
    toggleVimMode,
    toggleLineNumbers,
    togglePreviewSync,
    updateFontSize,
    resetToDefaults,
    exportSettings,
    importSettings,
    clearAllData,
  }
}
