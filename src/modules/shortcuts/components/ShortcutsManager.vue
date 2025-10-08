<script setup lang="ts">
import { getDocumentTitle, useDocuments } from '@modules/documents'
import { useEditorSettings } from '@modules/editor'
import { useShortcuts } from '@modules/shortcuts'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'
import { useViewMode } from '~/shared/api/layout'
import ShortcutsPaletteCommand from './ShortcutsPaletteCommand.vue'

// Command palette state
const commandPaletteOpen = ref(false)

// Use documents state and actions
const { documents, activeDocument, createDocument, selectDocument } = useDocuments()

// Use view mode actions
const { setViewMode, toggleSidebar } = useViewMode()

// Use editor settings actions
const { toggleVimMode, toggleLineNumbers, togglePreviewSync } = useEditorSettings()

// Get required composables
const { registerShortcuts, registerAppCommand, setNewDocumentAction, createSequentialShortcut } = useShortcuts()

function handleGlobalKeydown(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k' && !commandPaletteOpen.value) {
    event.preventDefault()
    openCommandPalette(event)
    return
  }

  if (event.key === 'Escape' && commandPaletteOpen.value) {
    emitAppEvent('command-palette:close')
  }
}

function openCommandPalette(_event?: KeyboardEvent): void {
  emitAppEvent('command-palette:open', {})
}

function closeCommandPalette(): void {
  commandPaletteOpen.value = false
}

function handleDocumentSelectFromPalette(id: string): void {
  selectDocument(id)
  closeCommandPalette()
}

function handleCreateDocument(): void {
  createDocument()
}

// Listen to event bus events
onAppEvent('command-palette:open', () => {
  commandPaletteOpen.value = true
})

onAppEvent('command-palette:close', () => {
  commandPaletteOpen.value = false
})

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)

  // Register the create document action with the shortcuts system
  setNewDocumentAction(handleCreateDocument)

  // Create g->t sequence shortcut for toggling sidebar
  createSequentialShortcut('g', 't', () => {
    toggleSidebar()
  })

  registerShortcuts([
    {
      keys: 'g t',
      description: 'Toggle sidebar',
      action: () => toggleSidebar(),
      category: 'View',
      icon: 'lucide:panel-left',
    },
    {
      keys: '1',
      description: 'Switch to Editor only',
      action: () => setViewMode('editor'),
      category: 'View',
      icon: 'lucide:edit-3',
    },
    {
      keys: '2',
      description: 'Switch to Split view',
      action: () => setViewMode('split'),
      category: 'View',
      icon: 'lucide:columns-2',
    },
    {
      keys: '3',
      description: 'Switch to Preview only',
      action: () => setViewMode('preview'),
      category: 'View',
      icon: 'lucide:eye',
    },
    {
      keys: 'meta+k',
      description: 'Open command palette',
      action: () => openCommandPalette(),
      category: 'Navigation',
      icon: 'lucide:search',
    },
    {
      keys: 'meta+s',
      description: 'Save document',
      action: () => {
        // Documents are auto-saved to localStorage on every change
        // This shortcut is here for user familiarity but is a no-op
      },
      category: 'File',
      icon: 'lucide:save',
    },
    {
      keys: 'meta+shift+s',
      description: 'Download as Markdown',
      action: () => {
        if (!activeDocument.value)
          return
        const blob = new Blob([activeDocument.value.content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${getDocumentTitle(activeDocument.value.content)}.md`
        a.click()
        URL.revokeObjectURL(url)
      },
      category: 'File',
      icon: 'lucide:download',
    },
    {
      keys: 'v',
      description: 'Toggle Vim Mode',
      action: () => toggleVimMode(),
      category: 'Settings',
      icon: 'lucide:terminal',
    },
    {
      keys: 'l',
      description: 'Toggle Line Numbers',
      action: () => toggleLineNumbers(),
      category: 'Settings',
      icon: 'lucide:hash',
    },
    {
      keys: 'p',
      description: 'Toggle Preview Sync',
      action: () => togglePreviewSync(),
      category: 'Settings',
      icon: 'lucide:link-2',
    },
  ])

  // Register vim commands for command palette
  registerAppCommand({
    id: 'vim-new',
    keys: ':new',
    description: 'New Document (Vim)',
    action: () => handleCreateDocument(),
    category: 'File',
    icon: 'lucide:file-plus',
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <ShortcutsPaletteCommand
    v-model:open="commandPaletteOpen"
    :documents="documents"
    @select-document="handleDocumentSelectFromPalette"
  />
</template>
