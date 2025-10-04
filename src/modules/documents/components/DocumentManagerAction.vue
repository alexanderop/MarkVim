<script setup lang="ts">
import { ref } from 'vue'
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'
import DocumentModalDelete from './DocumentModalDelete.vue'

const deleteModalOpen = ref(false)
const documentToDelete = ref<{ id: string, title: string } | null>(null)

function handleDeleteDocument(payload: { documentId: string, documentTitle: string }): void {
  documentToDelete.value = { id: payload.documentId, title: payload.documentTitle }
  deleteModalOpen.value = true
}

function confirmDeleteDocument(): void {
  if (documentToDelete.value) {
    emitAppEvent('document:delete:confirmed', { documentId: documentToDelete.value.id })
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
