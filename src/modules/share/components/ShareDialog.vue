<script setup lang="ts">
import type { Document } from '~/shared/types/Document'
import { Icon, UButton, UCard, UModal } from '#components'
import { computed, ref, watch } from 'vue'
import { tryCatchAsync } from '~/shared/utils/result'
import { useDocumentShare } from '../composables/useDocumentShare'

const { document } = defineProps<{
  document: Document | null
}>()
const open = defineModel<boolean>('open', { required: true })

const {
  generateShareLink,
  getShareStats,
  shareError,
  clipboardSupported,
} = useDocumentShare()

const shareLink = ref<string>('')
const copySuccess = ref(false)
const showAdvanced = ref(false)

const PERCENTAGE_FACTOR = 100
const COPY_SUCCESS_DURATION_MS = 2000

const shareStats = computed(() => {
  if (!document)
    return null
  return getShareStats(document)
})

const documentTitle = computed(() => {
  if (!document)
    return 'Untitled'
  const firstLine = document.content.split('\n')[0]?.trim() ?? ''
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '') || 'Untitled'
  }
  return firstLine || 'Untitled'
})

const modalDescription = computed(() => {
  return `Share "${documentTitle.value}" with anyone via a link. The document data is compressed and embedded in the URL.`
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
  return `${Math.round(ratio * PERCENTAGE_FACTOR)}%`
}

// Generate share link when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen && document) {
      copySuccess.value = false
      const link = generateShareLink(document)
      shareLink.value = link || ''
      return
    }
    shareLink.value = ''
    showAdvanced.value = false
  },
)

async function copyToClipboard(): Promise<void> {
  if (!shareLink.value || !clipboardSupported.value)
    return

  const result = await tryCatchAsync(
    () => navigator.clipboard.writeText(shareLink.value!),
    error => (error instanceof Error ? error : new Error(String(error))),
  )

  if (result.ok) {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, COPY_SUCCESS_DURATION_MS)
    return
  }
  console.error('Failed to copy to clipboard:', result.error)
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Share Document"
    :description="modalDescription"
    :ui="{ content: 'max-w-lg' }"
    data-testid="share-dialog"
  >
    <template #body>
      <div class="space-y-4">
        <!-- Error State -->
        <UCard
          v-if="shareError"
          variant="outline"
          :ui="{ root: 'bg-red-500/10 border-red-500/20', body: 'p-3' }"
        >
          <div class="flex items-start gap-2">
            <Icon
              name="lucide:alert-circle"
              class="h-4 w-4 text-error mt-0.5 flex-shrink-0"
            />
            <div class="text-sm text-error">
              {{ shareError }}
            </div>
          </div>
        </UCard>

        <!-- Share Link -->
        <div
          v-else-if="shareLink"
          class="space-y-3"
        >
          <div class="space-y-2">
            <label
              for="share-link"
              class="text-sm font-medium text-gray-200"
            >
              Share Link
            </label>
            <div class="flex gap-2">
              <input
                id="share-link"
                v-model="shareLink"
                readonly
                aria-label="Share link"
                class="flex-1 px-3 py-2 text-sm bg-gray-900/50 border border-gray-600 rounded-md text-gray-200 font-mono text-xs"
                data-testid="share-link-input"
              >
              <UButton
                color="primary"
                variant="solid"
                size="sm"
                :icon="copySuccess ? 'lucide:check' : 'lucide:copy'"
                :class="[
                  copySuccess
                    ? 'bg-[var(--alert-tip)] hover:bg-[var(--alert-tip)]/80 text-white'
                    : 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white',
                ]"
                :disabled="!clipboardSupported"
                data-testid="copy-share-link-btn"
                @click="copyToClipboard"
              >
                {{ copySuccess ? 'Copied!' : 'Copy' }}
              </UButton>
            </div>
            <p class="text-xs text-gray-500">
              Anyone with this link can import this document into their MarkVim.
            </p>
          </div>

          <!-- Advanced Stats Toggle -->
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="showAdvanced ? 'lucide:chevron-down' : 'lucide:chevron-right'"
            data-testid="share-advanced-toggle"
            class="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            @click="showAdvanced = !showAdvanced"
          >
            {{ showAdvanced ? 'Hide' : 'Show' }} technical details
          </UButton>

          <!-- Advanced Stats -->
          <UCard
            v-if="showAdvanced && shareStats"
            variant="subtle"
            :ui="{ root: 'bg-gray-900/30', body: 'p-3 space-y-2' }"
            data-testid="share-advanced-stats"
          >
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
                The document is compressed using GZIP compression and embedded in the URL fragment for privacy.
                No server storage is used.
              </p>
            </div>
          </UCard>
        </div>

        <!-- No Document State -->
        <div
          v-else
          class="text-center py-4"
        >
          <Icon
            name="lucide:file-x"
            class="h-8 w-8 text-gray-500 mx-auto mb-2"
          />
          <p class="text-sm text-gray-400">
            No document to share
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>
