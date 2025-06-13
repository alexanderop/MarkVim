<script setup lang="ts">
const { renderedHtml } = defineProps<{
  renderedHtml: string
}>()

const root = ref<HTMLElement>()
const scrollContainer = useTemplateRef<HTMLElement>('scrollContainer')

// Get the view mode state to detect when preview becomes visible
const { viewMode, isPreviewVisible } = useViewMode()

// Use the keyboard scroll composable
useKeyboardScroll(scrollContainer)

// Function to focus the scroll container
function focusScrollContainer() {
  if (scrollContainer.value) {
    scrollContainer.value.focus()
  }
}

// Auto-focus the scroll container when mounted
onMounted(() => {
  focusScrollContainer()
})

// Watch for view mode changes and refocus when preview is visible
watch(viewMode, () => {
  if (isPreviewVisible.value) {
    nextTick(() => {
      focusScrollContainer()
    })
  }
})

// Initialize Mermaid only on client side
const { setupMermaid, renderDiagrams, cleanup } = useMermaid(root)

onMounted(async () => {
  await setupMermaid()
})

onUnmounted(() => {
  cleanup()
})

watch(() => renderedHtml, () => nextTick(renderDiagrams))
</script>

<template>
  <div class="bg-surface-primary flex flex-col h-full w-full">
    <div class="px-6 border-b border-border bg-surface-primary flex flex-shrink-0 h-10 items-center justify-between">
      <div class="flex items-center space-x-4">
        <Icon name="lucide:eye" class="text-text-primary h-4 w-4" />
        <span class="text-xs text-text-secondary">Use ↑↓ or j/k to scroll</span>
      </div>
    </div>

    <div
      ref="scrollContainer"
      class="bg-surface-primary flex-1 min-h-0 overflow-auto focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-inset transition-all"
      tabindex="0"
    >
      <div ref="root" class="mx-auto px-12 py-12 max-w-none">
        <article class="prose-lg max-w-none prose" v-html="renderedHtml" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  max-width: none;
  font-size: 16px;
  line-height: 1.7;
  color: var(--foreground);
  font-family: 'Geist', sans-serif;
}

.prose-container {
  color: var(--foreground);
}

/* Mermaid styling */
:deep(.mermaid) {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
}

:deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
  background: transparent;
}

/* Mermaid text elements */
:deep(.mermaid .node-label),
:deep(.mermaid text) {
  color: var(--foreground) !important;
  fill: var(--foreground) !important;
}

/* Mermaid shape styling */
:deep(.mermaid .node rect),
:deep(.mermaid .node circle) {
  stroke: var(--border) !important;
}

/* Background elements */
:deep(.mermaid .cluster rect),
:deep(.mermaid .section) {
  background-color: var(--background) !important;
  color: var(--foreground) !important;
}

/* Links and paths */
:deep(.mermaid path.link),
:deep(.mermaid .actor-man) {
  fill: var(--background) !important;
  stroke: var(--accent) !important;
}

/* Activity elements */
:deep(.mermaid .activity) {
  stroke: var(--foreground) !important;
}

/* Flowchart elements */
:deep(.mermaid .flowchart-link) {
  stroke: var(--accent) !important;
}

/* Labels and text */
:deep(.mermaid .messageText),
:deep(.mermaid .labelText) {
  fill: var(--foreground) !important;
}

/* Activity labels */
:deep(.mermaid .actor .actor-label) {
  fill: var(--foreground) !important;
}

/* Lines */
:deep(.mermaid .actor-line) {
  stroke: var(--foreground) !important;
  opacity: 0.6;
}

/* Synchronized scrolling */
.preview-sync {
  border: 1px solid var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

/* Mermaid diagram container */
:deep(.mermaid) {
  background: var(--background);
  border-color: var(--border);
  border-radius: 8px;
  padding: 1rem;
  color: var(--foreground);
}

/* GitHub Alert styling - using correct markdown-it-github-alerts class names */
.prose :deep(.markdown-alert) {
  border-radius: 6px;
  border-left: 4px solid;
  margin: 16px 0;
  padding: 12px 16px;
  position: relative;
}

/* Note (blue) */
.prose :deep(.markdown-alert-note) {
  border-color: var(--accent);
  background: color-mix(in oklch, var(--accent) 10%, var(--background));
}

.prose :deep(.markdown-alert-note .markdown-alert-title) {
  color: var(--accent);
}

/* Tip (green) */
.prose :deep(.markdown-alert-tip) {
  border-color: oklch(from var(--accent) l c 140);
  background: color-mix(in oklch, oklch(from var(--accent) l c 140) 10%, var(--background));
}

.prose :deep(.markdown-alert-tip .markdown-alert-title) {
  color: oklch(from var(--accent) l c 140);
}

/* Important (purple) */
.prose :deep(.markdown-alert-important) {
  border-color: oklch(from var(--accent) l c 280);
  background: color-mix(in oklch, oklch(from var(--accent) l c 280) 10%, var(--background));
}

.prose :deep(.markdown-alert-important .markdown-alert-title) {
  color: oklch(from var(--accent) l c 280);
}

/* Warning (orange) */
.prose :deep(.markdown-alert-warning) {
  border-color: oklch(from var(--accent) l c 80);
  background: color-mix(in oklch, oklch(from var(--accent) l c 80) 10%, var(--background));
}

.prose :deep(.markdown-alert-warning .markdown-alert-title) {
  color: oklch(from var(--accent) l c 80);
}

/* Caution (red) */
.prose :deep(.markdown-alert-caution) {
  border-color: oklch(from var(--accent) l c 20);
  background: color-mix(in oklch, oklch(from var(--accent) l c 20) 10%, var(--background));
}

.prose :deep(.markdown-alert-caution .markdown-alert-title) {
  color: oklch(from var(--accent) l c 20);
}

/* Tables */
.prose :deep(table) {
  width: 100%;
  margin: 1.5rem 0;
  border-collapse: collapse;
  overflow-x: auto;
  display: block;
  white-space: nowrap;
}

.prose :deep(table tbody) {
  display: table;
  width: 100%;
}

.prose :deep(table thead),
.prose :deep(table tr) {
  display: table-row;
}

.prose :deep(table th),
.prose :deep(table td) {
  display: table-cell;
  border-color: var(--border);
  padding: 8px 12px;
  text-align: left;
  white-space: nowrap;
}

.prose :deep(table thead th) {
  font-weight: 600;
  color: var(--foreground);
  opacity: 0.8;
}

.prose :deep(table tbody tr:nth-child(even)) {
  background-color: var(--muted);
}

/* Links */
.prose :deep(a) {
  color: var(--accent);
  text-decoration: none;
}

.prose :deep(a:hover) {
  color: var(--accent);
  text-decoration: underline;
}

/* Inline code */
.prose :deep(code) {
  color: var(--accent);
  background-color: color-mix(in oklch, var(--accent) 15%, var(--background));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'Fira Code', monospace;
}

/* Code blocks */
.prose :deep(pre code) {
  background-color: var(--muted);
  color: var(--foreground);
}

/* Fix for nested code in pre */
.prose :deep(pre) {
  background-color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  color: var(--foreground) !important;
}

/* Mermaid specific fixes */
:deep(.mermaid svg) {
  fill: var(--background) !important;
  stroke: var(--border) !important;
}

/* Node content and text */
:deep(.mermaid .nodes),
:deep(.mermaid .node) {
  background: var(--background);
  border: 1px solid var(--border);
  color: var(--foreground) !important;
}
</style>
