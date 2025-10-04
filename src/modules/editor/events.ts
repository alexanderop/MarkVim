/**
 * Editor Module Events
 *
 * Events that the editor module publishes and responds to.
 */

export interface EditorEvents {
  // ========================================
  // Content Change Events
  // ========================================
  /** Emitted when editor content changes. */
  'editor:content:update': {
    documentId: string
    content: string
  }

  // ========================================
  // Text Insertion Events
  // ========================================
  /** Request to insert text at cursor position. */
  'editor:text:insert': {
    text: string
  }

  // ========================================
  // Vim Mode Events
  // ========================================
  /** Emitted when vim mode changes. */
  'editor:vim:mode:change': {
    mode: string
    subMode?: string
  }
}
