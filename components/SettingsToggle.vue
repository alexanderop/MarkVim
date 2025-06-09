<script setup lang="ts">
import { useEditorSettings } from '#imports'

const { settings, toggleVimMode } = useEditorSettings()
</script>

<template>
  <div class="p-4 border border-editor-border rounded-lg bg-surface-secondary flex items-center justify-between">
    <div class="flex flex-col">
      <h3 class="text-text-primary font-medium">
        Vim Mode
      </h3>
      <p class="text-sm text-text-secondary">
        Enable vim keybindings for the editor
      </p>
    </div>

    <button
      class="rounded-full inline-flex h-6 w-11 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-editor-active focus:ring-offset-surface-primary focus:ring-offset-2" :class="[
        settings.vimMode ? 'bg-editor-active' : 'bg-surface-tertiary',
      ]"
      role="switch"
      :aria-checked="settings.vimMode"
      @click="toggleVimMode"
    >
      <span
        class="rounded-full bg-white h-4 w-4 inline-block transform transition-transform" :class="[
          settings.vimMode ? 'translate-x-6' : 'translate-x-1',
        ]"
      />
    </button>
  </div>
</template>
