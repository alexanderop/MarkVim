<script setup lang="ts">
import type { Document } from '~/modules/documents/composables/useDocuments'

interface Props {
  viewMode: ViewMode
  isMobile: boolean
  isSidebarVisible: boolean
  activeDocumentTitle: string
  activeDocument: Document | null
}

interface Emits {
  (e: 'update:viewMode', value: ViewMode): void
  (e: 'toggleSidebar'): void
  (e: 'deleteDocument'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <header data-testid="header-toolbar" class="px-4 border-b border-subtle bg-background/80 flex h-14 items-center justify-between backdrop-blur-xl">
    <!-- Left section -->
    <div class="flex gap-3 items-center">
      <ToolbarButton
        :icon="isSidebarVisible ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
        :text="isSidebarVisible ? 'Hide' : 'Show'"
        :title="isSidebarVisible ? 'Hide' : 'Show'"
        variant="toggle"
        data-testid="sidebar-toggle"
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
    <div data-testid="view-mode-toggle" class="p-1 border border-subtle rounded-lg bg-surface-primary/60 flex items-center">
      <BaseButton
        v-for="mode in [
          { key: 'editor', icon: 'lucide:edit-3', label: 'Editor', shortcut: '⌘1' },
          { key: 'split', icon: 'lucide:columns-2', label: 'Split', shortcut: '⌘2' },
          { key: 'preview', icon: 'lucide:eye', label: 'Preview', shortcut: '⌘3' },
        ]"
        :key="mode.key"
        variant="ghost"
        size="sm"
        :icon="mode.icon"
        :data-testid="`view-mode-${mode.key}`"
        class="relative" :class="[
          viewMode === mode.key
            ? 'text-text-bright'
            : 'text-text-secondary hover:text-text-primary',
        ]"
        :title="`${mode.label} (${mode.shortcut})`"
        @click="$emit('update:viewMode', mode.key as 'split' | 'editor' | 'preview')"
      >
        <span class="hidden sm:inline">{{ mode.label }}</span>

        <!-- Active indicator -->
        <div
          v-if="viewMode === mode.key"
          :data-testid="`view-mode-${mode.key}-active`"
          class="rounded-md ring-1 ring-white/10 inset-0 absolute bg-white/5"
        />
      </BaseButton>
    </div>

    <!-- Right section -->
    <div class="flex gap-2 items-center">
      <ShareButton
        :document="activeDocument"
      />

      <BaseButton
        variant="icon"
        size="icon"
        icon="lucide:trash-2"
        title="Delete note"
        data-testid="delete-document-btn"
        class="hover:text-red-400 hover:bg-red-500/10"
        icon-only
        @click="$emit('deleteDocument')"
      />

      <div class="bg-gray-700/50 h-4 w-px" />

      <div class="flex gap-1 items-center">
        <ShortcutsModal />
        <SettingsModal />
      </div>
    </div>
  </header>
</template>
