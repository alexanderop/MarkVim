<script setup lang="ts">
import { ref } from 'vue'
import { onAppEvent } from '@/shared/utils/eventBus'
import DocumentsDocumentDeleteModal from './DocumentDeleteModal.vue'

const deleteModalOpen = ref(false)
const documentToDelete = ref<{ id: string, title: string } | null>(null)

function handleDeleteDocument(payload: { documentId: string, documentTitle: string }) {
  documentToDelete.value = { id: payload.documentId, title: payload.documentTitle }
  deleteModalOpen.value = true
}

async function confirmDeleteDocument() {
  if (documentToDelete.value) {
    // Use the store's internal deleteDocument via its event listener
    const { useDocumentsStore } = await import('../store')
    const store = useDocumentsStore()
    store.deleteDocument(documentToDelete.value.id)
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
  <DocumentsDocumentDeleteModal
    v-model:open="deleteModalOpen"
    :document-title="documentToDelete?.title || ''"
    @confirm="confirmDeleteDocument"
    @cancel="cancelDeleteDocument"
    @close="cancelDeleteDocument"
  />
</template>
