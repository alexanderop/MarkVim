import type { Ref } from 'vue'
import { getDocumentTitle, useDocuments } from '@modules/documents'
import { ref } from 'vue'

export function useDocumentDeletion(): {
  deleteModalOpen: Ref<boolean>
  documentToDelete: Ref<{ id: string, title: string } | null>
  handleDeleteDocument: (documentId: string, documentContent: string) => void
  confirmDeleteDocument: () => void
  cancelDeleteDocument: () => void
} {
  const { deleteDocument } = useDocuments()

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
