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

  const updateTheme = (theme: EditorSettings['theme']) => {
    settings.value.theme = theme
  }

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

  return {
    settings: readonly(settings),
    toggleVimMode,
    toggleLineNumbers,
    updateTheme,
    updateFontSize,
    resetToDefaults,
    exportSettings,
    importSettings,
  }
}
