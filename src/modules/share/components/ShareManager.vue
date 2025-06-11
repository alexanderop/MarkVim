<script setup lang="ts">
import type { Document } from '~/modules/documents/composables/useDocuments'

interface Emits {
  (e: 'documentImported', document: Document): void
}

const emit = defineEmits<Emits>()

const { parseShareUrl, clearShareFromUrl } = useDocumentShare()
const { setActiveDocument } = useDocuments()

const showImportDialog = ref(false)
const autoImportDocument = ref<Document | null>(null)

function useAutoImportDetection() {
  function detectShareInUrl(): void {
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

    autoImportDocument.value = importedDoc
    showImportDialog.value = true
  }

  return {
    detectShareInUrl,
  }
}

const { detectShareInUrl } = useAutoImportDetection()

async function handleImportConfirm(document: Document) {
  const documentStorage = useLocalStorage<Document[]>('markvim-documents', [])

  // Add the document to storage
  documentStorage.value.unshift(document)

  // Use nextTick to ensure the reactive update happens before setting active
  await nextTick()
  setActiveDocument(document.id)

  emit('documentImported', document)

  clearShareFromUrl()
  showImportDialog.value = false
  autoImportDocument.value = null
}

function handleImportCancel() {
  clearShareFromUrl()
  showImportDialog.value = false
  autoImportDocument.value = null
}

onMounted(() => {
  detectShareInUrl()
})

function openManualImport() {
  autoImportDocument.value = null
  showImportDialog.value = true
}

defineExpose({
  openManualImport,
})
</script>

<template>
  <ImportDialog
    v-model:open="showImportDialog"
    :auto-import-document="autoImportDocument"
    @import="handleImportConfirm"
    @cancel="handleImportCancel"
  />
</template>
