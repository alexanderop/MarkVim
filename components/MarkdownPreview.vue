<script setup lang="ts">
const { renderedHtml } = defineProps<{
  renderedHtml: string
}>()
</script>

<template>
  <div class="flex flex-col bg-[#0c0d11] h-screen w-full">
    <div class="h-14 bg-[#0c0d11] border-b border-[#1d1f23] flex items-center justify-between px-6 flex-shrink-0">
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-[#9ca3af] tracking-tight">Preview</span>
        <div class="w-px h-4 bg-[#1d1f23]"></div>
        <div class="text-xs text-[#6c7383] font-mono">Rendered</div>
      </div>
    </div>
    
    <div class="flex-1 overflow-auto bg-[#0c0d11] min-h-0">
      <div class="max-w-none mx-auto px-12 py-12">
        <article class="prose prose-lg prose-invert prose-gray max-w-none" v-html="renderedHtml"/>
      </div>
    </div>
  </div>
</template>