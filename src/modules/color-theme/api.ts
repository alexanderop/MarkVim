/**
 * Color Theme Module API
 *
 * This file defines the public interface for the color theme module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export components that are used externally
export { default as ColorThemeModal } from './components/ColorThemeModal.vue'

// Export the store for theme management
export { useColorThemeStore } from './store'

// Export types
export type { ColorTheme, ColorThemeMessage, OklchColor } from './store'
