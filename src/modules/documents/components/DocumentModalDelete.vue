<script setup lang="ts">
import { UButton, UModal } from '#components'

const {
  documentTitle = '',
} = defineProps<{
  documentTitle?: string
}>()

defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal
    v-model:open="open"
    title="Delete Document"
    :ui="{ content: 'max-w-md' }"
    data-testid="delete-confirm-modal"
  >
    <template #body>
      <div class="py-4">
        <p class="text-text-primary text-sm leading-relaxed">
          Are you sure you want to delete <span class="font-semibold text-text-bright">"{{ documentTitle }}"</span>?
        </p>
        <p class="text-text-secondary text-sm mt-2">
          This action cannot be undone.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3 items-center justify-end w-full">
        <UButton
          color="neutral"
          variant="outline"
          icon="lucide:x"
          data-testid="delete-cancel-btn"
          @click="$emit('cancel')"
        >
          Cancel
        </UButton>
        <UButton
          color="error"
          variant="solid"
          icon="lucide:trash-2"
          data-testid="delete-confirm-btn"
          @click="$emit('confirm')"
        >
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>
