/**
 * Documents Module Events
 *
 * Events that the documents module publishes and responds to.
 * Other modules can emit these events to interact with the documents module.
 */

export interface DocumentsEvents {
  /** Fired when user requests document deletion (shows modal). */
  'document:delete': {
    documentId: string
    documentTitle: string
  }
  /** Fired when user confirms document deletion (actually deletes). */
  'document:delete-confirmed': {
    documentId: string
  }
  /** Fired when a document becomes the active selection. */
  'document:select': {
    documentId: string
  }
  /** Fired after a new document is created. */
  'document:create': undefined
  /** Update document content */
  'document:update': {
    documentId: string
    content: string
  }

  /** Add new document with content (store generates ID) */
  'documents:add': {
    content: string
  }
  /** Import document with content */
  'documents:import': {
    content: string
  }
}
