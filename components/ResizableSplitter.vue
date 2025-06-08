<script setup lang="ts">
interface Props {
  isDragging?: boolean
}

interface Emits {
  (e: 'startDrag', event: PointerEvent): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div
    class="group bg-editor-border flex-shrink-0 w-1 cursor-col-resize transition-all duration-150 relative hover:bg-editor-hover"
    :class="{
      'bg-editor-active w-2 shadow-lg z-20': isDragging,
      'hover:bg-editor-hover': !isDragging,
    }"
    :style="isDragging ? 'box-shadow: 0 0 12px rgba(94, 106, 210, 0.4), 0 0 4px rgba(94, 106, 210, 0.6)' : ''"
    @pointerdown="$emit('startDrag', $event)"
    @touchstart.prevent
  >
    <div class="flex items-center inset-0 justify-center absolute">
      <div
        class="bg-text-secondary opacity-60 h-8 w-0.5 transition-all duration-150 group-hover:bg-text-primary group-hover:opacity-80"
        :class="{
          'bg-editor-active opacity-100 w-1 h-16 shadow-sm': isDragging,
        }"
      />
    </div>

    <!-- Additional visual indicator when dragging -->
    <div
      v-if="isDragging"
      class="bg-gradient-to-r opacity-50 w-full inset-y-0 left-0 absolute from-transparent to-transparent via-editor-active/20"
    />
  </div>
</template>
