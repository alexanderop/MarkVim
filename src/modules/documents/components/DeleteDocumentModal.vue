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
      <button
        data-testid="delete-cancel-btn"
        class="text-sm font-medium px-4 py-2 rounded-md transition-colors text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        data-testid="delete-confirm-btn"
        class="text-sm font-medium px-4 py-2 rounded-md transition-colors bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        @click="$emit('confirm')"
      >
        Delete
      </button>
    </div>
  </BaseModal>
</template>
