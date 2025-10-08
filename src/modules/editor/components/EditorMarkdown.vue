<script setup lang="ts">
import type { EditorSettings } from '@modules/editor'
import EditorMarkdownClient from './EditorMarkdown.client.vue'
import EditorMarkdownSkeleton from './EditorMarkdownSkeleton.vue'

const { content, settings } = defineProps<{
  content: string
  settings: EditorSettings
}>()

const emit = defineEmits<{
  'update:content': [value: string]
}>()
</script>

<template>
  <ClientOnly>
    <EditorMarkdownClient
      v-bind="$attrs"
      :content="content"
      :settings="settings"
      @update:content="emit('update:content', $event)"
    />
    <template #fallback>
      <EditorMarkdownSkeleton v-bind="$attrs" />
    </template>
  </ClientOnly>
</template>
