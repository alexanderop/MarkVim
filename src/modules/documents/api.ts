/**
 * Documents Module API
 *
 * This file defines the public interface for the documents module.
 * Other modules should import from this API file, not directly from internal files.
 */

import { storeToRefs } from 'pinia'
import { useDocumentsStore } from './store'

export { default as DocumentList } from './components/DocumentList.vue'

// Export components that are used externally
export { default as DocumentManagerAction } from './components/DocumentManagerAction.vue'
// Export events
export type { DocumentsEvents } from './events'
export type { DocumentMessage, DocumentsState } from './store'
// Export types
export type { Document } from '~/modules/domain/api'

/**
 * Read-only access to documents state.
 * External modules can only read state, not mutate it.
 * To change documents, emit events via emitAppEvent.
 */
export function useDocumentsState(): ReturnType<typeof useDocumentsStore> {
  const store = useDocumentsStore()
  const { documents, activeDocument, activeDocumentTitle, state } = storeToRefs(store)

  return {
    documents,
    activeDocument,
    activeDocumentTitle,
    state,
    getDocumentTitle: store.getDocumentTitle,
    getDocumentById: store.getDocumentById,
  }
}

// Export utility function
const TITLE_MAX_LENGTH = 50

export function getDocumentTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  const title = firstLine.startsWith('#')
    ? firstLine.replace(/^#+\s*/, '') || 'Untitled'
    : firstLine || 'Untitled'

  if (title.length > TITLE_MAX_LENGTH) {
    return `${title.slice(0, TITLE_MAX_LENGTH)}…`
  }
  return title
}
