import type { Document } from '~/modules/domain/api'
import { computed } from 'vue'
import { useDocumentsStore, useDocumentsStorePrivate } from '../store'

/**
 * Public API composable for documents store that maintains module boundaries.
 * Store provides read-only state, proxy provides direct access to private store actions.
 */
export function useDocumentsProxy() {
  const store = useDocumentsStore()

  // Get direct access to private store for mutations
  const privateStore = useDocumentsStorePrivate()

  return {
    // Read-only reactive state from public store
    documents: computed(() => store.documents),
    activeDocumentId: computed(() => store.activeDocumentId),
    activeDocument: computed(() => store.activeDocument),

    // Direct calls to private store for mutations
    createDocument: privateStore.createDocument,
    updateDocument: (id: string, updates: Partial<Document>) => {
      if (updates.content !== undefined) {
        return privateStore.updateDocument(id, updates.content)
      }
    },
    deleteDocument: privateStore.deleteDocument,
    selectDocument: privateStore.setActiveDocument,
    importDocument: privateStore.importDocument,

    // Utility functions (read-only)
    getDocumentTitle: store.getDocumentTitle,
    getDocumentById: store.getDocumentById,
  }
}
