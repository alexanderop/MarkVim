<script setup lang="ts">
import { ref } from 'vue'
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'
import DocumentsDocumentDeleteModal from './DocumentDeleteModal.vue'

const deleteModalOpen = ref(false)
const documentToDelete = ref<{ id: string, title: string } | null>(null)

function handleDeleteDocument(payload: { documentId: string, documentTitle: string }) {
  documentToDelete.value = { id: payload.documentId, title: payload.documentTitle }
  deleteModalOpen.value = true
}

function confirmDeleteDocument() {
  if (documentToDelete.value) {
    // Emit event to actually delete the document
    emitAppEvent('document:delete-confirmed', { documentId: documentToDelete.value.id })
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
