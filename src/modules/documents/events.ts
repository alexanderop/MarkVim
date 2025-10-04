/**
 * Documents Module Events
 *
 * Events that the documents module publishes and responds to.
 * Other modules can emit these events to interact with the documents module.
 */

export interface DocumentsEvents {
  // ========================================
  // Selection Events
  // ========================================
  /** Fired when a document becomes the active selection. */
  'document:select': {
    documentId: string
  }

  // ========================================
  // Creation Events
  // ========================================
  /** Request to create a new document. */
  'document:create': undefined

  /** Emitted after a document is successfully created. */
  'document:created': {
    documentId: string
  }

  // ========================================
  // Update Events
  // ========================================
  /** Request to update a document's content. */
  'document:update': {
    documentId: string
    content: string
  }

  /** Emitted after a document is successfully updated. */
  'document:updated': {
    documentId: string
  }

  // ========================================
  // Deletion Events (Two-Phase)
  // ========================================
  /** Request document deletion (shows confirmation modal). */
  'document:delete': {
    documentId: string
    documentTitle: string
  }

  /** Confirmed deletion - actually delete the document. */
  'document:delete:confirmed': {
    documentId: string
  }

  /** Emitted after a document is successfully deleted. */
  'document:deleted': {
    documentId: string
  }

  // ========================================
  // Import/Add Events
  // ========================================
  /** Request to import a document from external source. */
  'document:import': {
    content: string
  }

  /** Request to add a new document with specific content. */
  'document:add': {
    content: string
  }
}
