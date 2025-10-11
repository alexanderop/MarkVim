import type { Ref } from 'vue'
import { ref } from 'vue'
import { useDocumentsStore } from '../store'
import { getDocumentTitle } from '../utils/document-title'

export function useDocumentDeletion(): {
  deleteModalOpen: Ref<boolean>
  documentToDelete: Ref<{ id: string, title: string } | null>
  handleDeleteDocument: (documentId: string, documentContent: string) => void
  confirmDeleteDocument: () => void
  cancelDeleteDocument: () => void
} {
  const store = useDocumentsStore()
  const deleteDocument = (id: string): void | string => store.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId: id } })

  const deleteModalOpen = ref(false)
  const documentToDelete = ref<{ id: string, title: string } | null>(null)

  const handleDeleteDocument = (documentId: string, documentContent: string): void => {
    const title = getDocumentTitle(documentContent)
    documentToDelete.value = { id: documentId, title }
    deleteModalOpen.value = true
  }

  const confirmDeleteDocument = (): void => {
    if (documentToDelete.value) {
      deleteDocument(documentToDelete.value.id)
      deleteModalOpen.value = false
      documentToDelete.value = null
    }
  }

  const cancelDeleteDocument = (): void => {
    deleteModalOpen.value = false
    documentToDelete.value = null
  }

  return {
    deleteModalOpen,
    documentToDelete,
    handleDeleteDocument,
    confirmDeleteDocument,
    cancelDeleteDocument,
  }
}
