<script setup lang="ts">
interface Props {
  viewMode: ViewMode
  isMobile: boolean
}

interface Emits {
  (e: 'update:viewMode', value: ViewMode): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
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
</template>
