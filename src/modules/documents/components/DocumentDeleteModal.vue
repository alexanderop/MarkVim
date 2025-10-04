<script setup lang="ts">
import { UButton } from '#components'
import BaseModal from '~/shared/components/BaseModal.vue'

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
  <BaseModal
    :open="open"
    title="Delete Document"
    max-width="md"
    data-testid="delete-confirm-modal"
    @update:open="(newOpen) => open = newOpen"
    @close="$emit('close')"
  >
    <div class="py-4">
      <p class="text-text-primary text-sm leading-relaxed">
        Are you sure you want to delete <span class="font-semibold text-text-bright">"{{ documentTitle }}"</span>?
      </p>
      <p class="text-text-secondary text-sm mt-2">
        This action cannot be undone.
      </p>
    </div>

    <div class="flex gap-3 items-center justify-end pt-4 border-t border-border">
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
  </BaseModal>
</template>
