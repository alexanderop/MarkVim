<script setup lang="ts">
import type { Document } from '~/shared/types/Document'
import { UButton } from '#components'
import { useDocumentShare } from '@modules/share'
import { computed, ref } from 'vue'
import ShareDialog from './ShareDialog.vue'

const { document, disabled } = defineProps<{
  document: Document | null
  disabled?: boolean
}>()

const { isSharing, getShareStats } = useDocumentShare()
const showShareDialog = ref(false)

function handleShareClick(): void {
  showShareDialog.value = true
}

const shareStats = computed(() => {
  if (!document)
    return null
  return getShareStats(document)
})

const canShare = computed(() => {
  return shareStats.value?.canShare ?? false
})
</script>

<template>
  <div>
    <UButton
      color="neutral"
      variant="ghost"
      size="md"
      :icon="isSharing ? 'lucide:loader-2' : 'lucide:share'"
      :title="canShare ? 'Share document' : 'Document too large to share'"
      :aria-label="canShare ? 'Share document' : 'Document too large to share'"
      :disabled="disabled || !document || isSharing || !canShare"
      data-testid="share-button"
      square
      :class="{ 'animate-spin': isSharing }"
      @click="handleShareClick"
    />

    <ShareDialog
      v-model:open="showShareDialog"
      :document="document"
    />
  </div>
</template>
