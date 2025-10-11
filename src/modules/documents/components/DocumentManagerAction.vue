<script setup lang="ts">
import { ref } from 'vue'
import { onAppEvent } from '@/shared/utils/eventBus'
import { useDocumentsStore } from '../store'
import DocumentModalDelete from './DocumentModalDelete.vue'

const store = useDocumentsStore()
const deleteDocument = (id: string): void | string => store.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId: id } })

const deleteModalOpen = ref(false)
const documentToDelete = ref<{ id: string, title: string } | null>(null)

function handleDeleteDocument(payload: { documentId: string, documentTitle: string }): void {
  documentToDelete.value = { id: payload.documentId, title: payload.documentTitle }
  deleteModalOpen.value = true
}

function confirmDeleteDocument(): void {
  if (documentToDelete.value) {
    deleteDocument(documentToDelete.value.id)
    deleteModalOpen.value = false
    documentToDelete.value = null
  }
}

function cancelDeleteDocument(): void {
  deleteModalOpen.value = false
  documentToDelete.value = null
}

// Listen for delete request events (for modal confirmation)
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
