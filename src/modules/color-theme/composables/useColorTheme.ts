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

function oklchToString(color: OklchColor): string {
  const alpha = color.a !== undefined ? ` / ${color.a.toFixed(3)}` : ''
  return `oklch(${(color.l * 100).toFixed(1)}% ${color.c.toFixed(3)} ${color.h.toFixed(0)}${alpha})`
}

export function useColorTheme() {
  // Reactive theme stored in localStorage with VueUse
  const theme = useLocalStorage<ColorTheme>('markvim-color-theme', DEFAULT_COLOR_THEME, {
    mergeDefaults: true,
  })

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
    backgroundVar.value = oklchToString(theme.value.background)
    foregroundVar.value = oklchToString(theme.value.foreground)
    accentVar.value = oklchToString(theme.value.accent)
    mutedVar.value = oklchToString(theme.value.muted)
    borderVar.value = oklchToString(theme.value.border)
    alertNoteVar.value = oklchToString(theme.value.alertNote)
    alertTipVar.value = oklchToString(theme.value.alertTip)
    alertImportantVar.value = oklchToString(theme.value.alertImportant)
    alertWarningVar.value = oklchToString(theme.value.alertWarning)
    alertCautionVar.value = oklchToString(theme.value.alertCaution)

    // CodeMirror syntax highlighting colors - accent for headings, foreground for regular text
    cmContentVar.value = oklchToString(theme.value.foreground)
    cmHeading1Var.value = oklchToString(theme.value.accent)
    cmHeading2Var.value = oklchToString(theme.value.accent)
    cmHeading3Var.value = oklchToString(theme.value.accent)
    cmHeading4Var.value = oklchToString(theme.value.accent)
    cmHeading5Var.value = oklchToString(theme.value.accent)
    cmHeading6Var.value = oklchToString(theme.value.accent)
    cmKeywordVar.value = oklchToString(theme.value.accent)
    cmStringVar.value = oklchToString(theme.value.foreground)
    cmCommentVar.value = oklchToString(theme.value.foreground)
    cmNumberVar.value = oklchToString(theme.value.accent)
    cmOperatorVar.value = oklchToString(theme.value.foreground)
    cmVariableNameVar.value = oklchToString(theme.value.foreground)
    cmPunctuationVar.value = oklchToString(theme.value.foreground)
    cmBracketVar.value = oklchToString(theme.value.foreground)
    cmLinkVar.value = oklchToString(theme.value.accent)
    cmEmphasisVar.value = oklchToString(theme.value.foreground)
    cmStrongVar.value = oklchToString(theme.value.foreground)
    cmStrikethroughVar.value = oklchToString(theme.value.foreground)

    // CodeMirror selection background - use muted color with some transparency for vim visual mode
    cmSelectionBackgroundVar.value = oklchToString({ ...theme.value.muted, a: 0.3 })
  })

  // Update a specific color in the theme
  const updateColor = (colorKey: keyof ColorTheme, color: OklchColor) => {
    theme.value = {
      ...theme.value,
      [colorKey]: color,
    }
  }

  // Reset theme to defaults
  const resetToDefaults = () => {
    theme.value = { ...DEFAULT_COLOR_THEME }
  }

  // Export theme as JSON string
  const exportTheme = (): string => {
    return JSON.stringify(theme.value, null, 2)
  }

  // Import theme from JSON string
  const importTheme = (themeJson: string): boolean => {
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

      theme.value = parsedTheme
      return true
    }
    catch {
      return false
    }
  }

  return {
    theme: readonly(theme),
    updateColor,
    resetToDefaults,
    exportTheme,
    importTheme,
    oklchToString,
  }
}
