<script setup lang="ts">
import type { Document } from '~/modules/domain/api'
import { onMounted, ref } from 'vue'
import { useDocumentsStore } from '~/modules/documents/api'
import { useViewMode } from '~/modules/layout/api'
import { useDocumentShare } from '~/modules/share/api'
import ShareImportDialog from './ImportDialog.vue'

interface Emits {
  (e: 'documentImported', document: Document): void
}

const emit = defineEmits<Emits>()

const documentsStore = useDocumentsStore()
const { parseShareUrl, clearShareFromUrl } = useDocumentShare()
const { setViewMode } = useViewMode()

const showImportDialog = ref(false)
const autoImportDocument = ref<Document | null>(null)

function useAutoImportDetection(): { detectShareInUrl: () => Promise<void> } {
  async function detectShareInUrl(): Promise<void> {
    if (!window.location.hash.startsWith('#share=')) {
      return
    }

    const shareableDoc = parseShareUrl()
    if (!shareableDoc) {
      clearShareFromUrl()
      return
    }

    const importedDoc: Document = {
      id: crypto.randomUUID(),
      content: shareableDoc.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Auto-import without dialog
    await handleAutoImport(importedDoc)
  }

  return {
    detectShareInUrl,
  }
}

const { detectShareInUrl } = useAutoImportDetection()

function handleAutoImport(document: Document): void {
  // Import via store dispatch
  documentsStore.dispatch({ type: 'ADD_DOCUMENT', payload: { content: document.content } })

  // Switch to preview mode
  setViewMode('preview')

  emit('documentImported', document)

  clearShareFromUrl()
}

function handleImportConfirm(document: Document): void {
  // Import via store dispatch
  documentsStore.dispatch({ type: 'ADD_DOCUMENT', payload: { content: document.content } })

  emit('documentImported', document)

  clearShareFromUrl()
  showImportDialog.value = false
  autoImportDocument.value = null
}

function handleImportCancel(): void {
  clearShareFromUrl()
  showImportDialog.value = false
  autoImportDocument.value = null
}

onMounted(() => {
  void detectShareInUrl()
})

function openManualImport(): void {
  autoImportDocument.value = null
  showImportDialog.value = true
}

defineExpose({
  openManualImport,
})
</script>

<template>
  <ShareImportDialog
    v-model:open="showImportDialog"
    :auto-import-document="autoImportDocument"
    @import="handleImportConfirm"
    @cancel="handleImportCancel"
  />
</template>
