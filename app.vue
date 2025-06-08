<script setup lang="ts">
const viewMode = ref<'split' | 'editor' | 'preview'>('split')
const isSidebarVisible = ref(true)

// Document management
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

// Create a writable computed for the active document's content
const activeMarkdown = computed({
  get: () => activeDocument.value?.content || '',
  set: (value: string) => {
    if (activeDocument.value) {
      updateDocument(activeDocument.value.id, value)
    }
  },
})

// Use the refactored markdown composable
const { renderedMarkdown, shikiCSS } = useMarkdown(activeMarkdown)

const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()
const { settings, toggleVimMode, toggleLineNumbers, togglePreviewSync } = useEditorSettings()
const isPreviewVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'preview')
const isSplitView = computed(() => viewMode.value === 'split')
const isEditorVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'editor')

// Vim mode tracking
const currentVimMode = ref<string>('NORMAL')

const isMobile = useMediaQuery('(max-width: 768px)')

// Command palette state
const commandPaletteOpen = ref(false)
const commandPalettePosition = ref({ x: 0, y: 0 })

// Delete modal state
const deleteModalOpen = ref(false)
const documentToDelete = ref<{ id: string, title: string } | null>(null)

const { registerShortcuts, registerAppCommands, formatKeys } = useShortcuts()

// Get the title of the active document
const activeDocumentTitle = computed(() => {
  return activeDocument.value
    ? getDocumentTitle(activeDocument.value.content)
    : 'MarkVim'
})

// Global keyboard event handler for command palette
function handleGlobalKeydown(event: KeyboardEvent) {
  // Handle Meta+K (Cmd+K) shortcut for command palette
  if ((event.metaKey || event.ctrlKey) && event.key === 'k' && !commandPaletteOpen.value) {
    event.preventDefault()
    openCommandPalette(event)
    return
  }

  // Close command palette with Escape
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

function handleDeleteDocument() {
  if (!activeDocument.value)
    return

  const title = getDocumentTitle(activeDocument.value.content)
  documentToDelete.value = { id: activeDocument.value.id, title }
  deleteModalOpen.value = true
}

function confirmDeleteDocument() {
  if (documentToDelete.value) {
    deleteDocument(documentToDelete.value.id)
    deleteModalOpen.value = false
    documentToDelete.value = null
  }
}

function cancelDeleteDocument() {
  deleteModalOpen.value = false
  documentToDelete.value = null
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

    // Editor shortcuts (Linear-inspired)
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

  // Register app commands for command palette
  registerAppCommands([
    // File Commands
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

    // Settings Commands
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
      <!-- Sidebar with smooth transition -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="transform -translate-x-full opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform -translate-x-full opacity-0"
      >
        <DocumentList
          v-if="isSidebarVisible"
          :documents="documents"
          :active-document-id="activeDocumentId"
          :is-visible="isSidebarVisible"
          @select-document="handleDocumentSelect"
          @create-document="handleCreateDocument"
          @delete-document="handleDeleteDocument"
        />
      </Transition>

      <!-- Main content area -->
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
      @command-selected="closeCommandPalette"
      @change-view-mode="viewMode = $event"
      @save-document="handleSaveDocument"
      @insert-text="handleInsertText"
      @toggle-vim-mode="handleToggleVimMode"
      @toggle-line-numbers="handleToggleLineNumbers"
      @toggle-preview-sync="handleTogglePreviewSync"
      @toggle-settings="handleToggleSettings"
    />

    <!-- Delete Confirmation Modal -->
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
/* Global scrollbar styling for Linear-like feel */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* CodeMirror styling improvements */
.cm-editor {
  background-color: theme('colors.gray.900') !important;
  color: #e5e7eb !important;
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
  font-family: 'Inter', system-ui, sans-serif !important;
}

.cm-placeholder {
  color: theme('colors.gray.500') !important;
}

.cm-cursor {
  border-left-color: theme('colors.blue.500') !important;
  border-left-width: 2px !important;
}

.cm-selectionBackground {
  background-color: rgba(59, 130, 246, 0.15) !important;
}

/* Markdown syntax highlighting improvements */
.cm-line {
  position: relative;
}

.cm-header {
  font-weight: 600 !important;
}

.cm-header.cm-header-1 {
  color: #f9fafb !important;
  font-weight: 700 !important;
  font-size: 1.25em !important;
}

.cm-header.cm-header-2 {
  color: #f3f4f6 !important;
  font-weight: 600 !important;
  font-size: 1.15em !important;
}

.cm-header.cm-header-3 {
  color: #e5e7eb !important;
  font-weight: 600 !important;
  font-size: 1.1em !important;
}

.cm-header.cm-header-4,
.cm-header.cm-header-5,
.cm-header.cm-header-6 {
  color: #d1d5db !important;
  font-weight: 600 !important;
}

.cm-strong {
  color: #f9fafb !important;
  font-weight: 600 !important;
}

.cm-emphasis {
  color: #e5e7eb !important;
  font-style: italic !important;
}

.cm-strikethrough {
  color: #9ca3af !important;
  text-decoration: line-through !important;
}

.cm-code {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #60a5fa !important;
  padding: 0.125rem 0.25rem !important;
  border-radius: 0.25rem !important;
  font-family: 'JetBrains Mono', monospace !important;
}

.cm-link {
  color: #60a5fa !important;
  text-decoration: none !important;
}

.cm-url {
  color: #60a5fa !important;
}

.cm-quote {
  color: #9ca3af !important;
  font-style: italic !important;
  border-left: 3px solid rgba(59, 130, 246, 0.3) !important;
  padding-left: 1rem !important;
  margin-left: -1rem !important;
}

.cm-list {
  color: #60a5fa !important;
}

.cm-hr {
  color: #374151 !important;
}

.cm-meta {
  color: #9ca3af !important;
}

.cm-activeLine {
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.cm-activeLineGutter {
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.cm-gutters {
  background-color: theme('colors.gray.900') !important;
  border-right: 1px solid theme('colors.gray.800') !important;
  color: theme('colors.gray.500') !important;
}

.cm-lineNumbers .cm-gutterElement {
  color: theme('colors.gray.500') !important;
  font-size: 12px !important;
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color, transform, opacity, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom focus styles */
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid theme('colors.blue.500');
  outline-offset: 2px;
}
</style>
