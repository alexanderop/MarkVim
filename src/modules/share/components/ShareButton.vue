<script setup lang="ts">
import type { Document } from '~/modules/core/api'
import { computed, ref } from 'vue'
import { useDocumentShare } from '~/modules/share/api'
import BaseButton from '~/shared/components/BaseButton.vue'
import ShareDialog from './ShareDialog.vue'

const { document, disabled } = defineProps<{
  document: Document | null
  disabled?: boolean
}>()

const { isSharing, getShareStats } = useDocumentShare()
const showShareDialog = ref(false)

function handleShareClick() {
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
    <BaseButton
      variant="icon"
      size="icon"
      :icon="isSharing ? 'lucide:loader-2' : 'lucide:share'"
      :title="canShare ? 'Share document' : 'Document too large to share'"
      :disabled="disabled || !document || isSharing || !canShare"
      data-testid="share-button"
      icon-only
      :class="{ 'animate-spin': isSharing }"
      @click="handleShareClick"
    />

    <ShareDialog
      v-model:open="showShareDialog"
      :document="document"
    />
  </div>
</template>
