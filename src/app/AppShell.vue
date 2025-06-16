<script setup lang="ts">
const isSidebarVisible = useLocalStorage('markvim-sidebar-visible', true)

const { onDataReset } = useDataReset()
onDataReset(() => {
  isSidebarVisible.value = true
})
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
  getDocumentTitle,
} = useDocuments()

const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()
const { settings, toggleVimMode, toggleLineNumbers, togglePreviewSync } = useEditorSettings()
const { viewMode, isPreviewVisible, isSplitView, isEditorVisible, setViewMode } = useViewMode()

const previewSyncEnabled = computed(() => settings.value.previewSync && isSplitView.value)
const { editorScrollContainer, previewScrollContainer } = useSyncedScroll(previewSyncEnabled)

const activeMarkdown = computed({
  get: () => activeDocument.value?.content || '',
  set: (value: string) => {
    if (activeDocument.value) {
      updateDocument(activeDocument.value.id, value)
    }
  },
})

const { renderedMarkdown, shikiCSS } = useMarkdown(activeMarkdown)

const { deleteModalOpen, documentToDelete, handleDeleteDocument, confirmDeleteDocument, cancelDeleteDocument } = useDocumentDeletion()

function handleDeleteActiveDocument() {
  if (!activeDocument.value)
    return

  handleDeleteDocument(activeDocument.value.id, activeDocument.value.content)
}

const { registerShortcuts, registerAppCommand, formatKeys, setNewDocumentAction } = useShortcuts()

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
  const centerX = window.innerWidth / 2 - 200
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

function handleDocumentImported(document: any) {
  setActiveDocument(document.id)
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
  document.addEventListener('keydown', handleGlobalKeydown)

  // Register the create document action with the shortcuts system
  setNewDocumentAction(handleCreateDocument)

  // Register sequential shortcuts using createSequentialShortcut
  const { createSequentialShortcut } = useShortcuts()

  // Create g->t sequence shortcut for toggling sidebar
  createSequentialShortcut(['g', 't'], handleToggleSidebar)

  registerShortcuts([
    {
      keys: 'g t',
      description: 'Toggle sidebar',
      action: handleToggleSidebar,
      category: 'View',
      icon: 'lucide:panel-left',
    },
    {
      keys: '1',
      description: 'Switch to Editor only',
      action: () => { setViewMode('editor') },
      category: 'View',
      icon: 'lucide:edit-3',
    },
    {
      keys: '2',
      description: 'Switch to Split view',
      action: () => { setViewMode('split') },
      category: 'View',
      icon: 'lucide:columns-2',
    },
    {
      keys: '3',
      description: 'Switch to Preview only',
      action: () => { setViewMode('preview') },
      category: 'View',
      icon: 'lucide:eye',
    },
    {
      keys: 'meta+k',
      description: 'Open command palette',
      action: () => {
        openCommandPalette()
      },
      category: 'Navigation',
      icon: 'lucide:search',
    },
    {
      keys: 'meta+s',
      description: 'Save document',
      action: () => {
        handleSaveDocument()
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
      action: () => {
        handleToggleVimMode()
      },
      category: 'Settings',
      icon: 'lucide:terminal',
    },
    {
      keys: 'l',
      description: 'Toggle Line Numbers',
      action: () => {
        handleToggleLineNumbers()
      },
      category: 'Settings',
      icon: 'lucide:hash',
    },
    {
      keys: 'p',
      description: 'Toggle Preview Sync',
      action: () => {
        handleTogglePreviewSync()
      },
      category: 'Settings',
      icon: 'lucide:link-2',
    },
  ])

  // Register vim commands for command palette
  registerAppCommand({
    id: 'vim-new',
    keys: ':new',
    description: 'New Document (Vim)',
    action: () => {
      handleCreateDocument()
    },
    category: 'File',
    icon: '📄',
  })
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
  <div ref="containerRef" class="text-text-primary font-sans bg-background flex flex-col h-screen overflow-hidden">
    <HeaderToolbar
      :view-mode="viewMode"
      :is-mobile="isMobile"
      :is-sidebar-visible="isSidebarVisible"
      :active-document-title="activeDocumentTitle"
      :active-document="activeDocument"
      @update:view-mode="setViewMode"
      @toggle-sidebar="handleToggleSidebar"
      @delete-document="handleDeleteActiveDocument"
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
        @delete-document="handleDeleteActiveDocument"
      />

      <div class="bg-surface-primary/30 flex flex-1 flex-col overflow-hidden">
        <div
          class="flex flex-1 flex-col relative overflow-hidden md:flex-row" :class="[
            !isSplitView && !isMobile ? 'md:justify-center md:items-center' : '',
            isDragging ? 'select-none' : '',
          ]"
        >
          <div
            v-if="isEditorVisible"
            ref="editorScrollContainer"
            data-testid="editor-pane"
            class="w-full transition-all duration-300 ease-in-out" :class="[
              isSplitView ? 'md:border-r border-gray-800 border-b md:border-b-0' : '',
              isSplitView ? 'h-1/2 md:h-full' : 'h-full',
              !isSplitView && !isMobile ? 'md:max-w-6xl md:h-[90vh] md:rounded-lg md:border md:border-gray-800 md:shadow-2xl' : '',
              isDragging ? 'opacity-90' : '',
            ]"
            :style="{
              transform: isEditorVisible ? 'translateX(0)' : 'translateX(-100%)',
              width: isSplitView && !isMobile ? `${leftPaneWidth}%` : '100%',
            }"
          >
            <MarkdownEditor
              :model-value="activeMarkdown"
              :settings="settings"
              class="h-full"
              @update:model-value="activeMarkdown = $event || ''"
              @vim-mode-change="handleVimModeChange"
            />
          </div>

          <ResizableSplitter
            v-if="isSplitView"
            :is-dragging="isDragging"
            data-testid="resize-splitter"
            class="hidden md:block"
            @start-drag="startDrag"
          />

          <div
            v-if="isPreviewVisible"
            ref="previewScrollContainer"
            data-testid="preview-pane"
            class="w-full transition-all duration-300 ease-in-out overflow-hidden" :class="[
              isSplitView ? 'h-1/2 md:h-full' : 'h-full',
              !isSplitView && !isMobile ? 'md:max-w-6xl md:h-[90vh] md:rounded-lg md:border md:border-gray-800 md:shadow-2xl' : '',
              isDragging ? 'opacity-90' : '',
            ]"
            :style="{
              transform: isPreviewVisible ? 'translateX(0)' : 'translateX(100%)',
              width: isSplitView && !isMobile ? `${rightPaneWidth}%` : '100%',
            }"
          >
            <MarkdownPreview
              :rendered-html="renderedMarkdown"
              class="h-full"
            />
          </div>

          <div
            v-if="isDragging"
            class="bg-black/5 pointer-events-none transition-opacity duration-200 inset-0 fixed z-10"
          />
        </div>
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
      @change-view-mode="setViewMode"
      @save-document="handleSaveDocument"
      @insert-text="handleInsertText"
      @toggle-vim-mode="handleToggleVimMode"
      @toggle-line-numbers="handleToggleLineNumbers"
      @toggle-preview-sync="handleTogglePreviewSync"
      @toggle-settings="handleToggleSettings"
      @select-document="handleDocumentSelectFromPalette"
    />

    <DocumentDeleteModal
      v-model:open="deleteModalOpen"
      :document-title="documentToDelete?.title || ''"
      @confirm="confirmDeleteDocument"
      @cancel="cancelDeleteDocument"
      @close="cancelDeleteDocument"
    />

    <ShareManager @document-imported="handleDocumentImported" />
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
  background-color: var(--background) !important;
  color: var(--foreground) !important;
  border: none !important;
  outline: none !important;
  font-family: var(--font-family-mono) !important;
  font-size: var(--font-size-base) !important;
  font-feature-settings: 'liga' 1, 'calt' 1 !important;
  font-variant-ligatures: contextual !important;
}

.cm-editor .cm-scroller {
  color: var(--foreground) !important;
  font-size: var(--font-size-base) !important;
}

.cm-editor.cm-focused {
  outline: none !important;
  border-left-color: var(--accent) !important;
}

.cm-activeLine {
  background-color: color-mix(in oklch, var(--accent) 15%, var(--background)) !important;
}

.cm-gutters {
  background-color: var(--background) !important;
  border-right: 1px solid var(--border) !important;
  color: var(--foreground) !important;
  opacity: 0.5;
}

.cm-lineNumbers .cm-gutterElement {
  color: var(--foreground) !important;
  opacity: 0.5;
  font-size: var(--font-size-sm) !important;
}

.cm-activeLineGutter {
  color: var(--foreground) !important;
  opacity: 0.8;
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
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Enhanced markdown styling */
:deep(.cm-header-1) { font-size: 1.25em !important; color: var(--foreground) !important; font-weight: 600 !important; }
:deep(.cm-header-2) { font-size: 1.15em !important; color: var(--foreground) !important; font-weight: 600 !important; }

:deep(.cm-strong) { font-weight: 600 !important; color: var(--foreground) !important; }

:deep(.cm-strikethrough) { color: var(--foreground) !important; opacity: 0.6; text-decoration: line-through !important; }

:deep(.cm-inline-code) {
  background: color-mix(in oklch, var(--accent) 10%, var(--background)) !important;
  color: var(--accent) !important;
  padding: 0.125rem 0.25rem !important;
  border-radius: 0.25rem !important;
  font-family: 'Fira Code', monospace !important;
}

:deep(.cm-link), :deep(.cm-url) { color: var(--accent) !important; text-decoration: none !important; }

:deep(.cm-blockquote) {
  color: var(--foreground) !important;
  opacity: 0.8;
  border-left: 3px solid color-mix(in oklch, var(--accent) 30%, transparent) !important;
  padding-left: 1rem !important;
  margin-left: 0 !important;
}

:deep(.cm-meta) { color: var(--foreground) !important; opacity: 0.6; }
:deep(.cm-hr) { color: var(--border) !important; }

/* Focus styles */
:deep(.cm-focused) {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
</style>
