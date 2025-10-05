/**
 * Documents Module API
 *
 * This file defines the public interface for the documents module.
 * Other modules should import from this API file, not directly from internal files.
 */

import type { Ref } from 'vue'
import type { Document } from '~/shared/types/Document'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useDocumentsStore } from './store'

export { default as DocumentList } from './components/DocumentList.vue'

// Export components that are used externally
export { default as DocumentManagerAction } from './components/DocumentManagerAction.vue'
// Export events
export type { DocumentsEvents } from './events'
// Export types
export type { DocumentMessage, DocumentsState } from './types'
export { getDocumentTitle } from './utils/document-title'
export type { Document } from '~/shared/types/Document'

/**
 * Public facade for documents module.
 * Provides read-only state access and action methods for mutations.
 * Use this composable from any module (same or cross-module).
 */
export function useDocuments(): {
  // Readonly state
  documents: Ref<Document[]>
  activeDocument: Ref<Document | null>
  activeDocumentTitle: Ref<string>
  activeDocumentId: Ref<string>
  // Helper methods
  getDocumentTitle: (content: string) => string
  getDocumentById: (id: string) => Document | undefined
  // Actions
  createDocument: (content?: string) => string | void
  selectDocument: (documentId: string) => void
  updateDocument: (documentId: string, content: string) => void
  deleteDocument: (documentId: string) => void
  importDocument: (content: string) => string | void
  resetDocuments: () => void
} {
  const store = useDocumentsStore()
  const { documents, activeDocument, activeDocumentTitle, state } = storeToRefs(store)
  const activeDocumentId = computed(() => state.value.activeDocumentId)

  return {
    // Readonly state
    documents,
    activeDocument,
    activeDocumentTitle,
    activeDocumentId,
    // Helper methods
    getDocumentTitle: store.getDocumentTitle,
    getDocumentById: store.getDocumentById,
    // Actions
    createDocument: (content?: string) => store.dispatch({ type: 'CREATE_DOCUMENT', payload: content ? { content } : undefined }),
    selectDocument: (documentId: string) => store.dispatch({ type: 'SELECT_DOCUMENT', payload: { documentId } }),
    updateDocument: (documentId: string, content: string) => store.dispatch({ type: 'UPDATE_DOCUMENT', payload: { documentId, content } }),
    deleteDocument: (documentId: string) => store.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId } }),
    importDocument: (content: string) => store.dispatch({ type: 'ADD_DOCUMENT', payload: { content } }),
    resetDocuments: () => store.dispatch({ type: 'RESET_DOCUMENTS' }),
  }
}

/**
 * @deprecated Use useDocuments() instead
 */
export function useDocumentsState(): ReturnType<typeof useDocuments> {
  return useDocuments()
}
