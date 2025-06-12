<script setup lang="ts">
import type { Document } from '~/modules/documents/composables/useDocuments'

interface Props {
  open: boolean
  document: Document | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  generateShareLink,
  getShareStats,
  shareError,
  clipboardSupported,
} = useDocumentShare()

const shareLink = ref<string>('')
const copySuccess = ref(false)
const showAdvanced = ref(false)

const shareStats = computed(() => {
  if (!props.document)
    return null
  return getShareStats(props.document)
})

const documentTitle = computed(() => {
  if (!props.document)
    return 'Untitled'
  const firstLine = props.document.content.split('\n')[0].trim()
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '') || 'Untitled'
  }
  return firstLine || 'Untitled'
})

function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

function formatPercentage(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

// Generate share link when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.document) {
      copySuccess.value = false
      const link = generateShareLink(props.document)
      shareLink.value = link || ''
    }
    else {
      shareLink.value = ''
      showAdvanced.value = false
    }
  },
)

async function copyToClipboard() {
  if (!shareLink.value || !clipboardSupported.value)
    return

  try {
    await navigator.clipboard.writeText(shareLink.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
  catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="handleClose">
    <DialogPortal>
      <DialogOverlay class="bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
      <DialogContent data-testid="share-dialog" class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700 bg-gray-800 p-6 shadow-xl duration-200 rounded-lg">
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle class="text-lg font-semibold text-gray-100">
            Share Document
          </DialogTitle>
          <DialogDescription class="text-sm text-gray-400">
            Share "{{ documentTitle }}" with anyone via a link. The document data is compressed and embedded in the URL.
          </DialogDescription>
        </div>

        <div class="space-y-4">
          <!-- Error State -->
          <div
            v-if="shareError"
            class="p-3 bg-red-500/10 border border-red-500/20 rounded-md"
          >
            <div class="flex items-start gap-2">
              <Icon name="lucide:alert-circle" class="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
              <div class="text-sm text-error">
                {{ shareError }}
              </div>
            </div>
          </div>

          <!-- Share Link -->
          <div v-else-if="shareLink" class="space-y-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-200">
                Share Link
              </label>
              <div class="flex gap-2">
                <input
                  v-model="shareLink"
                  readonly
                  class="flex-1 px-3 py-2 text-sm bg-gray-900/50 border border-gray-600 rounded-md text-gray-200 font-mono text-xs"
                  data-testid="share-link-input"
                >
                <button
                  class="px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
                  :class="[
                    copySuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white',
                  ]"
                  :disabled="!clipboardSupported"
                  data-testid="copy-share-link-btn"
                  @click="copyToClipboard"
                >
                  <Icon
                    :name="copySuccess ? 'lucide:check' : 'lucide:copy'"
                    class="h-3.5 w-3.5"
                  />
                  {{ copySuccess ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <p class="text-xs text-gray-500">
                Anyone with this link can import this document into their MarkVim.
              </p>
            </div>

            <!-- Advanced Stats Toggle -->
            <button
              data-testid="share-advanced-toggle"
              class="text-xs text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1"
              @click="showAdvanced = !showAdvanced"
            >
              <Icon
                name="lucide:chevron-right"
                class="h-3 w-3 transition-transform"
                :class="{ 'rotate-90': showAdvanced }"
              />
              {{ showAdvanced ? 'Hide' : 'Show' }} technical details
            </button>

            <!-- Advanced Stats -->
            <div v-if="showAdvanced && shareStats" data-testid="share-advanced-stats" class="p-3 bg-gray-900/30 rounded-md space-y-2">
              <div class="text-xs text-gray-400 space-y-1">
                <div class="flex justify-between">
                  <span>Original size:</span>
                  <span class="font-mono">{{ formatBytes(shareStats.originalSize) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Compressed size:</span>
                  <span class="font-mono">{{ formatBytes(shareStats.compressedSize) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Compression ratio:</span>
                  <span class="font-mono">{{ formatPercentage(shareStats.compressionRatio) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>URL length:</span>
                  <span class="font-mono">{{ shareLink.length.toLocaleString() }} chars</span>
                </div>
              </div>
              <div class="pt-2 border-t border-gray-700">
                <p class="text-xs text-gray-500">
                  The document is compressed using LZ-string and embedded in the URL fragment for privacy.
                  No server storage is used.
                </p>
              </div>
            </div>
          </div>

          <!-- No Document State -->
          <div v-else class="text-center py-4">
            <Icon name="lucide:file-x" class="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p class="text-sm text-gray-400">
              No document to share
            </p>
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <DialogClose as-child>
            <button
              class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              data-testid="share-dialog-close-btn"
            >
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
