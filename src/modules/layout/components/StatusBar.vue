<script setup lang="ts">
import { useVimMode } from '~/modules/editor/api'
import { useShortcuts } from '~/modules/shortcuts/api'

const { lineCount, characterCount, showVimMode } = defineProps<{
  lineCount: number
  characterCount: number
  showVimMode?: boolean
}>()

const { currentVimMode } = useVimMode()
const { formatKeys } = useShortcuts()
</script>

<template>
  <footer
    data-testid="status-bar"
    class="px-4 border-t border-border bg-surface-primary/90 flex h-8 items-center justify-between backdrop-blur-xl"
  >
    <div class="text-xs text-text-secondary flex gap-4 items-center">
      <div
        v-if="showVimMode && currentVimMode"
        class="flex gap-1 items-center"
      >
        <span class="text-accent font-medium font-mono">{{ currentVimMode }}</span>
      </div>
      <div
        v-if="showVimMode && currentVimMode"
        class="bg-border h-3 w-px"
      />
      <div class="flex gap-1 items-center">
        <span class="tabular-nums">{{ lineCount }}</span>
        <span>lines</span>
      </div>
      <div class="bg-border h-3 w-px" />
      <div class="flex gap-1 items-center">
        <span class="tabular-nums">{{ characterCount }}</span>
        <span>characters</span>
      </div>
    </div>

    <div class="text-xs text-text-secondary gap-4 hidden items-center md:flex">
      <div class="flex gap-3 items-center">
        <kbd class="text-xs text-text-muted font-mono px-1.5 py-0.5 border border-border rounded bg-surface-primary">
          {{ formatKeys('1') }}
        </kbd>
        <span>Editor</span>
      </div>
      <div class="flex gap-3 items-center">
        <kbd class="text-xs text-text-muted font-mono px-1.5 py-0.5 border border-border rounded bg-surface-primary">
          {{ formatKeys('2') }}
        </kbd>
        <span>Split</span>
      </div>
      <div class="flex gap-3 items-center">
        <kbd class="text-xs text-text-muted font-mono px-1.5 py-0.5 border border-border rounded bg-surface-primary">
          {{ formatKeys('3') }}
        </kbd>
        <span>Preview</span>
      </div>
      <div class="bg-border h-3 w-px" />
      <div class="flex gap-3 items-center">
        <kbd class="text-xs text-text-muted font-mono px-1.5 py-0.5 border border-border rounded bg-surface-primary">
          {{ formatKeys('⌘K') }}
        </kbd>
        <span>Commands</span>
      </div>
    </div>
  </footer>
</template>
