<script setup lang="ts">
import { markdown as markdownLang } from '@codemirror/lang-markdown'

const modelValue = defineModel<string>()
</script>

<template>
  <div class="bg-editor-bg flex flex-col h-screen w-full">
    <!-- Header-->
    <div class="h-14 bg-editor-bg border-b border-editor-border flex items-center justify-between px-6 flex-shrink-0">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-1.5">
          <div class="w-3 h-3 rounded-full bg-window-close shadow-sm"/>
          <div class="w-3 h-3 rounded-full bg-window-minimize shadow-sm"/>
          <div class="w-3 h-3 rounded-full bg-window-maximize shadow-sm"/>
        </div>
        <div class="w-px h-4 bg-editor-divider"></div>
        <span class="text-sm font-medium text-text-primary tracking-tight">Editor</span>
      </div>
      <div class="flex items-center space-x-3">
        <div class="text-xs text-text-secondary font-mono">Markdown</div>
      </div>
    </div>
    
    <!-- Editor container -->
    <div class="flex-1 min-h-0">
      <MyCodeMirror
        v-model="modelValue"
        :extensions="[markdownLang()]"
        theme="dark"
        placeholder="# Start writing your story..."
        class="h-full bg-editor-bg"
        vim-mode
      />
    </div>
  </div>
</template>

<style scoped>
/* Additional editor-specific styling */
:deep(.cm-editor) {
  border-radius: 0;
}

:deep(.cm-content) {
  padding: 48px 32px !important;
  max-width: none;
}

/* Custom markdown styling for editor */
:deep(.cm-line) {
  padding: 0;
}

/* Improved focus states */
:deep(.cm-focused) {
  outline: none;
}
</style> 