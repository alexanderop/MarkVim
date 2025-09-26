<script setup lang="ts">
import { onAppEvent } from '@/shared/utils/eventBus'

const { deleteDocument } = useDocumentsStore()

const deleteModalOpen = ref(false)
const documentToDelete = ref<{ id: string, title: string } | null>(null)

function handleDeleteDocument(payload: { documentId: string, documentTitle: string }) {
  documentToDelete.value = { id: payload.documentId, title: payload.documentTitle }
  deleteModalOpen.value = true
}

function confirmDeleteDocument() {
  if (documentToDelete.value) {
    deleteDocument(documentToDelete.value.id)
    deleteModalOpen.value = false
    documentToDelete.value = null
  }
}

function cancelDeleteDocument() {
  deleteModalOpen.value = false
  documentToDelete.value = null
}

// Listen for delete events from the typed event bus
onAppEvent('document:delete', handleDeleteDocument)
</script>

<template>
  <DocumentDeleteModal
    v-model:open="deleteModalOpen"
    :document-title="documentToDelete?.title || ''"
    @confirm="confirmDeleteDocument"
    @cancel="cancelDeleteDocument"
    @close="cancelDeleteDocument"
  />
</template>
