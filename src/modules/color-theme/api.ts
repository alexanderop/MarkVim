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
 * Read-only access to color theme state.
 * External modules can only read state, not mutate it.
 * To change theme, emit events via emitAppEvent.
 */
export function useColorThemeState(): {
  theme: Ref<ColorTheme>
  exportTheme: () => string
  importTheme: (themeJson: string) => Result<void, Error>
  oklchToString: (color: OklchColor) => string
} {
  const store = useColorThemeStore()
  const { theme } = storeToRefs(store)

  return {
    theme,
    exportTheme: store.exportTheme,
    importTheme: store.importTheme,
    oklchToString: store.oklchToString,
  }
}
