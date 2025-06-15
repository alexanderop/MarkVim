import { readonly, watchEffect } from 'vue'
import { useCssVar, useLocalStorage, useMounted } from '@vueuse/core'

export interface FontTheme {
  baseFontSize: number // Base editor font size in px
  uiFontSize: number   // UI elements font size in px
}

export const DEFAULT_FONT_THEME: FontTheme = {
  baseFontSize: 14,
  uiFontSize: 13,
}

export function useFontTheme() {
  const isMounted = useMounted()

  // Reactive theme stored in localStorage with VueUse
  const theme = useLocalStorage<FontTheme>('markvim-font-theme', DEFAULT_FONT_THEME, {
    mergeDefaults: true,
  })

  // CSS custom property references
  const baseFontSizeVar = useCssVar('--font-size-base')
  const uiFontSizeVar = useCssVar('--font-size-ui')

  // Update CSS custom properties when theme changes
  watchEffect(() => {
    if (isMounted.value) {
      baseFontSizeVar.value = `${theme.value.baseFontSize}px`
      uiFontSizeVar.value = `${theme.value.uiFontSize}px`
    }
  })

  // Update base font size (with constraints)
  const updateBaseFontSize = (size: number) => {
    theme.value.baseFontSize = Math.max(8, Math.min(32, size))
    // Keep UI font size proportional (slightly smaller)
    theme.value.uiFontSize = Math.max(7, Math.min(30, theme.value.baseFontSize - 1))
  }

  // Update UI font size
  const updateUIFontSize = (size: number) => {
    theme.value.uiFontSize = Math.max(7, Math.min(30, size))
  }

  // Reset theme to defaults
  const resetToDefaults = () => {
    theme.value = { ...DEFAULT_FONT_THEME }
  }

  // Export theme as JSON string
  const exportTheme = (): string => {
    return JSON.stringify(theme.value, null, 2)
  }

  // Import theme from JSON string
  const importTheme = (themeJson: string): boolean => {
    try {
      const parsedTheme = JSON.parse(themeJson) as FontTheme

      // Validate the theme structure
      const isValid = typeof parsedTheme.baseFontSize === 'number'
        && typeof parsedTheme.uiFontSize === 'number'
        && parsedTheme.baseFontSize >= 8
        && parsedTheme.baseFontSize <= 32
        && parsedTheme.uiFontSize >= 7
        && parsedTheme.uiFontSize <= 30

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
    updateBaseFontSize,
    updateUIFontSize,
    resetToDefaults,
    exportTheme,
    importTheme,
  }
}