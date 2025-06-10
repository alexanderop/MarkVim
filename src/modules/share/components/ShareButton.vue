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
    <button
      data-testid="share-button"
      class="group text-gray-400 rounded-lg flex h-8 w-8 transition-all duration-200 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        disabled || !canShare
          ? 'hover:text-gray-300 hover:bg-gray-800/50'
          : 'hover:text-blue-400 hover:bg-blue-500/10',
      ]"
      :title="canShare ? 'Share document' : 'Document too large to share'"
      :disabled="disabled || !document || isSharing || !canShare"
      @click="handleShareClick"
    >
      <Icon
        v-if="!isSharing"
        name="lucide:share"
        class="h-4 w-4 transition-colors duration-200"
      />
      <Icon
        v-else
        name="lucide:loader-2"
        class="h-4 w-4 transition-colors duration-200 animate-spin"
      />
    </button>

    <ShareDialog
      v-model:open="showShareDialog"
      :document="document"
    />
  </div>
</template>
