<script setup lang="ts">
const { renderedHtml } = defineProps<{
  renderedHtml: string
}>()
</script>

<template>
  <div class="flex flex-col bg-editor-bg h-screen w-full">
    <div class="h-14 bg-editor-bg border-b border-editor-border flex items-center justify-between px-6 flex-shrink-0">
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-text-primary tracking-tight">Preview</span>
        <div class="w-px h-4 bg-editor-divider"></div>
        <div class="text-xs text-text-secondary font-mono">Rendered</div>
      </div>
    </div>
    
    <div class="flex-1 overflow-auto bg-editor-bg min-h-0">
      <div class="max-w-none mx-auto px-12 py-12">
        <article class="prose prose-lg prose-invert prose-gray max-w-none" v-html="renderedHtml"/>
      </div>
    </div>
  </div>
</template>