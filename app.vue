<script setup lang="ts">
const initialMarkdown = `# Welcome to MarkVim

MarkVim is a markdown editor with full Vim modal editing support and custom keybindings.

## 🚀 Custom Vim Keybindings

When **Custom Vim Keybindings** is enabled in settings, you get these additional shortcuts:

### Insert Mode Shortcuts
- \`jj\` → **Escape** (quickly return to normal mode)
- \`kk\` → **Escape** (alternative escape shortcut)

### Normal Mode Enhancements  
- \`Y\` → **y$** (yank to end of line, consistent with D and C)

### Ex Commands
- \`:w\` or \`:write\` → **Save** (shows console message)

## How to Use

1. **Open Settings** (⚙️ button in top-right)
2. **Enable Vim Mode** if not already enabled  
3. **Enable "Custom Vim Keybindings"**
4. **Click in this editor** to focus it
5. **Press \`i\`** to enter insert mode
6. **Type some text** then quickly press \`jj\`
7. **You should return to normal mode** instantly!

## Standard Vim Features

All standard Vim motions and operators work:

### Navigation
- \`h j k l\` → Move cursor
- \`w b e\` → Word motions  
- \`0 $\` → Line start/end
- \`gg G\` → File start/end

### Editing
- \`i a o O\` → Insert modes
- \`d y c\` → Delete, yank, change
- \`u Ctrl-r\` → Undo/redo
- \`.\` → Repeat last command

### Visual Mode
- \`v V Ctrl-v\` → Character/line/block selection

## 📝 **Test Area**

Click here and test your \`jj\` mapping:

\`\`\`javascript
// Test your jj mapping here!
// 1. Press 'i' to enter insert mode
// 2. Type some code like this comment
// 3. Press 'jj' quickly to escape to normal mode
console.log("Testing jj -> Escape mapping");

function testVimMapping() {
  // Try editing this function and using jj to escape
  return "jj should work perfectly!";
}
\`\`\`

**Perfect test sequence:**
1. **i** → enter insert mode
2. **Hello World** → type some text
3. **jj** → should escape to normal mode instantly
4. **$** → move to end of line (confirms you're in normal mode)
5. **a** → enter insert mode at end
6. **!** → add exclamation
7. **jj** → escape again

Happy writing with Vim! ✨

## 🎨 Mermaid Diagrams

MarkVim now supports beautiful Mermaid diagrams! Here are some examples:

### Flowchart Example
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant E as Editor
    participant P as Preview
    participant M as Mermaid
    
    E->>P: Save markdown
    P->>M: Process diagram
    M-->>P: Render SVG
    P->>P: Display result
\`\`\`

### Git Flow
\`\`\`mermaid
gitgraph
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature
    commit
\`\`\`

---

*Tip: The \`jj\` mapping works just like in your .vimrc - press both j's quickly together.*`

const viewMode = ref<'split' | 'editor' | 'preview'>('split')

const { markdown, renderedMarkdown, shikiCSS } = useMarkdown(initialMarkdown)
const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()
const { settings, toggleVimMode, toggleLineNumbers } = useEditorSettings()
const isPreviewVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'preview')
const isSplitView = computed(() => viewMode.value === 'split')
const isEditorVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'editor')

// Command palette state
const commandPaletteOpen = ref(false)
const commandPalettePosition = ref({ x: 0, y: 0 })

const { registerShortcuts, formatKeys } = useShortcuts()

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

function openCommandPalette(event?: KeyboardEvent) {
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
  // Create a blob and download the file
  const blob = new Blob([markdown.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `markvim-document-${new Date().toISOString().split('T')[0]}.md`
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('Document saved!')
}

function handleInsertText(text: string) {
  // For now, we'll append to the markdown - this could be improved with cursor position
  markdown.value += text
}

function handleToggleVimMode() {
  toggleVimMode()
}

function handleToggleLineNumbers() {
  toggleLineNumbers()
}

function handleToggleSettings() {
  // This would open the settings modal - for now, just log
  console.log('Settings toggled')
}

onMounted(() => {
  // Add global event listener
  document.addEventListener('keydown', handleGlobalKeydown)
  
  registerShortcuts([
    {
      keys: '1',
      description: 'Switch to Editor only',
      action: () => { viewMode.value = 'editor' },
      category: 'View'
    },
    {
      keys: '2', 
      description: 'Switch to Split view',
      action: () => { viewMode.value = 'split' },
      category: 'View'
    },
    {
      keys: '3',
      description: 'Switch to Preview only', 
      action: () => { viewMode.value = 'preview' },
      category: 'View'
    },
    
    // Editor shortcuts (Linear-inspired)
    {
      keys: 'meta+k',
      description: 'Open command palette',
      action: () => {
        openCommandPalette()
      },
      category: 'Navigation'
    },
    {
      keys: 'meta+s',
      description: 'Save document',
      action: () => {
        // TODO: Implement save functionality
        console.log('Document saved')
      },
      category: 'File'
    },
  ])
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

useHead({
  style: [
    {
      innerHTML: shikiCSS
    }
  ]
})
</script>

<template>
  <div ref="containerRef" class="h-screen flex flex-col bg-editor-bg text-gray-100 font-sans">
    <!-- Linear-inspired toolbar -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
      <div class="flex items-center space-x-4">
        <h1 class="text-lg font-semibold text-white">MarkVim</h1>
        
        <!-- Linear-style view mode toggle -->
        <div class="flex items-center bg-gray-800 rounded-lg p-1">
          <button
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              viewMode === 'editor' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            ]"
            title="Editor only (⌘1)"
            @click="viewMode = 'editor'"
          >
            <Icon name="lucide:edit-3" class="w-4 h-4 mr-1.5" />
            Editor
          </button>
          
          <button
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              viewMode === 'split' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            ]"
            title="Split view (⌘2)"
            @click="viewMode = 'split'"
          >
            <Icon name="lucide:columns-2" class="w-4 h-4 mr-1.5" />
            Split
          </button>
          
          <button
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              viewMode === 'preview' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            ]"
            title="Preview only (⌘3)"
            @click="viewMode = 'preview'"
          >
            <Icon name="lucide:eye" class="w-4 h-4 mr-1.5" />
            Preview
          </button>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="flex items-center space-x-2">
        <ShortcutsModal />
        <SettingsModal />
      </div>
    </div>
    
    <!-- Main content area with responsive layout -->
    <div class="flex-1 flex relative overflow-hidden">
      <!-- Editor pane -->
      <div 
        v-if="isEditorVisible"
        :class="[
          'transition-all duration-300 ease-in-out',
          isSplitView ? 'border-r border-gray-800' : ''
        ]"
        :style="{ 
          width: isSplitView ? `${leftPaneWidth}%` : '100%',
          transform: isEditorVisible ? 'translateX(0)' : 'translateX(-100%)'
        }"
      >
        <MarkdownEditor 
          v-model="markdown" 
          :settings="settings"
          class="h-full"
        />
      </div>
      
      <!-- Resizable splitter - only show in split mode -->
      <ResizableSplitter 
        v-if="isSplitView"
        :is-dragging="isDragging"
        @start-drag="startDrag"
      />
      
      <!-- Preview pane -->
      <div 
        v-if="isPreviewVisible"
        :class="[
          'transition-all duration-300 ease-in-out overflow-hidden'
        ]"
        :style="{ 
          width: isSplitView ? `${rightPaneWidth}%` : '100%',
          transform: isPreviewVisible ? 'translateX(0)' : 'translateX(100%)'
        }"
      >
        <MarkdownPreview 
          :rendered-html="renderedMarkdown"
          class="h-full"
        />
      </div>
    </div>
    
    <!-- Linear-style status bar with keyboard shortcuts hint -->
    <div class="px-6 py-2 border-t border-gray-800 bg-gray-900/30 backdrop-blur">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>{{ markdown.split('\n').length }} lines • {{ markdown.length }} characters</span>
        <div class="flex items-center space-x-4">
          <span>{{ formatKeys('1') }} Editor</span>
          <span>{{ formatKeys('2') }} Split</span>
          <span>{{ formatKeys('3') }} Preview</span>
          <span>{{ formatKeys('meta+k') }} Commands</span>
          <span>{{ formatKeys('shift+/') }} Help</span>
        </div>
      </div>
    </div>

    <!-- Global command palette -->
    <CommandPalette 
      v-model:open="commandPaletteOpen"
      :position="commandPalettePosition"
      :view-mode="viewMode"
      :markdown="markdown"
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
/* Linear-style scrollbar */
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

/* Custom CodeMirror theme for Linear-style markdown highlighting */
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

/* Headings with Linear-style colors */
.cm-header {
  font-weight: 600 !important;
}

.cm-header.cm-header-1 {
  color: #ffffff !important;
  font-size: 1.875rem !important;
  font-weight: 700 !important;
}

.cm-header.cm-header-2 {
  color: #e6edf3 !important;
  font-size: 1.5rem !important;
  font-weight: 600 !important;
}

.cm-header.cm-header-3 {
  color: #d2d9e0 !important;
  font-size: 1.25rem !important;
  font-weight: 600 !important;
}

.cm-header.cm-header-4,
.cm-header.cm-header-5,
.cm-header.cm-header-6 {
  color: #c9d1d9 !important;
  font-weight: 600 !important;
}

/* Markdown tokens */
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

/* Code blocks */
.cm-meta {
  color: #8b949e !important;
}

/* Active line highlighting */
.cm-activeLine {
  background-color: rgba(110, 118, 129, 0.05) !important;
}

.cm-activeLineGutter {
  background-color: rgba(110, 118, 129, 0.05) !important;
}

/* Line numbers if enabled */
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

