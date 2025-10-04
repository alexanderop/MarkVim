<script setup lang="ts">
import { ref } from 'vue'
import { onAppEvent } from '@/shared/utils/eventBus'
import { useDocumentsStore } from '~/modules/documents/api'
import DocumentModalDelete from './DocumentModalDelete.vue'

const deleteModalOpen = ref(false)
const documentToDelete = ref<{ id: string, title: string } | null>(null)
const documentsStore = useDocumentsStore()

function handleDeleteDocument(payload: { documentId: string, documentTitle: string }): void {
  documentToDelete.value = { id: payload.documentId, title: payload.documentTitle }
  deleteModalOpen.value = true
}

function handleSelectDocument(payload: { documentId: string }): void {
  // Dispatch SELECT_DOCUMENT message (TEA pattern)
  documentsStore.dispatch({ type: 'SELECT_DOCUMENT', payload: { documentId: payload.documentId } })
}

function confirmDeleteDocument(): void {
  if (documentToDelete.value) {
    // Dispatch DELETE_DOCUMENT message (TEA pattern)
    documentsStore.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId: documentToDelete.value.id } })
    deleteModalOpen.value = false
    documentToDelete.value = null
  }
}

function cancelDeleteDocument(): void {
  deleteModalOpen.value = false
  documentToDelete.value = null
}

// Listen for events from the typed event bus
onAppEvent('document:delete', handleDeleteDocument)
onAppEvent('document:select', handleSelectDocument)
</script>

<template>
  <DocumentModalDelete
    v-model:open="deleteModalOpen"
    :document-title="documentToDelete?.title || ''"
    @confirm="confirmDeleteDocument"
    @cancel="cancelDeleteDocument"
    @close="cancelDeleteDocument"
  />
</template>
