<script setup lang="ts">
import type { Ref } from 'vue'
import type { Document } from '~/shared/types/Document'
import { Icon, UButton, UModal } from '#components'
import { computed, ref, watch } from 'vue'
import { tryCatchAsync } from '~/shared/utils/result'
import { useDocumentShare } from '../composables/useDocumentShare'

interface Emits {
  (e: 'import', document: Document): void
  (e: 'cancel'): void
}

const { autoImportDocument } = defineProps<{
  autoImportDocument?: Document | null
}>()
const emit = defineEmits<Emits>()
const open = defineModel<boolean>('open', { required: true })

// External composables
const {
  importFromUrl,
  importError,
  isImporting,
  clearShareFromUrl,
} = useDocumentShare()

// Component logic
const importUrl = ref('')
const { previewDocument, isAutoImport, documentTitle, documentPreview } = useDocumentPreview(
  autoImportDocument,
  importUrl,
  importFromUrl,
)
const { handleImport, handleClose, handleCancel } = useImportHandlers(
  isAutoImport,
  autoImportDocument,
  importUrl,
  previewDocument,
  importFromUrl,
  clearShareFromUrl,
  emit,
  open,
)

// Inline composables
function useDocumentPreview(
  autoImportDocument: Document | null | undefined,
  importUrl: Ref<string>,
  importFromUrl: (url?: string) => Promise<Document | null>,
): {
    previewDocument: Ref<Document | null>
    isAutoImport: Ref<boolean>
    documentTitle: Ref<string>
    documentPreview: Ref<string>
  } {
  const PREVIEW_MAX_LENGTH = 100
  const previewDocument = ref<Document | null>(null)

  const isAutoImport = computed(() => !!autoImportDocument)

  const documentTitle = computed(() => {
    const doc = autoImportDocument ?? previewDocument.value
    if (!doc)
      return 'Untitled'

    const firstLine = doc.content.split('\n')[0]?.trim() ?? ''
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '') || 'Untitled'
    }
    return firstLine || 'Untitled'
  })

  const documentPreview = computed(() => {
    const doc = autoImportDocument ?? previewDocument.value
    if (!doc)
      return ''

    const lines = doc.content.split('\n')
    const firstNonHeaderLine = lines.find(line =>
      line.trim() && !line.trim().startsWith('#'),
    )
    return firstNonHeaderLine?.trim().slice(0, PREVIEW_MAX_LENGTH) ?? 'No content preview available'
  })

  watch(
    () => importUrl.value,
    async (url) => {
      if (!url.trim()) {
        previewDocument.value = null
        return
      }

      const result = await tryCatchAsync(
        () => importFromUrl(url),
        () => new Error('Failed to import from URL'),
      )

      previewDocument.value = result.ok ? result.value : null
    },
  )

  return { previewDocument, isAutoImport, documentTitle, documentPreview }
}

function useImportHandlers(
  isAutoImport: Ref<boolean>,
  autoImportDocument: Document | null | undefined,
  importUrl: Ref<string>,
  previewDocument: Ref<Document | null>,
  importFromUrl: (url?: string) => Promise<Document | null>,
  clearShareFromUrl: () => void,
  emit: any,
  open: Ref<boolean>,
): {
    handleImport: () => Promise<void>
    handleClose: () => void
    handleCancel: () => void
  } {
  async function handleImport(): Promise<void> {
    let documentToImport: Document | null = null

    if (isAutoImport.value && autoImportDocument) {
      documentToImport = autoImportDocument
    }
    if (!documentToImport && importUrl.value.trim()) {
      documentToImport = await importFromUrl(importUrl.value)
    }

    if (documentToImport) {
      emit('import', documentToImport)
      if (isAutoImport.value) {
        clearShareFromUrl()
      }
      handleClose()
    }
  }

  function handleClose(): void {
    open.value = false
    importUrl.value = ''
    previewDocument.value = null
  }

  function handleCancel(): void {
    emit('cancel')
    if (isAutoImport.value) {
      clearShareFromUrl()
    }
    handleClose()
  }

  return { handleImport, handleClose, handleCancel }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isAutoImport ? 'Import Shared Document' : 'Import Document'"
    :description="isAutoImport
      ? 'A shared document was detected. Do you want to import it into your notes?'
      : 'Paste a MarkVim share link to import a document into your notes.'"
    :ui="{ content: 'w-full max-w-lg', body: 'space-y-4', footer: 'flex gap-2 justify-end' }"
    data-testid="import-dialog"
    @update:open="(newOpen) => newOpen ? open = true : handleClose()"
  >
    <template #body>
      <!-- Auto Import Preview -->
      <div
        v-if="isAutoImport && autoImportDocument"
        class="space-y-3"
      >
        <div class="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-md">
          <div class="flex items-start gap-2">
            <Icon
              name="lucide:file-text"
              class="h-4 w-4 text-[var(--accent)] mt-0.5 flex-shrink-0"
            />
            <div class="space-y-1">
              <h4 class="text-sm font-medium text-[var(--foreground)]">
                {{ documentTitle }}
              </h4>
              <p class="text-xs text-[var(--foreground)] opacity-80">
                {{ documentPreview }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Manual Import URL Input -->
      <div
        v-else
        class="space-y-3"
      >
        <div class="space-y-2">
          <label
            for="import-url"
            class="text-sm font-medium text-[var(--foreground)]"
          >
            Share Link
          </label>
          <textarea
            id="import-url"
            v-model="importUrl"
            placeholder="Paste MarkVim share link here..."
            aria-label="MarkVim share link"
            class="w-full px-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder-[var(--foreground)]/50 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            rows="3"
            data-testid="import-url-input"
          />
          <p class="text-xs text-[var(--foreground)]/50">
            The link should start with your MarkVim URL and contain #share= in it.
          </p>
        </div>

        <!-- Manual Import Preview -->
        <div
          v-if="previewDocument"
          class="p-3 bg-[var(--alert-tip)]/10 border border-[var(--alert-tip)]/20 rounded-md"
        >
          <div class="flex items-start gap-2">
            <Icon
              name="lucide:check-circle"
              class="h-4 w-4 text-[var(--alert-tip)] mt-0.5 flex-shrink-0"
            />
            <div class="space-y-1">
              <h4 class="text-sm font-medium text-[var(--foreground)]">
                Ready to import: {{ documentTitle }}
              </h4>
              <p class="text-xs text-[var(--foreground)] opacity-80">
                {{ documentPreview }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="importError"
        class="p-3 bg-[var(--alert-caution)]/10 border border-[var(--alert-caution)]/20 rounded-md"
      >
        <div class="flex items-start gap-2">
          <Icon
            name="lucide:alert-circle"
            class="h-4 w-4 text-[var(--alert-caution)] mt-0.5 flex-shrink-0"
          />
          <div class="text-sm text-[var(--alert-caution)]">
            {{ importError }}
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        data-testid="import-cancel-btn"
        @click="handleCancel"
      >
        {{ isAutoImport ? 'Skip' : 'Cancel' }}
      </UButton>
      <UButton
        color="primary"
        variant="solid"
        size="sm"
        :icon="isImporting ? 'lucide:loader-2' : 'lucide:download'"
        :class="{ 'animate-spin': isImporting }"
        :disabled="isImporting || (!isAutoImport && !previewDocument)"
        data-testid="import-confirm-btn"
        @click="handleImport"
      >
        {{ isImporting ? 'Importing...' : 'Import' }}
      </UButton>
    </template>
  </UModal>
</template>
