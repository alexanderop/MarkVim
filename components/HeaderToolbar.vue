<script setup lang="ts">
interface Props {
  viewMode: 'split' | 'editor' | 'preview'
  isMobile: boolean
  isSidebarVisible: boolean
  activeDocumentTitle: string
}

interface Emits {
  (e: 'update:viewMode', value: 'split' | 'editor' | 'preview'): void
  (e: 'toggleSidebar'): void
  (e: 'deleteDocument'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <header class="px-4 border-b border-subtle bg-background/80 flex h-14 items-center justify-between backdrop-blur-xl">
    <!-- Left section -->
    <div class="flex gap-3 items-center">
      <ToolbarButton
        :icon="isSidebarVisible ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
        :text="isSidebarVisible ? 'Hide' : 'Show'"
        :title="isSidebarVisible ? 'Hide' : 'Show'"
        variant="toggle"
        @click="$emit('toggleSidebar')"
      />

      <div class="flex gap-2 items-center">
        <div class="rounded-full bg-emerald-400 h-2 w-2 shadow-emerald-400/30 shadow-lg" />
        <h1 class="text-sm text-gray-100 tracking-tight font-medium w-48 truncate">
          {{ activeDocumentTitle }}
        </h1>
      </div>
    </div>

    <!-- Center section - View mode toggle -->
    <div class="p-1 border border-subtle rounded-lg bg-surface-primary/60 flex items-center">
      <button
        v-for="mode in [
          { key: 'editor', icon: 'lucide:edit-3', label: 'Editor', shortcut: '⌘1' },
          { key: 'split', icon: 'lucide:columns-2', label: 'Split', shortcut: '⌘2' },
          { key: 'preview', icon: 'lucide:eye', label: 'Preview', shortcut: '⌘3' },
        ]"
        :key="mode.key"
        class="group text-xs font-medium px-3 py-1.5 rounded-md flex gap-1.5 transition-all duration-200 items-center relative"
        :class="[
          viewMode === mode.key
            ? 'text-text-bright'
            : 'text-text-secondary hover:text-text-primary',
        ]"
        :title="`${mode.label} (${mode.shortcut})`"
        @click="$emit('update:viewMode', mode.key)"
      >
        <Icon
          :name="mode.icon"
          class="h-3.5 w-3.5 transition-colors duration-200"
        />
        <span class="hidden sm:inline">{{ mode.label }}</span>

        <!-- Active indicator -->
        <div
          v-if="viewMode === mode.key"
          class="rounded-md ring-1 ring-white/10 inset-0 absolute bg-white/5"
        />
      </button>
    </div>

    <!-- Right section -->
    <div class="flex gap-2 items-center">
      <button
        class="group text-gray-400 rounded-lg flex h-8 w-8 transition-all duration-200 items-center justify-center hover:text-red-400 hover:bg-red-500/10"
        title="Delete note"
        @click="$emit('deleteDocument')"
      >
        <Icon
          name="lucide:trash-2"
          class="h-4 w-4 transition-colors duration-200"
        />
      </button>

      <div class="bg-gray-700/50 h-4 w-px" />

      <div class="flex gap-1 items-center">
        <ShortcutsModal />
        <SettingsModal />
      </div>
    </div>
  </header>
</template>
