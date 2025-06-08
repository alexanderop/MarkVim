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
  <div class="px-3 py-2 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between backdrop-blur md:px-6 md:py-3">
    <div class="flex items-center space-x-2 md:space-x-4">
      <h1 class="text-base text-white font-semibold md:text-lg">
        MarkVim
      </h1>

      <ViewModeToggle
        :view-mode="viewMode"
        :is-mobile="isMobile"
        @update:view-mode="$emit('update:viewMode', $event)"
      />
    </div>

    <div class="flex items-center space-x-2">
      <div class="hidden md:block">
        <ShortcutsModal />
      </div>
      <SettingsModal />
    </div>
  </div>
</template>
