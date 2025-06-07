<script setup lang="ts">
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

const markdown = ref(`# Welcome to MarkVim

Start writing your **markdown** here.

## Features

- Real-time preview
- Syntax highlighting
- Linear-inspired dark theme
- Clean, modern interface

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote with some **important** information.

- [ ] Todo item
- [x] Completed item
- [ ] Another todo

Visit [Linear](https://linear.app) for inspiration.`)

const renderedMarkdown = computed(() => {
  return md.render(markdown.value)
})
</script>

<template>
  <div class="h-screen flex bg-[#0d1117] text-gray-100">
    <MarkdownEditor v-model="markdown" />
    <MarkdownPreview :rendered-html="renderedMarkdown" />
  </div>
</template>

<style>
/* Linear-style scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0d1117;
}

::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}

/* CodeMirror dark theme adjustments */
.cm-editor {
  background-color: #0d1117 !important;
  color: #e6edf3 !important;
  border: none !important;
}

.cm-focused {
  outline: none !important;
}

.cm-content {
  padding: 2rem !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
}

.cm-placeholder {
  color: #7d8590 !important;
}

.cm-cursor {
  border-left-color: #f0f6fc !important;
}

.cm-selectionBackground {
  background-color: #264f78 !important;
}
</style>

