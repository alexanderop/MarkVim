<script setup lang="ts">
import type { EditorSettings } from '~/modules/editor/api'
import { markdown as markdownLang } from '@codemirror/lang-markdown'
import { useMediaQuery } from '@vueuse/core'
import { useVimMode } from '~/modules/editor/api'
import EditorMyCodeMirror from './MyCodeMirror.vue'

const { content, settings } = defineProps<{
  content: string
  settings: EditorSettings
}>()

const emit = defineEmits<{
  'update:content': [value: string]
}>()

const isMobile = useMediaQuery('(max-width: 768px)')

const { handleVimModeChange } = useVimMode()

function handleContentUpdate(value: string) {
  emit('update:content', value)
}
</script>

<template>
  <div class="bg-surface-primary flex flex-col h-full w-full">
    <!-- Header -->
    <div class="px-3 md:px-6 border-b border-border bg-surface-primary flex flex-shrink-0 h-10 items-center justify-between">
      <div class="flex items-center space-x-2 md:space-x-4">
        <div class="hidden md:flex items-center space-x-1.5">
          <div class="rounded-full bg-window-close h-3 w-3 shadow-sm" />
          <div class="rounded-full bg-window-minimize h-3 w-3 shadow-sm" />
          <div class="rounded-full bg-window-maximize h-3 w-3 shadow-sm" />
        </div>
        <div class="bg-border h-4 w-px hidden md:block" />
        <Icon
          name="lucide:edit-3"
          class="text-text-primary h-4 w-4"
        />
      </div>
      <div class="flex items-center space-x-3" />
    </div>

    <!-- Editor container -->
    <div class="flex-1 min-h-0">
      <EditorMyCodeMirror
        :key="`editor-${'dark'}`"
        :model-value="content"
        :extensions="[markdownLang()]"
        theme="dark"
        placeholder="# Start writing your story..."
        class="bg-surface-primary h-full"
        :vim-mode="settings.vimMode"
        :line-numbers="settings.lineNumbers"
        :line-number-mode="settings.lineNumberMode"
        :line-wrapping="settings.lineWrapping"
        :font-size="isMobile ? Math.max(16, settings.fontSize) : settings.fontSize"
        :style="{
          fontFamily: settings.fontFamily === 'mono' ? 'var(--font-family-mono)' : 'var(--font-family-sans)',
        }"
        @update:model-value="handleContentUpdate"
        @vim-mode-change="handleVimModeChange"
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

:deep(.cm-selectionBackground) {
  background-color: var(--cm-selection-background) !important;
}

:deep(.cm-focused .cm-selectionBackground) {
  background-color: var(--cm-selection-background) !important;
}

:deep(.cm-editor.cm-focused .cm-selectionLayer .cm-selectionBackground) {
  background: var(--cm-selection-background) !important;
}

:deep(.cm-selectionMatch) {
  background-color: var(--cm-selection-background) !important;
}
</style>
