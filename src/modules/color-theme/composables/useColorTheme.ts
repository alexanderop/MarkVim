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

// Default color theme - matches tokens.css exactly for SSR compatibility
export const DEFAULT_COLOR_THEME: ColorTheme = {
  background: { l: 0.3359, c: 0.0175, h: 280.89 }, // oklch(33.59% 1.75% 280.89°)
  foreground: { l: 0.9442, c: 0.0069, h: 247.9 }, // oklch(94.42% 0.69% 247.9°)
  accent: { l: 0.754, c: 0.2432, h: 345.89 }, // oklch(75.4% 24.32% 345.89°)
  muted: { l: 0.4843, c: 0.0447, h: 341.86 }, // oklch(48.43% 4.47% 341.86°)
  border: { l: 0.48, c: 0.1046, h: 345 }, // oklch(48% 10.46% 345°)
  alertNote: { l: 0.754, c: 0.2432, h: 345.89 }, // Using accent
  alertTip: { l: 0.754, c: 0.2432, h: 140 }, // Green - Tips/Success
  alertImportant: { l: 0.754, c: 0.2432, h: 280 }, // Purple - Important
  alertWarning: { l: 0.754, c: 0.2432, h: 80 }, // Orange - Warning
  alertCaution: { l: 0.754, c: 0.2432, h: 20 }, // Red - Danger/Caution
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

  // CSS custom property references with SSR-safe initial values
  const backgroundVar = useCssVar('--background', undefined, { initialValue: 'oklch(33.59% 0.0175 280.89)' })
  const foregroundVar = useCssVar('--foreground', undefined, { initialValue: 'oklch(94.42% 0.0069 247.9)' })
  const accentVar = useCssVar('--accent', undefined, { initialValue: 'oklch(75.4% 0.2432 345.89)' })
  const mutedVar = useCssVar('--muted', undefined, { initialValue: 'oklch(48.43% 0.0447 341.86)' })
  const borderVar = useCssVar('--border', undefined, { initialValue: 'oklch(48% 0.1046 345)' })
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
