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
    class="w-1 bg-editor-border hover:bg-editor-hover cursor-col-resize flex-shrink-0 relative group transition-colors duration-200"
    :class="{ 'bg-editor-active': isDragging }"
    @mousedown="$emit('startDrag', $event)"
  >
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="w-0.5 h-8 bg-text-secondary group-hover:bg-text-primary transition-colors duration-200 opacity-60"/>
    </div>
  </div>
</template> 