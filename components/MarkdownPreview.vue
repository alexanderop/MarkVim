<script setup lang="ts">
const { renderedHtml } = defineProps<{
  renderedHtml: string
}>()

const root = ref<HTMLElement>()

// Initialize Mermaid only on client side
if (process.client) {
  const mermaid = await import('mermaid')
  mermaid.default.initialize({
    startOnLoad: false,
    theme: 'dark',
    darkMode: true,
    // Dark theme configuration that matches your editor
    themeVariables: {
      primaryColor: '#58a6ff',
      primaryTextColor: '#e6edf3',
      primaryBorderColor: '#30363d',
      lineColor: '#6e7681',
      sectionBkgColor: '#161b22',
      altSectionBkgColor: '#0d1117',
      gridColor: '#30363d',
      secondaryColor: '#21262d',
      tertiaryColor: '#8b949e',
    },
  })

  const run = () => {
    const nodes = root.value?.querySelectorAll('.mermaid') ?? []
    if (nodes.length > 0) {
      mermaid.default.run({ nodes: Array.from(nodes) as HTMLElement[] })
    }
  }

  onMounted(run)
  watch(() => renderedHtml, () => nextTick(run))
}
</script>

<template>
  <div class="bg-editor-bg flex flex-col h-full w-full">
    <div class="px-6 border-b border-editor-border bg-editor-bg flex flex-shrink-0 h-10 items-center justify-between">
      <div class="flex items-center space-x-4">
        <Icon name="lucide:eye" class="text-text-primary h-4 w-4" />
      </div>
    </div>

    <div ref="root" class="bg-editor-bg flex-1 min-h-0 overflow-auto">
      <div class="mx-auto px-12 py-12 max-w-none">
        <article class="prose-lg max-w-none prose prose-gray prose-invert" v-html="renderedHtml" />
      </div>
    </div>
  </div>
</template>

<style>
/* Mermaid diagram styling to match dark theme */
.mermaid {
  background: transparent !important;
  color: #e6edf3 !important;
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

/* Override Mermaid's default colors for better dark theme integration */
.mermaid .node rect,
.mermaid .node circle,
.mermaid .node ellipse,
.mermaid .node polygon {
  fill: #21262d !important;
  stroke: #58a6ff !important;
  stroke-width: 2px !important;
}

.mermaid .node .label {
  color: #e6edf3 !important;
  fill: #e6edf3 !important;
}

.mermaid .edgePath .path {
  stroke: #6e7681 !important;
  stroke-width: 2px !important;
}

.mermaid .edgeLabel {
  background-color: #161b22 !important;
  color: #e6edf3 !important;
}

.mermaid .actor {
  fill: #21262d !important;
  stroke: #58a6ff !important;
  stroke-width: 2px !important;
}

.mermaid .actor-line {
  stroke: #6e7681 !important;
  stroke-width: 1px !important;
}

.mermaid .messageLine0,
.mermaid .messageLine1 {
  stroke: #58a6ff !important;
  stroke-width: 2px !important;
}

.mermaid .messageText {
  fill: #e6edf3 !important;
  font-size: 14px !important;
}

.mermaid .loopText {
  fill: #e6edf3 !important;
}

.mermaid .loopLine {
  stroke: #6e7681 !important;
  stroke-width: 1px !important;
}
</style>
