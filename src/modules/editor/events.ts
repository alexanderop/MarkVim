/**
 * Editor Module Events
 *
 * Events that the editor module publishes and responds to.
 */

export interface EditorEvents {
  /** Vim mode changed in the editor. */
  'vim-mode:change': {
    mode: string
    subMode?: string
  }

  /** Programmatically insert text at cursor. */
  'editor:insert-text': {
    text: string
  }

  /** Editor content changed for a specific document. */
  'editor:content-update': {
    documentId: string
    content: string
  }
}
