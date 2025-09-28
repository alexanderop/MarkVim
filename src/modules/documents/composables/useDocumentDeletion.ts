import { ref } from 'vue'
import { emitAppEvent } from '@/shared/utils/eventBus'
import { useDocumentsStore } from '../store'

export function useDocumentDeletion() {
  const { getDocumentTitle } = useDocumentsStore()

  const deleteModalOpen = ref(false)
  const documentToDelete = ref<{ id: string, title: string } | null>(null)

  const handleDeleteDocument = (documentId: string, documentContent: string) => {
    const title = getDocumentTitle(documentContent)
    documentToDelete.value = { id: documentId, title }
    deleteModalOpen.value = true
  }

  const confirmDeleteDocument = () => {
    if (documentToDelete.value) {
      emitAppEvent('document:delete-confirmed', { documentId: documentToDelete.value.id })
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
