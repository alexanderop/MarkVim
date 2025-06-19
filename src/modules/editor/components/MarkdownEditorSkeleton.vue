<template>
  <div class="bg-surface-primary flex flex-col h-screen w-full">
    <!-- Header -->
    <div class="px-6 border-b border-border bg-surface-primary flex flex-shrink-0 h-10 items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-1.5">
          <div class="rounded-full bg-window-close h-3 w-3 shadow-sm" />
          <div class="rounded-full bg-window-minimize h-3 w-3 shadow-sm" />
          <div class="rounded-full bg-window-maximize h-3 w-3 shadow-sm" />
        </div>
        <div class="bg-border h-4 w-px" />
        <Icon name="lucide:edit-3" class="text-text-primary h-4 w-4" />
      </div>
      <div class="flex items-center space-x-3" />
    </div>

    <!-- Editor skeleton -->
    <div class="flex-1 min-h-0 bg-[var(--background)] p-6">
      <div class="space-y-3">
        <!-- Header line skeleton -->
        <div class="flex items-center space-x-2">
          <div class="bg-[var(--muted)] h-6 w-6 rounded animate-pulse" />
          <div class="bg-[var(--muted)] h-6 w-48 rounded animate-pulse" />
        </div>

        <!-- Content lines skeleton -->
        <div class="space-y-2 pt-4">
          <div class="bg-[var(--muted)] h-4 w-full rounded animate-pulse" />
          <div class="bg-[var(--muted)] h-4 w-5/6 rounded animate-pulse" />
          <div class="bg-[var(--muted)] h-4 w-4/5 rounded animate-pulse" />
          <div class="bg-[var(--muted)] h-4 w-3/4 rounded animate-pulse" />
        </div>

        <!-- More content skeleton -->
        <div class="space-y-2 pt-6">
          <div class="bg-[var(--muted)] h-4 w-3/5 rounded animate-pulse" />
          <div class="bg-[var(--muted)] h-4 w-4/5 rounded animate-pulse" />
          <div class="bg-[var(--muted)] h-4 w-2/3 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>
