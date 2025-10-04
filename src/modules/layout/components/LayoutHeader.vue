<script setup lang="ts">
import type { Document } from '~/modules/documents/api'
import { UButton } from '#components'
import { computed } from 'vue'
import { emitAppEvent } from '@/shared/utils/eventBus'
import { getDocumentTitle } from '~/modules/documents/api'
import { useFeatureFlagsState } from '~/modules/feature-flags/api'
import { useViewMode, type ViewMode } from '~/modules/layout/api'
import { ShareButton } from '~/modules/share/api'
import { useShortcuts } from '~/modules/shortcuts/api'
import SettingsModal from '~/shared/components/SettingsModal.vue'
import ShortcutsModal from '~/shared/components/ShortcutsModal.vue'

interface Emits {
  (e: 'update:viewMode', value: ViewMode): void
}

const { viewMode, activeDocumentTitle, activeDocument } = defineProps<{
  viewMode: ViewMode
  isMobile: boolean
  activeDocumentTitle: string
  activeDocument: Document | null
}>()

defineEmits<Emits>()

const { toggleColorTheme } = useShortcuts()
const { isSidebarVisible, toggleSidebar } = useViewMode()
const { state: featureFlags } = useFeatureFlagsState()
const isDocumentsFeatureEnabled = computed(() => featureFlags.value.flags.documents)

function handleDeleteDocument(): void {
  if (activeDocument) {
    emitAppEvent('document:delete', {
      documentId: activeDocument.id,
      documentTitle: getDocumentTitle(activeDocument.content),
    })
  }
}
</script>

<template>
  <header
    data-testid="header-toolbar"
    class="px-2 md:px-4 border-b border-subtle bg-background/80 flex h-14 items-center justify-between backdrop-blur-xl"
  >
    <!-- Left section -->
    <div class="flex gap-3 items-center">
      <UButton
        :icon="isSidebarVisible ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
        :title="isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'"
        color="neutral"
        variant="ghost"
        size="sm"
        data-testid="sidebar-toggle"
        class="text-xs font-medium px-2 py-1 md:text-sm md:px-3 md:py-1.5"
        @click="toggleSidebar"
      >
        <span class="hidden md:inline">{{ isSidebarVisible ? 'Hide' : 'Show' }}</span>
      </UButton>

      <div class="flex gap-2 items-center">
        <h1 class="text-sm text-gray-100 tracking-tight font-medium w-32 md:w-48 truncate">
          {{ activeDocumentTitle }}
        </h1>
      </div>
    </div>

    <!-- Center section - View mode toggle -->
    <div
      data-testid="view-mode-toggle"
      class="p-0.5 md:p-1 border border-subtle rounded-lg bg-surface-primary/60 flex items-center"
    >
      <UButton
        v-for="mode in [
          { key: 'editor', icon: 'lucide:edit-3', label: 'Editor', shortcut: '⌘1' },
          { key: 'split', icon: 'lucide:columns-2', label: 'Split', shortcut: '⌘2' },
          { key: 'preview', icon: 'lucide:eye', label: 'Preview', shortcut: '⌘3' },
        ]"
        :key="mode.key"
        color="neutral"
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
          class="rounded-md inset-0 absolute bg-[var(--accent)]/10"
        />
      </UButton>
    </div>

    <!-- Right section -->
    <div class="flex gap-1 md:gap-2 items-center">
      <ShareButton
        v-feature="'share'"
        :document="activeDocument"
      />

      <UButton
        v-if="isDocumentsFeatureEnabled"
        color="neutral"
        variant="ghost"
        size="md"
        icon="lucide:trash-2"
        title="Delete note"
        data-testid="delete-document-btn"
        class="hover:text-error hover:bg-error/10 hidden md:flex"
        square
        @click="handleDeleteDocument"
      />

      <div class="bg-gray-700/50 h-4 w-px hidden md:block" />

      <div class="flex gap-0.5 md:gap-1 items-center">
        <UButton
          v-feature="'color-theme'"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="lucide:palette"
          square
          title="Color Theme"
          data-testid="color-theme-button"
          class="hidden md:flex"
          @click="() => { toggleColorTheme(true) }"
        />
        <ShortcutsModal v-feature="'shortcuts'" />
        <SettingsModal />
      </div>
    </div>
  </header>
</template>
