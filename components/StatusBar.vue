<script setup lang="ts">
interface Props {
  lineCount: number
  characterCount: number
  formatKeys: (keys: string) => string
}

defineProps<Props>()
</script>

<template>
  <div class="px-3 py-2 border-t border-gray-800 bg-gray-900/30 backdrop-blur md:px-6">
    <div class="text-xs text-gray-500 flex items-center justify-between">
      <span class="truncate">{{ lineCount }} lines<span class="hidden sm:inline"> • {{ characterCount }} characters</span></span>
      <div class="hidden items-center space-x-4 md:flex">
        <span>{{ formatKeys('1') }} Editor</span>
        <span>{{ formatKeys('2') }} Split</span>
        <span>{{ formatKeys('3') }} Preview</span>
        <span>{{ formatKeys('meta+k') }} Commands</span>
        <span>{{ formatKeys('shift+/') }} Help</span>
      </div>
    </div>
  </div>
</template>
