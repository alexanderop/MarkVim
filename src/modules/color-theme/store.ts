export interface OklchColor {
  l: number // Lightness: 0-1
  c: number // Chroma: 0-0.4
  h: number // Hue: 0-360
  a?: number // Alpha: 0-1 (optional for backwards compatibility)
}

export interface ColorTheme {
  background: OklchColor
  foreground: OklchColor
  accent: OklchColor
  muted: OklchColor
  border: OklchColor
  alertNote: OklchColor
  alertTip: OklchColor
  alertImportant: OklchColor
  alertWarning: OklchColor
  alertCaution: OklchColor
}

// Default dark mode colors
export const DEFAULT_COLOR_THEME: ColorTheme = {
  background: { l: 0.12, c: 0.002, h: 0 }, // oklch(12% 0.002 0) - Deep dark background
  foreground: { l: 0.96, c: 0, h: 0 }, // oklch(96% 0 0) - Light text
  accent: { l: 0.60, c: 0.18, h: 240 }, // oklch(60% 0.18 240) - Brighter blue for dark mode
  muted: { l: 0.20, c: 0.002, h: 0 }, // oklch(20% 0.002 0) - Dark muted surfaces
  border: { l: 0.25, c: 0.003, h: 20 }, // oklch(25% 0.003 20) - Subtle dark borders
  alertNote: { l: 0.60, c: 0.18, h: 240 }, // Blue - Note/Info
  alertTip: { l: 0.65, c: 0.18, h: 140 }, // Green - Tips/Success
  alertImportant: { l: 0.65, c: 0.18, h: 280 }, // Purple - Important
  alertWarning: { l: 0.65, c: 0.18, h: 80 }, // Orange - Warning
  alertCaution: { l: 0.65, c: 0.18, h: 20 }, // Red - Danger/Caution
}

// Private internal store (not exported)
const _useColorThemeInternalStore = defineStore('color-theme-internal', () => {
  const _theme = useLocalStorage<ColorTheme>('markvim-color-theme', DEFAULT_COLOR_THEME, {
    mergeDefaults: true,
  })

  return {
    _theme,
  }
})

// Public store (exported)
export const useColorThemeStore = defineStore('color-theme', () => {
  // Get internal store instance
  const internalStore = _useColorThemeInternalStore()

  // Helper function for converting OKLCH to string
  function oklchToString(color: OklchColor): string {
    const alpha = color.a !== undefined ? ` / ${color.a.toFixed(3)}` : ''
    return `oklch(${(color.l * 100).toFixed(1)}% ${color.c.toFixed(3)} ${color.h.toFixed(0)}${alpha})`
  }

  // CSS custom property references
  const backgroundVar = useCssVar('--background')
  const foregroundVar = useCssVar('--foreground')
  const accentVar = useCssVar('--accent')
  const mutedVar = useCssVar('--muted')
  const borderVar = useCssVar('--border')
  const alertNoteVar = useCssVar('--alert-note')
  const alertTipVar = useCssVar('--alert-tip')
  const alertImportantVar = useCssVar('--alert-important')
  const alertWarningVar = useCssVar('--alert-warning')
  const alertCautionVar = useCssVar('--alert-caution')

  // CodeMirror syntax highlighting CSS custom properties
  const cmContentVar = useCssVar('--cm-content')
  const cmHeading1Var = useCssVar('--cm-heading1')
  const cmHeading2Var = useCssVar('--cm-heading2')
  const cmHeading3Var = useCssVar('--cm-heading3')
  const cmHeading4Var = useCssVar('--cm-heading4')
  const cmHeading5Var = useCssVar('--cm-heading5')
  const cmHeading6Var = useCssVar('--cm-heading6')
  const cmKeywordVar = useCssVar('--cm-keyword')
  const cmStringVar = useCssVar('--cm-string')
  const cmCommentVar = useCssVar('--cm-comment')
  const cmNumberVar = useCssVar('--cm-number')
  const cmOperatorVar = useCssVar('--cm-operator')
  const cmVariableNameVar = useCssVar('--cm-variableName')
  const cmPunctuationVar = useCssVar('--cm-punctuation')
  const cmBracketVar = useCssVar('--cm-bracket')
  const cmLinkVar = useCssVar('--cm-link')
  const cmEmphasisVar = useCssVar('--cm-emphasis')
  const cmStrongVar = useCssVar('--cm-strong')
  const cmStrikethroughVar = useCssVar('--cm-strikethrough')

  // CodeMirror selection background - use muted color for vim visual mode
  const cmSelectionBackgroundVar = useCssVar('--cm-selection-background')

  // Update CSS custom properties when theme changes
  watchEffect(() => {
    const currentTheme = internalStore._theme

    // Guard against undefined theme during initialization
    if (!currentTheme || !currentTheme.background) {
      return
    }

    backgroundVar.value = oklchToString(currentTheme.background)
    foregroundVar.value = oklchToString(currentTheme.foreground)
    accentVar.value = oklchToString(currentTheme.accent)
    mutedVar.value = oklchToString(currentTheme.muted)
    borderVar.value = oklchToString(currentTheme.border)
    alertNoteVar.value = oklchToString(currentTheme.alertNote)
    alertTipVar.value = oklchToString(currentTheme.alertTip)
    alertImportantVar.value = oklchToString(currentTheme.alertImportant)
    alertWarningVar.value = oklchToString(currentTheme.alertWarning)
    alertCautionVar.value = oklchToString(currentTheme.alertCaution)

    // CodeMirror syntax highlighting colors - accent for headings, foreground for regular text
    cmContentVar.value = oklchToString(currentTheme.foreground)
    cmHeading1Var.value = oklchToString(currentTheme.accent)
    cmHeading2Var.value = oklchToString(currentTheme.accent)
    cmHeading3Var.value = oklchToString(currentTheme.accent)
    cmHeading4Var.value = oklchToString(currentTheme.accent)
    cmHeading5Var.value = oklchToString(currentTheme.accent)
    cmHeading6Var.value = oklchToString(currentTheme.accent)
    cmKeywordVar.value = oklchToString(currentTheme.accent)
    cmStringVar.value = oklchToString(currentTheme.foreground)
    cmCommentVar.value = oklchToString(currentTheme.foreground)
    cmNumberVar.value = oklchToString(currentTheme.accent)
    cmOperatorVar.value = oklchToString(currentTheme.foreground)
    cmVariableNameVar.value = oklchToString(currentTheme.foreground)
    cmPunctuationVar.value = oklchToString(currentTheme.foreground)
    cmBracketVar.value = oklchToString(currentTheme.foreground)
    cmLinkVar.value = oklchToString(currentTheme.accent)
    cmEmphasisVar.value = oklchToString(currentTheme.foreground)
    cmStrongVar.value = oklchToString(currentTheme.foreground)
    cmStrikethroughVar.value = oklchToString(currentTheme.foreground)

    // CodeMirror selection background - use muted color with some transparency for vim visual mode
    cmSelectionBackgroundVar.value = oklchToString({ ...currentTheme.muted, a: 0.3 })
  })

  // Public API - computed properties
  const theme = computed(() => internalStore._theme)

  // Public API - actions
  function updateColor(colorKey: keyof ColorTheme, color: OklchColor) {
    internalStore._theme = {
      ...internalStore._theme,
      [colorKey]: color,
    }
  }

  function resetToDefaults() {
    internalStore._theme = { ...DEFAULT_COLOR_THEME }
  }

  function exportTheme(): string {
    return JSON.stringify(internalStore._theme, null, 2)
  }

  function importTheme(themeJson: string): boolean {
    try {
      const parsedTheme = JSON.parse(themeJson) as ColorTheme

      // Validate the theme structure
      const requiredKeys: (keyof ColorTheme)[] = ['background', 'foreground', 'accent', 'muted', 'border', 'alertNote', 'alertTip', 'alertImportant', 'alertWarning', 'alertCaution']
      const isValid = requiredKeys.every(key =>
        parsedTheme[key]
        && typeof parsedTheme[key].l === 'number'
        && typeof parsedTheme[key].c === 'number'
        && typeof parsedTheme[key].h === 'number'
        && (parsedTheme[key].a === undefined || typeof parsedTheme[key].a === 'number'),
      )

      if (!isValid) {
        return false
      }

      internalStore._theme = parsedTheme
      return true
    }
    catch {
      return false
    }
  }

  return {
    theme,
    updateColor,
    resetToDefaults,
    exportTheme,
    importTheme,
    oklchToString,
  }
})
