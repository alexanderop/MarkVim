<script setup lang="ts">
interface Props {
  viewMode: 'split' | 'editor' | 'preview'
  isMobile: boolean
  isSidebarVisible: boolean
  activeDocumentTitle: string
}

interface Emits {
  (e: 'update:viewMode', value: 'split' | 'editor' | 'preview'): void
  (e: 'toggle-sidebar'): void
  (e: 'delete-document'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="px-3 py-2 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between backdrop-blur md:px-6 md:py-3">
    <div class="flex items-center space-x-2 md:space-x-4">
      <div class="flex items-center space-x-2">
        <ToolbarButton
          variant="icon"
          :icon="isSidebarVisible ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
          title="Toggle sidebar"
          @click="$emit('toggle-sidebar')"
        />
        
        <h1 class="text-base text-white font-semibold md:text-lg">
          {{ activeDocumentTitle }}
        </h1>
      </div>

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
      <ToolbarButton
        variant="icon"
        icon="lucide:trash-2"
        title="Delete current note"
        @click="$emit('delete-document')"
      />
      <div class="hidden md:block">
        <ShortcutsModal />
      </div>
      <SettingsModal />
    </div>
  </div>
</template>
