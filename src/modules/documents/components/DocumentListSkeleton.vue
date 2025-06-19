<template>
  <aside
    data-testid="document-list-skeleton"
    class="border-r border-[var(--border)] bg-[var(--background)] flex flex-col h-full w-72"
  >
    <!-- Header -->
    <div class="px-4 border-b border-[var(--border)] flex h-14 items-center justify-between">
      <div class="flex gap-3 items-center">
        <div class="rounded bg-[var(--muted)] h-5 w-12 animate-pulse" />
        <div class="rounded-full bg-[var(--muted)] flex h-5 w-5 items-center justify-center animate-pulse" />
      </div>
      <div class="rounded-md bg-[var(--muted)] h-7 w-7 animate-pulse" />
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
                <div class="rounded-md bg-[var(--muted)] h-6 w-6 animate-pulse" />
              </div>

              <!-- Content skeleton -->
              <div class="flex-1 min-w-0">
                <div class="mb-1 flex gap-2 items-center justify-between">
                  <div class="rounded bg-[var(--muted)] h-4 w-20 animate-pulse" />
                  <div class="rounded bg-[var(--muted)] h-3 w-12 animate-pulse" />
                </div>
                <div class="rounded bg-[var(--muted)] h-3 w-32 animate-pulse" />
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
