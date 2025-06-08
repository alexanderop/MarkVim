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
const { settings, toggleVimMode, toggleLineNumbers } = useEditorSettings()
const isPreviewVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'preview')
const isSplitView = computed(() => viewMode.value === 'split')
const isEditorVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'editor')

const isMobile = useMediaQuery('(max-width: 768px)')

// Command palette state
const commandPaletteOpen = ref(false)
const commandPalettePosition = ref({ x: 0, y: 0 })

const { registerShortcuts, formatKeys } = useShortcuts()

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
  // eslint-disable-next-line no-alert
  const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`)

  if (confirmed) {
    deleteDocument(activeDocument.value.id)
  }
}

function handleDocumentSelect(id: string) {
  setActiveDocument(id)
}

function handleCreateDocument() {
  createDocument()
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
  <div ref="containerRef" class="text-gray-100 font-sans bg-editor-bg flex flex-col h-screen">
    <HeaderToolbar
      :view-mode="viewMode"
      :is-mobile="isMobile"
      :is-sidebar-visible="isSidebarVisible"
      :active-document-title="activeDocumentTitle"
      @update:view-mode="viewMode = $event"
      @toggle-sidebar="handleToggleSidebar"
      @delete-document="handleDeleteDocument"
    />

    <div class="flex flex-1 overflow-hidden">
      <DocumentList
        :documents="documents"
        :active-document-id="activeDocumentId"
        :is-visible="isSidebarVisible"
        @select-document="handleDocumentSelect"
        @create-document="handleCreateDocument"
      />

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
      />
    </div>

    <StatusBar
      :line-count="activeMarkdown.split('\n').length"
      :character-count="activeMarkdown.length"
      :format-keys="formatKeys"
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
      @toggle-settings="handleToggleSettings"
    />
  </div>
</template>

<style>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: theme('colors.editor.bg');
}

::-webkit-scrollbar-thumb {
  background: theme('colors.editor.hover');
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3a3f52;
}

.cm-editor {
  background-color: theme('colors.editor.bg') !important;
  color: #b4bcd0 !important;
  border: none !important;
}

.cm-focused {
  outline: none !important;
}

.cm-content {
  padding: 32px !important;
  font-size: 17px !important;
  line-height: 1.6 !important;
}

.cm-placeholder {
  color: theme('colors.text.secondary') !important;
}

.cm-cursor {
  border-left-color: theme('colors.editor.active') !important;
  border-left-width: 2px !important;
}

.cm-selectionBackground {
  background-color: rgba(theme('colors.editor.active'), 0.125) !important;
}

/* Markdown-specific syntax highlighting */
.cm-line {
  position: relative;
}

.cm-header {
  font-weight: 600 !important;
}

.cm-header.cm-header-1 {
  color: #ffffff !important;
  font-weight: 700 !important;
}

.cm-header.cm-header-2 {
  color: #e6edf3 !important;
  font-weight: 600 !important;
}

.cm-header.cm-header-3 {
  color: #d2d9e0 !important;
  font-weight: 600 !important;
}

.cm-header.cm-header-4,
.cm-header.cm-header-5,
.cm-header.cm-header-6 {
  color: #c9d1d9 !important;
  font-weight: 600 !important;
}

.cm-strong {
  color: #ffffff !important;
  font-weight: 600 !important;
}

.cm-emphasis {
  color: #e6edf3 !important;
  font-style: italic !important;
}

.cm-strikethrough {
  color: #8b949e !important;
  text-decoration: line-through !important;
}

.cm-code {
  background: rgba(110, 118, 129, 0.15) !important;
  color: #ff7b72 !important;
  padding: 0.125rem 0.25rem !important;
  border-radius: 0.25rem !important;
}

.cm-link {
  color: #58a6ff !important;
  text-decoration: none !important;
}

.cm-url {
  color: #58a6ff !important;
}

.cm-quote {
  color: #8b949e !important;
  font-style: italic !important;
}

.cm-list {
  color: #58a6ff !important;
}

.cm-hr {
  color: #30363d !important;
}

.cm-meta {
  color: #8b949e !important;
}

.cm-activeLine {
  background-color: rgba(110, 118, 129, 0.05) !important;
}

.cm-activeLineGutter {
  background-color: rgba(110, 118, 129, 0.05) !important;
}

.cm-gutters {
  background-color: theme('colors.editor.bg') !important;
  border-right: 1px solid theme('colors.editor.border') !important;
  color: theme('colors.text.secondary') !important;
}

.cm-lineNumbers .cm-gutterElement {
  color: theme('colors.text.secondary') !important;
  font-size: 13px !important;
}
</style>
