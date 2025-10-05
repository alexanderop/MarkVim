/**
 * Color Theme Module API
 *
 * This file defines the public interface for the color theme module.
 * Other modules should import from this API file, not directly from internal files.
 */

import type { Ref } from 'vue'
import type { Result } from '~/shared/utils/result'
import { storeToRefs } from 'pinia'
import { type ColorTheme, type OklchColor, useColorThemeStore } from './store'

// Export components that are used externally
export { default as ColorThemeModal } from './components/ColorThemeModal.vue'

// Export events
export type { ColorThemeEvents } from './events'

// Export types
export type { ColorTheme, ColorThemeMessage, OklchColor } from './store'

/**
 * Public facade for color theme module.
 * Provides read-only state access and action methods for mutations.
 * Use this composable from any module (same or cross-module).
 */
export function useColorTheme(): {
  // Readonly state
  theme: Ref<ColorTheme>
  // Helper methods
  exportTheme: () => string
  importTheme: (themeJson: string) => Result<void, Error>
  oklchToString: (color: OklchColor) => string
  // Actions
  updateColor: (colorKey: keyof ColorTheme, color: OklchColor) => void
  resetTheme: () => void
} {
  const store = useColorThemeStore()
  const { theme } = storeToRefs(store)

  return {
    // Readonly state
    theme,
    // Helper methods
    exportTheme: store.exportTheme,
    importTheme: store.validateAndImportTheme,
    oklchToString: store.oklchToString,
    // Actions
    updateColor: (colorKey: keyof ColorTheme, color: OklchColor) => store.dispatch({ type: 'UPDATE_COLOR', payload: { colorKey, color } }),
    resetTheme: () => store.dispatch({ type: 'RESET_TO_DEFAULTS' }),
  }
}

/**
 * @deprecated Use useColorTheme() instead
 */
export function useColorThemeState(): ReturnType<typeof useColorTheme> {
  return useColorTheme()
}
