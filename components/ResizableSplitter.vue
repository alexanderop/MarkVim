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
    class="w-1 bg-[#1d1f23] hover:bg-[#2a2d3a] cursor-col-resize flex-shrink-0 relative group transition-colors duration-200"
    :class="{ 'bg-[#5e6ad2]': isDragging }"
    @mousedown="$emit('startDrag', $event)"
  >
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="w-0.5 h-8 bg-[#6c7383] group-hover:bg-[#9ca3af] transition-colors duration-200 opacity-60"/>
    </div>
  </div>
</template> 