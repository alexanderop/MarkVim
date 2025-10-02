/**
 * Shared Application Events
 *
 * Cross-cutting events that don't belong to a specific module.
 * These are typically global application concerns.
 */

export interface SharedEvents {
  // ========================================
  // Settings Events
  // ========================================
  /** Toggle vim mode in editor */
  'settings:toggle-vim': undefined

  /** Toggle line numbers in editor */
  'settings:toggle-line-numbers': undefined

  /** Toggle preview sync in split view */
  'settings:toggle-preview-sync': undefined

  // ========================================
  // Data Events
  // ========================================
  /** Data reset requested - clear all local storage */
  'data:reset': undefined
}
