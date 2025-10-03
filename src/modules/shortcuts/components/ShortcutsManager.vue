<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'
import { getDocumentTitle, useDocumentsStore } from '~/modules/documents/api'
import { useShortcuts } from '~/modules/shortcuts/api'
import ShortcutsCommandPalette from './CommandPalette.vue'

// Command palette state - moved from AppShell
const commandPaletteOpen = ref(false)
const commandPalettePosition = ref({ x: 0, y: 0 })

// Use documents store
const documentsStore = useDocumentsStore()
const { documents, activeDocument } = storeToRefs(documentsStore)

// Get required composables
const { registerShortcuts, registerAppCommand, setNewDocumentAction, createSequentialShortcut } = useShortcuts()

function handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k' && !commandPaletteOpen.value) {
    event.preventDefault()
    openCommandPalette(event)
    return
  }

  if (event.key === 'Escape' && commandPaletteOpen.value) {
    emitAppEvent('command-palette:close')
  }
}

function openCommandPalette(_event?: KeyboardEvent) {
  const centerX = window.innerWidth / 2 - 200
  const centerY = window.innerHeight / 3

  commandPalettePosition.value = { x: centerX, y: centerY }
  emitAppEvent('command-palette:open', { position: { x: centerX, y: centerY } })
}

function closeCommandPalette() {
  commandPaletteOpen.value = false
}

function handleDocumentSelectFromPalette(id: string) {
  emitAppEvent('document:select', { documentId: id })
  closeCommandPalette()
}

function handleCreateDocument() {
  documentsStore.dispatch({ type: 'CREATE_DOCUMENT' })
}

// Listen to event bus events
onAppEvent('command-palette:open', (payload) => {
  if (payload?.position) {
    commandPalettePosition.value = payload.position
  }
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
    emitAppEvent('sidebar:toggle')
  })

  registerShortcuts([
    {
      keys: 'g t',
      description: 'Toggle sidebar',
      action: () => emitAppEvent('sidebar:toggle'),
      category: 'View',
      icon: 'lucide:panel-left',
    },
    {
      keys: '1',
      description: 'Switch to Editor only',
      action: () => emitAppEvent('view:set', { viewMode: 'editor' }),
      category: 'View',
      icon: 'lucide:edit-3',
    },
    {
      keys: '2',
      description: 'Switch to Split view',
      action: () => emitAppEvent('view:set', { viewMode: 'split' }),
      category: 'View',
      icon: 'lucide:columns-2',
    },
    {
      keys: '3',
      description: 'Switch to Preview only',
      action: () => emitAppEvent('view:set', { viewMode: 'preview' }),
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
      action: () => emitAppEvent('settings:toggle-vim'),
      category: 'Settings',
      icon: 'lucide:terminal',
    },
    {
      keys: 'l',
      description: 'Toggle Line Numbers',
      action: () => emitAppEvent('settings:toggle-line-numbers'),
      category: 'Settings',
      icon: 'lucide:hash',
    },
    {
      keys: 'p',
      description: 'Toggle Preview Sync',
      action: () => emitAppEvent('settings:toggle-preview-sync'),
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
  <ShortcutsCommandPalette
    v-model:open="commandPaletteOpen"
    :position="commandPalettePosition"
    :documents="documents"
    @command-selected="closeCommandPalette"
    @select-document="handleDocumentSelectFromPalette"
  />
</template>
