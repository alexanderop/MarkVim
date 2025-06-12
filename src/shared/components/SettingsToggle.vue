<script setup lang="ts">
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

    <BaseButton
      variant="ghost"
      class="rounded-full h-6 w-11 p-0 focus:ring-editor-active focus:ring-offset-surface-primary"
      :class="[
        settings.vimMode ? 'bg-editor-active' : 'bg-gray-600',
      ]"
      role="switch"
      :aria-checked="settings.vimMode"
      @click="toggleVimMode"
    >
      <span
        class="rounded-full bg-white h-4 w-4 inline-block transform transition-transform"
        :class="[
          settings.vimMode ? 'translate-x-6' : 'translate-x-1',
        ]"
      />
    </BaseButton>
  </div>
</template>
