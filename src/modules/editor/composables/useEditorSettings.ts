export interface EditorSettings {
  // Vim configuration
  vimMode: boolean
  vimKeymap: 'vim' | 'emacs' | 'sublime' | 'vscode'

  // Editor appearance
  theme: 'dark' | 'light' | 'auto'
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
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'mono',
  lineNumbers: true,
  lineNumberMode: 'relative',
  lineWrapping: true,

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
  const settings = useLocalStorage('markvim-settings', DEFAULT_EDITOR_CONFIG)

  const toggleVimMode = () => {
    settings.value.vimMode = !settings.value.vimMode
  }

  const toggleLineNumbers = () => {
    settings.value.lineNumbers = !settings.value.lineNumbers
  }

  const togglePreviewSync = () => {
    settings.value.previewSync = !settings.value.previewSync
  }

  const updateTheme = (theme: EditorSettings['theme']) => {
    settings.value.theme = theme

    if (!import.meta.client)
      return

    const htmlElement = document.documentElement

    if (theme === 'dark') {
      htmlElement.classList.add('dark')
    }
    else if (theme === 'light') {
      htmlElement.classList.remove('dark')
    }
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        htmlElement.classList.add('dark')
      }
      else {
        htmlElement.classList.remove('dark')
      }
    }
  }
  
  onMounted(() => {
    updateTheme(settings.value.theme)
  })

  const updateFontSize = (size: number) => {
    settings.value.fontSize = Math.max(8, Math.min(32, size))
  }

  const resetToDefaults = () => {
    settings.value = { ...DEFAULT_EDITOR_CONFIG }
  }

  const exportSettings = () => {
    return JSON.stringify(settings.value, null, 2)
  }

  const importSettings = (settingsJson: string) => {
    try {
      const imported = JSON.parse(settingsJson)
      settings.value = { ...DEFAULT_EDITOR_CONFIG, ...imported }
      return true
    }
    catch {
      return false
    }
  }

  const clearAllLocalData = () => {
    if (import.meta.client) {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('markvim-')) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Don't reset settings here as it will recreate localStorage entries
      // The page reload will handle the reset to defaults
    }
  }

  return {
    settings,
    toggleVimMode,
    toggleLineNumbers,
    togglePreviewSync,
    updateTheme,
    updateFontSize,
    resetToDefaults,
    exportSettings,
    importSettings,
    clearAllLocalData,
  }
}
