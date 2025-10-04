import type { ColorTheme, OklchColor } from './store'

/**
 * Color Theme Module Events
 *
 * Events that the color-theme module publishes and responds to.
 */

export interface ColorThemeEvents {
  // ========================================
  // Color Update Events
  // ========================================
  /** Request to update a specific color in the theme. */
  'theme:color:update': {
    colorKey: keyof ColorTheme
    color: OklchColor
  }

  /** Emitted after a color is successfully updated. */
  'theme:color:updated': {
    colorKey: keyof ColorTheme
    color: OklchColor
  }

  // ========================================
  // Theme Reset Events
  // ========================================
  /** Request to reset theme to defaults. */
  'theme:reset': undefined

  /** Emitted after theme is reset to defaults. */
  'theme:reset:complete': {
    theme: ColorTheme
  }

  // ========================================
  // Theme Import Events
  // ========================================
  /** Request to import a complete theme. */
  'theme:import': {
    theme: ColorTheme
  }

  /** Emitted after a theme is successfully imported. */
  'theme:imported': {
    theme: ColorTheme
  }
}
