<script setup lang="ts">
interface Props {
  open: boolean
  documentTitle: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <BaseModal
    :open="open"
    title="Delete Document"
    max-width="md"
    data-testid="delete-confirm-modal"
    @update:open="$emit('update:open', $event)"
    @close="$emit('close')"
  >
    <div class="py-4">
      <p class="text-gray-200 text-sm leading-relaxed">
        Are you sure you want to delete <span class="font-semibold text-white">"{{ documentTitle }}"</span>?
      </p>
      <p class="text-gray-400 text-sm mt-2">
        This action cannot be undone.
      </p>
    </div>

    <div class="flex gap-3 items-center justify-end pt-4 border-t border-gray-700">
      <BaseButton
        variant="default"
        icon="lucide:x"
        data-testid="delete-cancel-btn"
        @click="$emit('cancel')"
      >
        Cancel
      </BaseButton>
      <BaseButton
        variant="destructive"
        icon="lucide:trash-2"
        data-testid="delete-confirm-btn"
        @click="$emit('confirm')"
      >
        Delete
      </BaseButton>
    </div>
  </BaseModal>
</template>
