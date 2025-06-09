<script setup lang="ts">
const viewMode = ref<'split' | 'editor' | 'preview'>('split')
const isSidebarVisible = useLocalStorage('markvim-sidebar-visible', true)
const currentVimMode = ref<string>('NORMAL')
const commandPaletteOpen = ref(false)
const commandPalettePosition = ref({ x: 0, y: 0 })

const isMobile = useMediaQuery('(max-width: 768px)')

const {
  documents,
  activeDocument,
  activeDocumentId,
  createDocument,
  setActiveDocument,
  updateDocument,
  deleteDocument,
  getDocumentTitle,
} = useDocuments()

const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()
const { settings, toggleVimMode, toggleLineNumbers, togglePreviewSync } = useEditorSettings()

const activeMarkdown = computed({
  get: () => activeDocument.value?.content || '',
  set: (value: string) => {
    if (activeDocument.value) {
      updateDocument(activeDocument.value.id, value)
    }
  },
})

const { renderedMarkdown, shikiCSS } = useMarkdown(activeMarkdown)

const isPreviewVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'preview')
const isSplitView = computed(() => viewMode.value === 'split')
const isEditorVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'editor')

function useDocumentDeletion() {
  const deleteModalOpen = ref(false)
  const documentToDelete = ref<{ id: string, title: string } | null>(null)

  const handleDeleteDocument = () => {
    if (!activeDocument.value)
      return

    const title = getDocumentTitle(activeDocument.value.content)
    documentToDelete.value = { id: activeDocument.value.id, title }
    deleteModalOpen.value = true
  }

  const confirmDeleteDocument = () => {
    if (documentToDelete.value) {
      deleteDocument(documentToDelete.value.id)
      deleteModalOpen.value = false
      documentToDelete.value = null
    }
  }

  const cancelDeleteDocument = () => {
    deleteModalOpen.value = false
    documentToDelete.value = null
  }

  return {
    deleteModalOpen,
    documentToDelete,
    handleDeleteDocument,
    confirmDeleteDocument,
    cancelDeleteDocument,
  }
}

const { deleteModalOpen, documentToDelete, handleDeleteDocument, confirmDeleteDocument, cancelDeleteDocument } = useDocumentDeletion()

const { registerShortcuts, registerAppCommands, formatKeys } = useShortcuts()

const activeDocumentTitle = computed(() => {
  return activeDocument.value
    ? getDocumentTitle(activeDocument.value.content)
    : 'MarkVim'
})

function handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k' && !commandPaletteOpen.value) {
    event.preventDefault()
    openCommandPalette(event)
    return
  }

  if (event.key === 'Escape' && commandPaletteOpen.value) {
    commandPaletteOpen.value = false
  }
}

function openCommandPalette(_event?: KeyboardEvent) {
  // Position the command palette near the center of the screen
  const centerX = window.innerWidth / 2 - 200 // 200 is half width of palette
  const centerY = window.innerHeight / 3

  commandPalettePosition.value = { x: centerX, y: centerY }
  commandPaletteOpen.value = true
}

function closeCommandPalette() {
  commandPaletteOpen.value = false
}

function handleDocumentSelectFromPalette(id: string) {
  setActiveDocument(id)
  closeCommandPalette()
}

function handleSaveDocument() {
  if (!activeDocument.value)
    return

  const blob = new Blob([activeDocument.value.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${getDocumentTitle(activeDocument.value.content)}.md`
  a.click()
  URL.revokeObjectURL(url)
}

function handleInsertText(text: string) {
  if (activeDocument.value) {
    activeMarkdown.value += text
  }
}

function handleToggleVimMode() {
  toggleVimMode()
}

function handleToggleLineNumbers() {
  toggleLineNumbers()
}

function handleTogglePreviewSync() {
  togglePreviewSync()
}

function handleToggleSettings() {
  // This would open the settings modal - for now, just log
}

function handleToggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value
}

function handleDocumentSelect(id: string) {
  setActiveDocument(id)
}

function handleCreateDocument() {
  createDocument()
}

function handleVimModeChange(mode: string, subMode?: string) {
  if (subMode) {
    currentVimMode.value = `${mode.toUpperCase()} (${subMode.toUpperCase()})`
  }
  else {
    currentVimMode.value = mode.toUpperCase()
  }
}

onMounted(() => {
  // Add global event listener
  document.addEventListener('keydown', handleGlobalKeydown)

  registerShortcuts([
    {
      keys: '1',
      description: 'Switch to Editor only',
      action: () => { viewMode.value = 'editor' },
      category: 'View',
    },
    {
      keys: '2',
      description: 'Switch to Split view',
      action: () => { viewMode.value = 'split' },
      category: 'View',
    },
    {
      keys: '3',
      description: 'Switch to Preview only',
      action: () => { viewMode.value = 'preview' },
      category: 'View',
    },

    {
      keys: 'meta+k',
      description: 'Open command palette',
      action: () => {
        openCommandPalette()
      },
      category: 'Navigation',
    },
    {
      keys: 'meta+s',
      description: 'Save document',
      action: () => {
        handleSaveDocument()
      },
      category: 'File',
    },
    {
      keys: 'meta+shift+backslash',
      description: 'Toggle sidebar',
      action: () => {
        handleToggleSidebar()
      },
      category: 'View',
    },
  ])

  registerAppCommands([
    {
      id: 'save',
      keys: 'meta+s',
      description: 'Save Document',
      category: 'File',
      icon: '💾',
      action: () => handleSaveDocument(),
    },
    {
      id: 'download',
      keys: '',
      description: 'Download as Markdown',
      category: 'File',
      icon: '⬇️',
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
    },
    {
      id: 'new-document',
      keys: '',
      description: 'New Document',
      category: 'File',
      icon: '📄',
      action: () => handleCreateDocument(),
    },

    {
      id: 'toggle-vim-mode',
      keys: '',
      description: 'Toggle Vim Mode',
      category: 'Settings',
      icon: '⚡',
      action: () => handleToggleVimMode(),
    },
    {
      id: 'toggle-line-numbers',
      keys: '',
      description: 'Toggle Line Numbers',
      category: 'Settings',
      icon: '🔢',
      action: () => handleToggleLineNumbers(),
    },
    {
      id: 'toggle-preview-sync',
      keys: '',
      description: 'Toggle Preview Sync',
      category: 'Settings',
      icon: '🔄',
      action: () => handleTogglePreviewSync(),
    },
    {
      id: 'toggle-sidebar',
      keys: 'meta+shift+backslash',
      description: 'Toggle Sidebar',
      category: 'View',
      icon: '📋',
      action: () => handleToggleSidebar(),
    },
  ])
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

useHead({
  style: [
    {
      innerHTML: shikiCSS,
    },
  ],
})
</script>

<template>
  <div ref="containerRef" class="text-gray-100 font-sans bg-gray-950 flex flex-col h-screen overflow-hidden">
    <HeaderToolbar
      :view-mode="viewMode"
      :is-mobile="isMobile"
      :is-sidebar-visible="isSidebarVisible"
      :active-document-title="activeDocumentTitle"
      @update:view-mode="viewMode = $event"
      @toggle-sidebar="handleToggleSidebar"
      @delete-document="handleDeleteDocument"
    />

    <div class="flex flex-1 relative overflow-hidden">
      <DocumentList
        v-show="isSidebarVisible"
        :documents="documents"
        :active-document-id="activeDocumentId"
        :is-visible="isSidebarVisible"
        class="transition-all duration-300 ease-out" :class="[
          isSidebarVisible
            ? 'transform translate-x-0 opacity-100'
            : 'transform -translate-x-full opacity-0 pointer-events-none',
        ]"
        @select-document="handleDocumentSelect"
        @create-document="handleCreateDocument"
        @delete-document="handleDeleteDocument"
      />

      <div class="bg-gray-900/30 flex flex-1 flex-col overflow-hidden">
        <MainContent
          :layout="{
            isEditorVisible,
            isPreviewVisible,
            isSplitView,
            isMobile,
            leftPaneWidth,
            rightPaneWidth,
            isDragging,
          }"
          :content="{
            markdown: activeMarkdown,
            settings,
            renderedMarkdown,
          }"
          @update:markdown="activeMarkdown = $event"
          @start-drag="startDrag"
          @vim-mode-change="handleVimModeChange"
        />
      </div>
    </div>

    <StatusBar
      :line-count="activeMarkdown.split('\n').length"
      :character-count="activeMarkdown.length"
      :format-keys="formatKeys"
      :vim-mode="currentVimMode"
      :show-vim-mode="settings.vimMode"
    />

    <CommandPalette
      v-model:open="commandPaletteOpen"
      :position="commandPalettePosition"
      :view-mode="viewMode"
      :markdown="activeMarkdown"
      :documents="documents"
      @command-selected="closeCommandPalette"
      @change-view-mode="viewMode = $event"
      @save-document="handleSaveDocument"
      @insert-text="handleInsertText"
      @toggle-vim-mode="handleToggleVimMode"
      @toggle-line-numbers="handleToggleLineNumbers"
      @toggle-preview-sync="handleTogglePreviewSync"
      @toggle-settings="handleToggleSettings"
      @select-document="handleDocumentSelectFromPalette"
    />

    <BaseModal
      :open="deleteModalOpen"
      title="Delete Document"
      max-width="md"
      @update:open="deleteModalOpen = $event"
      @close="cancelDeleteDocument"
    >
      <div class="py-4">
        <p class="text-gray-200 text-sm leading-relaxed">
          Are you sure you want to delete <span class="font-semibold text-white">"{{ documentToDelete?.title }}"</span>?
        </p>
        <p class="text-gray-400 text-sm mt-2">
          This action cannot be undone.
        </p>
      </div>

      <div class="flex gap-3 items-center justify-end pt-4 border-t border-gray-700">
        <button
          class="text-sm font-medium px-4 py-2 rounded-md transition-colors text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
          @click="cancelDeleteDocument"
        >
          Cancel
        </button>
        <button
          class="text-sm font-medium px-4 py-2 rounded-md transition-colors bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          @click="confirmDeleteDocument"
        >
          Delete
        </button>
      </div>
    </BaseModal>
  </div>
</template>

<style>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(220 10% 25% / 0.5);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(220 10% 30% / 0.7);
}

.cm-editor {
  background-color: var(--color-surface-primary) !important;
  color: var(--color-text-primary) !important;
  border: none !important;
  border-radius: 0 !important;
}

.cm-focused {
  outline: none !important;
}

.cm-content {
  padding: 32px !important;
  font-size: 15px !important;
  line-height: 1.7 !important;
  font-family: var(--font-sans) !important;
}

.cm-placeholder {
  color: var(--color-text-secondary) !important;
}

.cm-cursor {
  border-left-color: var(--color-accent) !important;
  border-left-width: 2px !important;
}

.cm-selectionBackground {
  background-color: hsl(var(--accent-hsl) / 0.15) !important;
}

.cm-header { font-weight: 600 !important; }
.cm-header-1 { font-size: 1.25em !important; color: var(--color-text-bright) !important; }
.cm-header-2 { font-size: 1.15em !important; color: var(--color-text-bright) !important; }
.cm-header-3 { font-size: 1.1em !important; }
.cm-strong { font-weight: 600 !important; color: var(--color-text-bright) !important; }
.cm-emphasis { font-style: italic !important; }
.cm-strikethrough { color: var(--color-text-secondary) !important; text-decoration: line-through !important; }

.cm-code {
  background: hsl(var(--accent-hsl) / 0.1) !important;
  color: hsl(var(--accent-hsl) / 0.8) !important;
  padding: 0.125rem 0.25rem !important;
  border-radius: 0.25rem !important;
  font-family: var(--font-mono) !important;
}

.cm-link, .cm-url { color: var(--color-accent) !important; text-decoration: none !important; }

.cm-quote {
  color: var(--color-text-secondary) !important;
  font-style: italic !important;
  border-left: 3px solid hsl(var(--accent-hsl) / 0.3) !important;
  padding-left: 1rem !important;
  margin-left: -1rem !important;
}

.cm-meta { color: var(--color-text-secondary) !important; }
.cm-hr { color: var(--color-border) !important; }

.cm-activeLine {
  background-color: hsl(var(--surface-primary-hsl) / 0.5) !important;
}

.cm-gutters {
  background-color: var(--color-surface-primary) !important;
  border-right: 1px solid var(--color-border) !important;
  color: var(--color-text-secondary) !important;
}

.cm-lineNumbers .cm-gutterElement {
  color: var(--color-text-secondary) !important;
  font-size: 12px !important;
}

.cm-activeLineGutter {
  background-color: transparent !important;
  color: var(--color-text-primary) !important;
}

button, a {
  transition-property: color, background-color, border-color, transform, opacity, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
[role="button"]:focus-visible,
[role="switch"]:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px; /* Optional: adds rounded corners to the outline */
}
</style>
