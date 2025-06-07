<template>
  <div class="h-screen flex bg-[#0d1117] text-gray-100">
    <!-- Markdown Editor -->
    <div class="w-1/2 border-r border-gray-800/50">
      <div class="h-12 bg-[#161b22] border-b border-gray-800/50 flex items-center px-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-red-500"/>
          <div class="w-3 h-3 rounded-full bg-yellow-500"/>
          <div class="w-3 h-3 rounded-full bg-green-500"/>
        </div>
        <div class="flex-1 text-center">
          <span class="text-sm font-medium text-gray-400">Editor</span>
        </div>
      </div>
      <MyCodeMirror
        v-model="markdown"
        :extensions="[markdownLang()]"
        theme="dark"
        placeholder="# Start writing markdown..."
        class="h-[calc(100vh-3rem)] bg-[#0d1117]"
        vim-mode
      />
    </div>

    <!-- Preview -->
    <div class="w-1/2 flex flex-col">
      <div class="h-12 bg-[#161b22] border-b border-gray-800/50 flex items-center px-4">
        <div class="flex-1 text-center">
          <span class="text-sm font-medium text-gray-400">Preview</span>
        </div>
      </div>
      <div class="flex-1 overflow-auto bg-[#0d1117]">
        <div class="p-8">
          <div class="prose prose-invert prose-purple max-w-none" v-html="renderedMarkdown"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { markdown as markdownLang } from '@codemirror/lang-markdown'
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

<style>
/* Linear-inspired Dark Theme */
.prose-invert {
  color: #e6edf3;
  line-height: 1.7;
}

.prose-invert h1, 
.prose-invert h2, 
.prose-invert h3, 
.prose-invert h4, 
.prose-invert h5, 
.prose-invert h6 {
  color: #f0f6fc;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.prose-invert h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #f0f6fc 0%, #c9d1d9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.prose-invert h2 {
  font-size: 1.875rem;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: #f0f6fc;
}

.prose-invert h3 {
  font-size: 1.5rem;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #e6edf3;
}

.prose-invert p {
  margin-bottom: 1.5rem;
  color: #c9d1d9;
}

.prose-invert code {
  background: #21262d;
  color: #f85149;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  border: 1px solid #30363d;
}

.prose-invert pre {
  background: #161b22;
  border: 1px solid #30363d;
  padding: 1.5rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 2rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.prose-invert pre code {
  background: transparent;
  color: #e6edf3;
  padding: 0;
  border: none;
  font-size: 0.875rem;
}

.prose-invert blockquote {
  border-left: 4px solid #7c3aed;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%);
  padding: 1rem 1.5rem;
  margin: 2rem 0;
  border-radius: 0.5rem;
  color: #c9d1d9;
  position: relative;
}

.prose-invert blockquote::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%);
  border-radius: 0.5rem;
  pointer-events: none;
}

.prose-invert ul, 
.prose-invert ol {
  margin: 1.5rem 0;
  padding-left: 1.5rem;
  color: #c9d1d9;
}

.prose-invert li {
  margin-bottom: 0.5rem;
}

.prose-invert li input[type="checkbox"] {
  margin-right: 0.5rem;
  accent-color: #7c3aed;
}

.prose-invert a {
  color: #79c0ff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.prose-invert a:hover {
  border-bottom-color: #79c0ff;
}

.prose-invert strong {
  color: #f0f6fc;
  font-weight: 600;
}

.prose-invert em {
  color: #e6edf3;
  font-style: italic;
}

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

