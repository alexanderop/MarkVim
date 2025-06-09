<script setup lang="ts">
interface Props {
  lineCount: number
  characterCount: number
  formatKeys: (keys: string) => string
  vimMode?: string
  showVimMode?: boolean
}

defineProps<Props>()
</script>

<template>
  <footer data-testid="status-bar" class="px-4 border-t border-subtle bg-background/90 flex h-8 items-center justify-between backdrop-blur-xl">
    <div class="text-xs text-text-secondary flex gap-4 items-center">
      <div v-if="showVimMode && vimMode" class="flex gap-1 items-center">
        <span class="text-green-400 font-medium font-mono">{{ vimMode }}</span>
      </div>
      <div v-if="showVimMode && vimMode" class="bg-border h-3 w-px" />
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
        <kbd class="text-xs text-text-secondary font-mono px-1.5 py-0.5 border border-border rounded bg-surface-primary">
          {{ formatKeys('1') }}
        </kbd>
        <span>Editor</span>
      </div>
      <div class="flex gap-3 items-center">
        <kbd class="text-xs text-text-secondary font-mono px-1.5 py-0.5 border border-border rounded bg-surface-primary">
          {{ formatKeys('2') }}
        </kbd>
        <span>Split</span>
      </div>
      <div class="flex gap-3 items-center">
        <kbd class="text-xs text-text-secondary font-mono px-1.5 py-0.5 border border-border rounded bg-surface-primary">
          {{ formatKeys('3') }}
        </kbd>
        <span>Preview</span>
      </div>
      <div class="bg-border h-3 w-px" />
      <div class="flex gap-3 items-center">
        <kbd class="text-xs text-text-secondary font-mono px-1.5 py-0.5 border border-border rounded bg-surface-primary">
          {{ formatKeys('⌘K') }}
        </kbd>
        <span>Commands</span>
      </div>
      <div class="flex items-center gap-2 text-text-secondary">
        <span class="flex items-center gap-1">
          <kbd class="kbd">Ctrl+D</kbd>
          <span>Duplicate</span>
        </span>
        <div class="text-border-subtle">
          |
        </div>
        <span class="flex items-center gap-1">
          <kbd class="kbd">Alt+↑/↓</kbd>
          <span>Move Line</span>
        </span>
      </div>
    </div>
  </footer>
</template>
