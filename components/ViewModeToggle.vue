<script setup lang="ts">
interface Props {
  viewMode: 'split' | 'editor' | 'preview'
  isMobile: boolean
}

interface Emits {
  (e: 'update:viewMode', value: 'split' | 'editor' | 'preview'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="p-0.5 rounded-lg bg-gray-800 flex items-center md:p-1">
    <button
      class="text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 md:text-sm md:px-3 md:py-1.5" :class="[
        viewMode === 'editor'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
      ]"
      title="Editor only (⌘1)"
      @click="$emit('update:viewMode', 'editor')"
    >
      <Icon name="lucide:edit-3" class="h-3 w-3 md:h-4 md:w-4" :class="isMobile ? '' : 'mr-1.5'" />
      <span v-if="!isMobile">Editor</span>
    </button>

    <button
      class="text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 md:text-sm md:px-3 md:py-1.5" :class="[
        viewMode === 'split'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
      ]"
      title="Split view (⌘2)"
      @click="$emit('update:viewMode', 'split')"
    >
      <Icon name="lucide:columns-2" class="h-3 w-3 md:h-4 md:w-4" :class="isMobile ? '' : 'mr-1.5'" />
      <span v-if="!isMobile">Split</span>
    </button>

    <button
      class="text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 md:text-sm md:px-3 md:py-1.5" :class="[
        viewMode === 'preview'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
      ]"
      title="Preview only (⌘3)"
      @click="$emit('update:viewMode', 'preview')"
    >
      <Icon name="lucide:eye" class="h-3 w-3 md:h-4 md:w-4" :class="isMobile ? '' : 'mr-1.5'" />
      <span v-if="!isMobile">Preview</span>
    </button>
  </div>
</template>
