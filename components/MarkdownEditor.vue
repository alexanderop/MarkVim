<script setup lang="ts">
import { markdown as markdownLang } from '@codemirror/lang-markdown'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="w-1/2 border-r border-gray-800/50">
    <div class="h-12 bg-[#161b22] border-b border-gray-800/50 flex items-center px-4">
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full bg-red-500"/>
        <div class="w-3 h-3 rounded-full bg-yellow-500"/>
        <div class="w-3 h-3 rounded-full bg-green-500"/>
      </div>
      <div class="flex-1 text-center">
        <span class="text-sm font-medium text-gray-400">Editor</span>
      </div>
    </div>
    <MyCodeMirror
      :model-value="props.modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      :extensions="[markdownLang()]"
      theme="dark"
      placeholder="# Start writing markdown..."
      class="h-[calc(100vh-3rem)] bg-[#0d1117]"
      vim-mode
    />
  </div>
</template> 