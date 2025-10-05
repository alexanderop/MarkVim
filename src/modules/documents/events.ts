/**
 * Documents Module Events
 *
 * Events that the documents module publishes and responds to.
 * Other modules can emit these events to interact with the documents module.
 */

export interface DocumentsEvents {
  // ========================================
  // Deletion Events (Two-Phase)
  // ========================================
  /** Request document deletion (shows confirmation modal). */
  'document:delete': {
    documentId: string
    documentTitle: string
  }
}
