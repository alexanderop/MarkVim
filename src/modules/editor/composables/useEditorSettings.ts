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

  const updateTheme = (theme: EditorSettings['theme']) => {
    settings.value.theme = theme
    saveToLocalStorage()

    if (!isMounted.value)
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
    if (isMounted.value) {
      updateTheme(settings.value.theme)
    }
  })

  onMounted(() => {
    updateTheme(settings.value.theme)
  })

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
    clearAllData,
  }
}
