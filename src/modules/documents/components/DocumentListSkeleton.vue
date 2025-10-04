<script setup lang="ts">
import { USkeleton } from '#components'
</script>

<template>
  <aside
    data-testid="document-list-skeleton"
    class="border-r border-[var(--border)] bg-[var(--background)] flex flex-col h-full w-72"
  >
    <!-- Header -->
    <div class="px-4 border-b border-[var(--border)] flex h-14 items-center justify-between">
      <div class="flex gap-3 items-center">
        <USkeleton class="h-5 w-12" />
        <USkeleton class="h-5 w-5 rounded-full" />
      </div>
      <USkeleton class="h-7 w-7 rounded-md" />
    </div>

    <!-- Document List Skeleton -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-2">
        <div
          v-for="i in 3"
          :key="`skeleton-${i}`"
          class="mb-1 relative last:mb-0"
        >
          <div class="px-3 py-3 border border-transparent rounded-lg">
            <div class="flex gap-3 items-start">
              <!-- Document icon skeleton -->
              <div class="mt-0.5 flex-shrink-0">
                <USkeleton class="h-6 w-6 rounded-md" />
              </div>

              <!-- Content skeleton -->
              <div class="flex-1 min-w-0">
                <div class="mb-1 flex gap-2 items-center justify-between">
                  <USkeleton class="h-4 w-20" />
                  <USkeleton class="h-3 w-12" />
                </div>
                <USkeleton class="h-3 w-32" />
              </div>
            </div>
          </div>

          <!-- Separator line -->
          <div
            v-if="i < 3"
            class="mx-3 mt-1 bg-[var(--border)] h-px"
          />
        </div>
      </div>
    </div>
  </aside>
</template>
