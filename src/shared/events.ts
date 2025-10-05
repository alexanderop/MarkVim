/**
 * Shared Application Events
 *
 * Cross-cutting events that don't belong to a specific module.
 * These are typically global application concerns.
 */

export interface SharedEvents {
  // ========================================
  // Data Events
  // ========================================
  /** Data reset requested - clear all local storage */
  'data:reset': undefined
}
