<script setup lang="ts">
import { Icon, USkeleton } from '#components'
</script>

<template>
  <div class="bg-[var(--background)] flex flex-col h-full w-full">
    <div class="px-6 border-b border-[var(--border)] bg-[var(--background)] flex flex-shrink-0 h-10 items-center justify-between">
      <div class="flex items-center space-x-4">
        <Icon
          name="lucide:eye"
          class="text-[var(--foreground)] h-4 w-4"
        />
        <span class="text-xs text-[var(--foreground)] opacity-70">Use ↑↓ or j/k to scroll</span>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-auto">
      <div class="mx-auto px-12 py-12 max-w-none">
        <div class="space-y-4">
          <!-- Title skeleton -->
          <USkeleton class="h-8 w-2/3" />

          <!-- Paragraph skeletons -->
          <div class="space-y-2 pt-4">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-5/6" />
            <USkeleton class="h-4 w-4/5" />
          </div>

          <!-- Subheading skeleton -->
          <div class="pt-6">
            <USkeleton class="h-6 w-1/2" />
          </div>

          <!-- More paragraphs -->
          <div class="space-y-2 pt-2">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-4 w-5/6" />
            <USkeleton class="h-4 w-2/3" />
          </div>

          <!-- List items -->
          <div class="space-y-2 pt-4">
            <USkeleton class="h-4 w-4/5" />
            <USkeleton class="h-4 w-3/5" />
            <USkeleton class="h-4 w-4/5" />
          </div>

          <!-- Code block skeleton -->
          <div class="pt-4">
            <USkeleton class="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
