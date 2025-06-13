export function useDocumentDeletion() {
  const { deleteDocument, getDocumentTitle } = useDocuments()

  const deleteModalOpen = ref(false)
  const documentToDelete = ref<{ id: string, title: string } | null>(null)

  const handleDeleteDocument = (documentId: string, documentContent: string) => {
    const title = getDocumentTitle(documentContent)
    documentToDelete.value = { id: documentId, title }
    deleteModalOpen.value = true
  }

  const confirmDeleteDocument = () => {
    if (documentToDelete.value) {
      deleteDocument(documentToDelete.value.id)
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
