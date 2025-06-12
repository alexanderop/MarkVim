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
onMounted(async () => {
  const mermaid = await import('mermaid')

  const isDark = () => document.documentElement.classList.contains('dark')

  const getCSSVariable = (name: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  const initializeMermaid = () => {
    const isCurrentlyDark = isDark()

    mermaid.default.initialize({
      startOnLoad: false,
      theme: isCurrentlyDark ? 'dark' : 'base',
      darkMode: isCurrentlyDark,
      themeVariables: {
        primaryColor: getCSSVariable('--color-accent'),
        primaryTextColor: getCSSVariable('--color-text-primary'),
        primaryBorderColor: getCSSVariable('--color-border'),
        lineColor: getCSSVariable('--color-text-secondary'),
        sectionBkgColor: getCSSVariable('--color-surface-primary'),
        altSectionBkgColor: getCSSVariable('--color-surface-primary'),
        gridColor: getCSSVariable('--color-border'),
        secondaryColor: getCSSVariable('--color-surface-primary'),
        tertiaryColor: getCSSVariable('--color-text-muted'),
      },
    })
  }

  initializeMermaid()

  const run = () => {
    const nodes = root.value?.querySelectorAll('.mermaid') ?? []
    if (nodes.length > 0) {
      initializeMermaid()

      // Clear existing rendered diagrams and restore original content
      nodes.forEach((node) => {
        const element = node as HTMLElement
        // If the node has been processed by Mermaid, it will have data-processed attribute
        if (element.hasAttribute('data-processed')) {
          element.removeAttribute('data-processed')
          // Find the original mermaid source from the element's dataset or textContent
          const originalContent = element.dataset.mermaidSource || element.textContent
          if (originalContent) {
            element.innerHTML = originalContent
            element.removeAttribute('id') // Remove any auto-generated IDs
          }
        }
        else {
          // Store original content for future theme changes
          element.dataset.mermaidSource = element.textContent || ''
        }
      })

      // Re-render with new theme
      mermaid.default.run({ nodes: Array.from(nodes) as HTMLElement[] })
    }
  }

  // Watch for theme changes
  const themeWatcher = new MutationObserver(() => {
    // Re-run diagrams when theme changes
    nextTick(run)
  })

  run()
  // Watch for changes to the dark class on document.documentElement
  themeWatcher.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  onUnmounted(() => {
    themeWatcher.disconnect()
  })

  watch(() => renderedHtml, () => nextTick(run))
})
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  color: var(--color-text-bright) !important;
  fill: var(--color-text-bright) !important;
}

.prose .markdown-alert-note {
  border-color: #0969da;
  background: hsla(212, 89%, 44%, 0.1);
}

.prose .markdown-alert-note > .markdown-alert-title {
  color: #409cff;
}

.prose .markdown-alert-tip {
  border-color: #2ea043;
  background: hsla(134, 61%, 45%, 0.1);
}

.prose .markdown-alert-tip > .markdown-alert-title {
  color: #3fb950;
}

.prose .markdown-alert-important {
  border-color: #8957e5;
  background: hsla(259, 68%, 62%, 0.1);
}

.prose .markdown-alert-important > .markdown-alert-title {
  color: #a475f9;
}

.prose .markdown-alert-warning {
  border-color: #d29922;
  background: hsla(37, 66%, 47%, 0.1);
}

.prose .markdown-alert-warning > .markdown-alert-title {
  color: #e3b341;
}

.prose .markdown-alert-caution {
  border-color: #da3633;
  background: hsla(1, 68%, 52%, 0.1);
}

.prose .markdown-alert-caution > .markdown-alert-title {
  color: #f85149;
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
  background-color: hsl(var(--accent-hsl) / 0.1);
  border-radius: 5px;
  font-weight: 500;
  transition: all 150ms ease-in-out;
}

.prose sup[id^='fnref'] a:hover {
  background-color: hsl(var(--accent-hsl) / 0.2);
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
