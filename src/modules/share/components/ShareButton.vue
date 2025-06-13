<script setup lang="ts">
import type { Document } from '~/modules/documents/composables/useDocuments'

interface Props {
  document: Document | null
  disabled?: boolean
}

const props = defineProps<Props>()

const { isSharing, getShareStats } = useDocumentShare()
const showShareDialog = ref(false)

function handleShareClick() {
  showShareDialog.value = true
}

const shareStats = computed(() => {
  if (!props.document)
    return null
  return getShareStats(props.document)
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
      class="text-accent hover:text-accent/80"
      :class="{ 'animate-spin': isSharing }"
      @click="handleShareClick"
    />

    <ShareDialog
      v-model:open="showShareDialog"
      :document="document"
    />
  </div>
</template>
