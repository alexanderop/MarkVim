<script setup lang="ts">
import { markdown as markdownLang } from '@codemirror/lang-markdown'

const { settings } = defineProps<{
  settings: EditorSettings
}>()

const emit = defineEmits<{
  vimModeChange: [mode: string, subMode?: string]
}>()

const modelValue = defineModel<string>()

function getCurrentTheme() {
  if (!import.meta.client) {
    return settings.theme === 'auto' ? 'dark' : settings.theme
  }

  if (settings.theme === 'auto') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }
  return settings.theme
}

const currentTheme = ref(getCurrentTheme())

onMounted(() => {
  currentTheme.value = getCurrentTheme()

  const themeWatcher = new MutationObserver(() => {
    const newTheme = getCurrentTheme()
    if (newTheme !== currentTheme.value) {
      currentTheme.value = newTheme
    }
  })

  themeWatcher.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  onUnmounted(() => {
    themeWatcher.disconnect()
  })
})

watch(() => settings.theme, () => {
  const newTheme = getCurrentTheme()
  if (newTheme !== currentTheme.value) {
    currentTheme.value = newTheme
  }
}, { immediate: true })
</script>

<template>
  <div class="bg-surface-primary flex flex-col h-screen w-full">
    <!-- Header -->
    <div class="px-6 border-b border-border bg-surface-primary flex flex-shrink-0 h-10 items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-1.5">
          <div class="rounded-full bg-window-close h-3 w-3 shadow-sm" />
          <div class="rounded-full bg-window-minimize h-3 w-3 shadow-sm" />
          <div class="rounded-full bg-window-maximize h-3 w-3 shadow-sm" />
        </div>
        <div class="bg-border h-4 w-px" />
        <Icon name="lucide:edit-3" class="text-text-primary h-4 w-4" />
      </div>
      <div class="flex items-center space-x-3" />
    </div>

    <!-- Editor container -->
    <div class="flex-1 min-h-0">
      <MyCodeMirror
        :key="`editor-${currentTheme}`"
        v-model="modelValue"
        :extensions="[markdownLang()]"
        :theme="currentTheme"
        placeholder="# Start writing your story..."
        class="bg-surface-primary h-full"
        :vim-mode="settings.vimMode"
        :line-numbers="settings.lineNumbers"
        :line-number-mode="settings.lineNumberMode"
        :line-wrapping="settings.lineWrapping"
        :font-size="settings.fontSize"
        :style="{
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontFamily === 'mono' ? 'var(--font-mono)' : 'var(--font-sans)',
        }"
        @vim-mode-change="(mode, subMode) => emit('vimModeChange', mode, subMode)"
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
