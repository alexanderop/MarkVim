<script setup lang="ts">
import { UButton, UCard } from '#components'
import { useEditorSettings } from '@modules/editor'

const { settings, toggleVimMode } = useEditorSettings()
</script>

<template>
  <UCard
    variant="outline"
    :ui="{ root: 'bg-surface-primary', body: 'p-4 flex items-center justify-between' }"
  >
    <div class="flex flex-col">
      <h3 class="text-text-primary font-medium">
        Vim Mode
      </h3>
      <p class="text-sm text-text-secondary">
        Enable vim keybindings for the editor
      </p>
    </div>

    <UButton
      color="neutral"
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
    </UButton>
  </UCard>
</template>
