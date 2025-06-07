<script setup lang="ts">
const initialMarkdown = `# Welcome to MarkVim

Start writing your **markdown** here.

## Features

- Real-time preview
- Syntax highlighting with Shiki
- Linear-inspired dark theme
- Clean, modern interface

### Code Examples

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Array methods are highlighted properly
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);
\`\`\`

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}
\`\`\`

\`\`\`css
.button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px 24px;
  transition: transform 0.2s ease;
}

.button:hover {
  transform: translateY(-2px);
}
\`\`\`

> This is a blockquote with some **important** information.

- [ ] Todo item
- [x] Completed item
- [ ] Another todo

Visit [Linear](https://linear.app) for inspiration.`

const { markdown, renderedMarkdown, shikiCSS } = useMarkdown(initialMarkdown)
const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()

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
    <MarkdownEditor 
      v-model="markdown" 
      :style="{ width: `${leftPaneWidth}%` }"
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

