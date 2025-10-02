/**
 * Shortcuts Module Events
 *
 * Events that the shortcuts module publishes and responds to.
 */

export interface ShortcutsEvents {
  /** Open the command palette at an optional position. */
  'command-palette:open': {
    position?: { x: number, y: number }
  }

  /** Close the command palette. */
  'command-palette:close': undefined
}
