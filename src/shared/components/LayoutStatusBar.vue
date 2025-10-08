<script setup lang="ts">
import { UKbd } from '#components'
import { useVimMode } from '@modules/editor'
import { useShortcuts } from '@modules/shortcuts'

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
        <UKbd
          size="sm"
          color="neutral"
          class="font-mono text-text-muted"
        >
          {{ formatKeys('1') }}
        </UKbd>
        <span>Editor</span>
      </div>
      <div class="flex gap-3 items-center">
        <UKbd
          size="sm"
          color="neutral"
          class="font-mono text-text-muted"
        >
          {{ formatKeys('2') }}
        </UKbd>
        <span>Split</span>
      </div>
      <div class="flex gap-3 items-center">
        <UKbd
          size="sm"
          color="neutral"
          class="font-mono text-text-muted"
        >
          {{ formatKeys('3') }}
        </UKbd>
        <span>Preview</span>
      </div>
      <div class="bg-border h-3 w-px" />
      <div class="flex gap-3 items-center">
        <UKbd
          size="sm"
          color="neutral"
          class="font-mono text-text-muted"
        >
          {{ formatKeys('⌘K') }}
        </UKbd>
        <span>Commands</span>
      </div>
    </div>
  </footer>
</template>
