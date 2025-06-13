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

<style>
/* Mermaid diagram styling - theme aware */
.mermaid {
  background: transparent !important;
  color: var(--color-text-primary) !important;
  text-align: center !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  margin: 2rem 0 !important;
}

.mermaid svg {
  max-width: 100%;
  height: auto;
  background: transparent !important;
  margin: 0 auto !important;
}

/* Override Mermaid's default colors - theme aware */
.mermaid .node rect,
.mermaid .node circle,
.mermaid .node ellipse,
.mermaid .node polygon {
  fill: var(--color-surface-primary) !important;
  stroke: var(--color-border) !important;
  stroke-width: 1px !important;
}

.mermaid .node .label {
  color: var(--color-text-primary) !important;
  fill: var(--color-text-primary) !important;
}

.mermaid .edgePath .path {
  stroke: var(--color-text-secondary) !important;
  stroke-width: 2px !important;
}

.mermaid .edgeLabel {
  background-color: var(--color-surface-primary) !important;
  color: var(--color-text-primary) !important;
}

.mermaid .actor {
  fill: var(--color-surface-primary) !important;
  stroke: var(--color-accent) !important;
  stroke-width: 2px !important;
}

.mermaid .actor-line {
  stroke: var(--color-text-secondary) !important;
  stroke-width: 1px !important;
}

.mermaid .messageLine0,
.mermaid .messageLine1 {
  stroke: var(--color-accent) !important;
  stroke-width: 2px !important;
}

.mermaid .messageText {
  fill: var(--color-text-primary) !important;
  font-size: 14px !important;
}

.mermaid .loopText {
  fill: var(--color-text-primary) !important;
}

.mermaid .loopLine {
  stroke: var(--color-text-secondary) !important;
  stroke-width: 1px !important;
}

/* GitHub-style Alert Styling - theme aware */
.prose .markdown-alert {
  padding: 1rem;
  margin: 1.5rem 0;
  border-left: 4px solid;
  border-radius: 0.5rem;
  background: var(--color-surface-primary);
  border-color: var(--color-border);
  transition: all 0.2s ease-in-out;
  position: relative;
  color: var(--color-text-primary);
}

.prose .markdown-alert:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--color-shadow-md);
}

.prose .markdown-alert > .markdown-alert-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.prose .markdown-alert > .markdown-alert-title svg,
.prose .markdown-alert > .markdown-alert-title .icon {
  color: var(--color-text-primary) !important;
  fill: var(--color-text-primary) !important;
}

.prose .markdown-alert-note {
  border-color: var(--color-alert-note);
  background: var(--color-alert-note-bg);
}

.prose .markdown-alert-note > .markdown-alert-title {
  color: var(--color-alert-note);
}

.prose .markdown-alert-tip {
  border-color: var(--color-alert-tip);
  background: var(--color-alert-tip-bg);
}

.prose .markdown-alert-tip > .markdown-alert-title {
  color: var(--color-alert-tip);
}

.prose .markdown-alert-important {
  border-color: var(--color-alert-important);
  background: var(--color-alert-important-bg);
}

.prose .markdown-alert-important > .markdown-alert-title {
  color: var(--color-alert-important);
}

.prose .markdown-alert-warning {
  border-color: var(--color-alert-warning);
  background: var(--color-alert-warning-bg);
}

.prose .markdown-alert-warning > .markdown-alert-title {
  color: var(--color-alert-warning);
}

.prose .markdown-alert-caution {
  border-color: var(--color-alert-caution);
  background: var(--color-alert-caution-bg);
}

.prose .markdown-alert-caution > .markdown-alert-title {
  color: var(--color-alert-caution);
}

/* Special styling for collapsible alerts if implemented with Reka UI */
.prose .markdown-alert[data-collapsible] {
  cursor: pointer;
}

.prose .markdown-alert[data-collapsible] > .markdown-alert-title::after {
  content: '▼';
  margin-left: auto;
  font-size: 0.75rem;
  transition: transform 0.2s ease-in-out;
  color: inherit;
}

.prose .markdown-alert[data-collapsible][data-state="closed"] > .markdown-alert-title::after {
  transform: rotate(-90deg);
}

/* Footnotes Styling - theme aware */
.prose hr.footnotes-sep {
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  border-color: var(--color-border);
}

.prose .footnotes-list {
  padding-left: 1.25rem;
  font-size: 0.9em;
  color: var(--color-text-secondary);
}

.prose .footnote-item p {
  display: inline;
}

.prose .footnote-backref {
  margin-left: 0.5rem;
  text-decoration: none;
  color: var(--color-accent);
}

.prose .footnote-backref:hover {
  text-decoration: underline;
}

.prose sup[id^='fnref'] {
  line-height: 0;
}

.prose sup[id^='fnref'] a {
  padding: 0.1rem 0.3rem;
  text-decoration: none;
  color: var(--color-accent);
  background-color: var(--color-accent-subtle);
  border-radius: 5px;
  font-weight: 500;
  transition: all 150ms ease-in-out;
}

.prose sup[id^='fnref'] a:hover {
  background-color: var(--color-accent-muted);
  color: var(--color-accent-hover);
}

.mermaid .cluster rect {
  fill: var(--color-surface-primary) !important;
  stroke: var(--color-border) !important;
  stroke-width: 1px !important;
}

.mermaid .statediagram-state .state-note {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary) !important;
}
</style>
