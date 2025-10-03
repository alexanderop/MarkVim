import { ref } from 'vue'
import { getDocumentTitle, useDocumentsStore } from '~/modules/documents/api'

export function useDocumentDeletion() {
  const deleteModalOpen = ref(false)
  const documentToDelete = ref<{ id: string, title: string } | null>(null)
  const documentsStore = useDocumentsStore()

  const handleDeleteDocument = (documentId: string, documentContent: string) => {
    const title = getDocumentTitle(documentContent)
    documentToDelete.value = { id: documentId, title }
    deleteModalOpen.value = true
  }

  const confirmDeleteDocument = () => {
    if (documentToDelete.value) {
      documentsStore.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId: documentToDelete.value.id } })
      deleteModalOpen.value = false
      documentToDelete.value = null
    }
  }

  const cancelDeleteDocument = () => {
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
