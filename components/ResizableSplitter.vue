<script setup lang="ts">
interface Props {
  isDragging?: boolean
}

interface Emits {
  (e: 'startDrag', event: MouseEvent): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div
    class="group bg-editor-border flex-shrink-0 w-1 cursor-col-resize transition-colors duration-200 relative hover:bg-editor-hover"
    :class="{ 'bg-editor-active': isDragging }"
    @mousedown="$emit('startDrag', $event)"
  >
    <div class="flex items-center inset-0 justify-center absolute">
      <div class="bg-text-secondary opacity-60 h-8 w-0.5 transition-colors duration-200 group-hover:bg-text-primary" />
    </div>
  </div>
</template>
