<template>
  <div class="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-editor-border">
    <div class="flex flex-col">
      <h3 class="text-text-primary font-medium">Vim Mode</h3>
      <p class="text-text-secondary text-sm">Enable vim keybindings for the editor</p>
    </div>
    
    <button
      :class="[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-editor-active focus:ring-offset-2 focus:ring-offset-surface-primary',
        settings.vimMode ? 'bg-editor-active' : 'bg-gray-600'
      ]"
      role="switch"
      :aria-checked="settings.vimMode"
      @click="toggleVimMode"
    >
      <span
        :class="[
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          settings.vimMode ? 'translate-x-6' : 'translate-x-1'
        ]"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
const { settings, toggleVimMode } = useEditorSettings()
</script> 