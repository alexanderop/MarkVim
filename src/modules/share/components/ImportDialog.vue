<script setup lang="ts">
import type { Document } from '~/modules/domain/api'
import { Icon, UButton } from '#components'
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { computed, ref, watch } from 'vue'
import { useDocumentShare } from '~/modules/share/api'
import { tryCatchAsync } from '~/shared/utils/result'

interface Emits {
  (e: 'import', document: Document): void
  (e: 'cancel'): void
}

const { autoImportDocument } = defineProps<{
  autoImportDocument?: Document | null
}>()
const emit = defineEmits<Emits>()
const open = defineModel<boolean>('open', { required: true })
const {
  importFromUrl,
  importError,
  isImporting,
  clearShareFromUrl,
} = useDocumentShare()

const importUrl = ref('')
const previewDocument = ref<Document | null>(null)

const PREVIEW_MAX_LENGTH = 100

const isAutoImport = computed(() => !!autoImportDocument)

const documentTitle = computed(() => {
  const doc = autoImportDocument || previewDocument.value
  if (!doc)
    return 'Untitled'

  const firstLine = doc.content.split('\n')[0]?.trim() ?? ''
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '') || 'Untitled'
  }
  return firstLine || 'Untitled'
})

const documentPreview = computed(() => {
  const doc = autoImportDocument || previewDocument.value
  if (!doc)
    return ''

  const lines = doc.content.split('\n')
  const firstNonHeaderLine = lines.find(line =>
    line.trim() && !line.trim().startsWith('#'),
  )
  return firstNonHeaderLine?.trim().slice(0, PREVIEW_MAX_LENGTH) || 'No content preview available'
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
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="(newOpen) => newOpen ? open = true : handleClose()"
  >
    <DialogPortal>
      <DialogOverlay class="bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
      <DialogContent
        data-testid="import-dialog"
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700 bg-gray-800 p-6 shadow-xl duration-200 rounded-lg"
      >
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle class="text-lg font-semibold text-gray-100">
            {{ isAutoImport ? 'Import Shared Document' : 'Import Document' }}
          </DialogTitle>
          <DialogDescription class="text-sm text-gray-400">
            {{
              isAutoImport
                ? 'A shared document was detected. Do you want to import it into your notes?'
                : 'Paste a MarkVim share link to import a document into your notes.'
            }}
          </DialogDescription>
        </div>

        <div class="space-y-4">
          <!-- Auto Import Preview -->
          <div
            v-if="isAutoImport && autoImportDocument"
            class="space-y-3"
          >
            <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
              <div class="flex items-start gap-2">
                <Icon
                  name="lucide:file-text"
                  class="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0"
                />
                <div class="space-y-1">
                  <h4 class="text-sm font-medium text-blue-100">
                    {{ documentTitle }}
                  </h4>
                  <p class="text-xs text-blue-200/80">
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
                class="text-sm font-medium text-gray-200"
              >
                Share Link
              </label>
              <textarea
                id="import-url"
                v-model="importUrl"
                placeholder="Paste MarkVim share link here..."
                aria-label="MarkVim share link"
                class="w-full px-3 py-2 text-sm bg-gray-900/50 border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 resize-none"
                rows="3"
                data-testid="import-url-input"
              />
              <p class="text-xs text-gray-500">
                The link should start with your MarkVim URL and contain #share= in it.
              </p>
            </div>

            <!-- Manual Import Preview -->
            <div
              v-if="previewDocument"
              class="p-3 bg-green-500/10 border border-green-500/20 rounded-md"
            >
              <div class="flex items-start gap-2">
                <Icon
                  name="lucide:check-circle"
                  class="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0"
                />
                <div class="space-y-1">
                  <h4 class="text-sm font-medium text-green-100">
                    Ready to import: {{ documentTitle }}
                  </h4>
                  <p class="text-xs text-green-200/80">
                    {{ documentPreview }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div
            v-if="importError"
            class="p-3 bg-red-500/10 border border-red-500/20 rounded-md"
          >
            <div class="flex items-start gap-2">
              <Icon
                name="lucide:alert-circle"
                class="h-4 w-4 text-error mt-0.5 flex-shrink-0"
              />
              <div class="text-sm text-error">
                {{ importError }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end">
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
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
