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
  /** Fired when a document becomes the active selection. */
  'document:select': {
    documentId: string
  }
}
