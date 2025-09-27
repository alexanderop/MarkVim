<script setup lang="ts">
import type { Document } from '~/modules/documents/api'
import { emitAppEvent } from '@/shared/utils/eventBus'
import { useDocumentsStore } from '~/modules/documents/api'
import { useViewMode, type ViewMode } from '~/modules/layout/api'
import ShareButton from '~/modules/share/components/ShareButton.vue'
import { useShortcuts } from '~/modules/shortcuts/api'
import BaseButton from '~/shared/components/BaseButton.vue'
import SettingsModal from '~/shared/components/SettingsModal.vue'
import ShortcutsModal from '~/shared/components/ShortcutsModal.vue'

const props = defineProps<Props>()

defineEmits<Emits>()

const { openColorTheme } = useShortcuts()
const { getDocumentTitle } = useDocumentsStore()
const { isSidebarVisible, toggleSidebar } = useViewMode()

interface Props {
  viewMode: ViewMode
  isMobile: boolean
  activeDocumentTitle: string
  activeDocument: Document | null
}

interface Emits {
  (e: 'update:viewMode', value: ViewMode): void
}

function handleDeleteDocument() {
  if (props.activeDocument) {
    emitAppEvent('document:delete', {
      documentId: props.activeDocument.id,
      documentTitle: getDocumentTitle(props.activeDocument.content),
    })
  }
}
</script>

<template>
  <header data-testid="header-toolbar" class="px-2 md:px-4 border-b border-subtle bg-background/80 flex h-14 items-center justify-between backdrop-blur-xl">
    <!-- Left section -->
    <div class="flex gap-3 items-center">
      <BaseButton
        :icon="isSidebarVisible ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
        :title="isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'"
        variant="ghost"
        size="sm"
        data-testid="sidebar-toggle"
        class="text-xs font-medium px-2 py-1 md:text-sm md:px-3 md:py-1.5"
        @click="toggleSidebar"
      >
        <span class="hidden md:inline">{{ isSidebarVisible ? 'Hide' : 'Show' }}</span>
      </BaseButton>

      <div class="flex gap-2 items-center">
        <h1 class="text-sm text-gray-100 tracking-tight font-medium w-32 md:w-48 truncate">
          {{ activeDocumentTitle }}
        </h1>
      </div>
    </div>

    <!-- Center section - View mode toggle -->
    <div data-testid="view-mode-toggle" class="p-0.5 md:p-1 border border-subtle rounded-lg bg-surface-primary/60 flex items-center">
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
        class="relative px-2 py-1 md:px-3 md:py-1.5"
        :class="viewMode === mode.key ? 'text-accent' : 'text-foreground opacity-60 hover:opacity-80'"
        :title="`${mode.label} (${mode.shortcut})`"
        @click="$emit('update:viewMode', mode.key as 'split' | 'editor' | 'preview')"
      >
        <span class="hidden sm:inline">{{ mode.label }}</span>

        <!-- Active indicator -->
        <div
          v-if="viewMode === mode.key"
          :data-testid="`view-mode-${mode.key}-active`"
          class="rounded-md inset-0 absolute bg-white/5"
        />
      </BaseButton>
    </div>

    <!-- Right section -->
    <div class="flex gap-1 md:gap-2 items-center">
      <ShareButton
        :document="activeDocument"
      />

      <BaseButton
        variant="icon"
        size="icon"
        icon="lucide:trash-2"
        title="Delete note"
        data-testid="delete-document-btn"
        class="hover:text-error hover:bg-error/10 hidden md:flex"
        icon-only
        @click="handleDeleteDocument"
      />

      <div class="bg-gray-700/50 h-4 w-px hidden md:block" />

      <div class="flex gap-0.5 md:gap-1 items-center">
        <BaseButton
          variant="ghost"
          size="sm"
          icon="lucide:palette"
          icon-only
          title="Color Theme"
          data-testid="color-theme-button"
          class="hidden md:flex"
          @click="openColorTheme"
        />
        <ShortcutsModal />
        <SettingsModal />
      </div>
    </div>
  </header>
</template>
