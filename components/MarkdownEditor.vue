<script setup lang="ts">
import { markdown as markdownLang } from '@codemirror/lang-markdown'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="w-1/2 border-r border-[#1d1f23] bg-[#0c0d11]">
    <!-- Linear-style header -->
    <div class="h-14 bg-[#0c0d11] border-b border-[#1d1f23] flex items-center justify-between px-6">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-1.5">
          <div class="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm"/>
          <div class="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"/>
          <div class="w-3 h-3 rounded-full bg-[#28ca42] shadow-sm"/>
        </div>
        <div class="w-px h-4 bg-[#1d1f23]"></div>
        <span class="text-sm font-medium text-[#9ca3af] tracking-tight">Editor</span>
      </div>
      <div class="flex items-center space-x-3">
        <div class="text-xs text-[#6c7383] font-mono">Markdown</div>
      </div>
    </div>
    
    <!-- Editor container -->
    <MyCodeMirror
      :model-value="props.modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      :extensions="[markdownLang()]"
      theme="dark"
      placeholder="# Start writing your story..."
      class="h-[calc(100vh-3.5rem)] bg-[#0c0d11]"
      vim-mode
    />
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