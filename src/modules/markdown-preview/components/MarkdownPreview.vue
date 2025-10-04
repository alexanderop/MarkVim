<script setup lang="ts">
import MarkdownPreviewClient from './MarkdownPreview.client.vue'
import MarkdownPreviewSkeleton from './MarkdownPreviewSkeleton.vue'

const { content } = defineProps<{
  content: string
}>()
</script>

<template>
  <ClientOnly>
    <MarkdownPreviewClient
      v-bind="$attrs"
      :content="content"
    />
    <template #fallback>
      <MarkdownPreviewSkeleton v-bind="$attrs" />
    </template>
  </ClientOnly>
</template>
