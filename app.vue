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

---

*Tip: The \`jj\` mapping works just like in your .vimrc - press both j's quickly together.*`

const { markdown, renderedMarkdown, shikiCSS } = useMarkdown(initialMarkdown)
const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()
const { settings } = useEditorSettings()

useHead({
  style: [
    {
      innerHTML: shikiCSS
    }
  ]
})
</script>

<template>
  <div ref="containerRef" class="h-screen flex bg-editor-bg text-gray-100 font-sans relative">
    <!-- Settings Modal - positioned absolutely in top-right -->
    <div class="absolute top-4 right-4 z-50">
      <SettingsModal />
    </div>
    
    <MarkdownEditor 
      v-model="markdown" 
      :style="{ width: `${leftPaneWidth}%` }"
      :settings="settings"
    />
    
    <ResizableSplitter 
      :is-dragging="isDragging"
      @start-drag="startDrag"
    />
    
    <MarkdownPreview 
      :rendered-html="renderedMarkdown"
      :style="{ width: `${rightPaneWidth}%` }"
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

