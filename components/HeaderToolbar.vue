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

      <div class="p-0.5 rounded-lg bg-gray-800 flex items-center md:p-1">
        <ToolbarButton
          variant="toggle"
          icon="lucide:edit-3"
          text="Editor"
          title="Editor only (⌘1)"
          :active="viewMode === 'editor'"
          @click="$emit('update:viewMode', 'editor')"
        />

        <ToolbarButton
          variant="toggle"
          icon="lucide:columns-2"
          text="Split"
          title="Split view (⌘2)"
          :active="viewMode === 'split'"
          @click="$emit('update:viewMode', 'split')"
        />

        <ToolbarButton
          variant="toggle"
          icon="lucide:eye"
          text="Preview"
          title="Preview only (⌘3)"
          :active="viewMode === 'preview'"
          @click="$emit('update:viewMode', 'preview')"
        />
      </div>
    </div>

    <div class="p-0.5 rounded-lg bg-gray-800 flex items-center md:p-1">
      <div class="hidden md:block">
        <ShortcutsModal />
      </div>
      <SettingsModal />
    </div>
  </div>
</template>
