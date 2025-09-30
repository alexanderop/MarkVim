<script setup lang="ts">
interface Emits {
  (e: 'startDrag', event: PointerEvent): void
}

const { isDragging } = defineProps<{
  isDragging?: boolean
}>()
defineEmits<Emits>()
</script>

<template>
  <div
    class="group bg-border flex-shrink-0 w-px cursor-col-resize transition-all duration-150 relative hover:w-1.5 hover:bg-accent"
    :class="{
      'bg-accent w-1.5 shadow-lg z-20': isDragging,
    }"
    :style="isDragging ? `box-shadow: 0 0 12px color-mix(in oklch, var(--accent) 40%, transparent), 0 0 4px color-mix(in oklch, var(--accent) 60%, transparent)` : ''"
    @pointerdown="$emit('startDrag', $event)"
    @touchstart.prevent
  >
    <div class="flex items-center inset-0 justify-center absolute opacity-0 group-hover:opacity-100 transition-opacity">
      <div
        class="bg-white/80 h-8 w-0.5 rounded-full"
        :class="{
          'bg-white w-1 h-12': isDragging,
        }"
      />
    </div>

    <div
      v-if="isDragging"
      class="bg-gradient-to-r opacity-50 w-full inset-y-0 left-0 absolute from-transparent to-transparent via-accent/20"
    />
  </div>
</template>
