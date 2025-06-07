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
      tertiaryColor: '#8b949e'
    }
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
  <div ref="root" class="flex flex-col bg-editor-bg h-screen w-full">
    <div class="h-14 bg-editor-bg border-b border-editor-border flex items-center justify-between px-6 flex-shrink-0">
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-text-primary tracking-tight">Preview</span>
        <div class="w-px h-4 bg-editor-divider"></div>
        <div class="text-xs text-text-secondary font-mono">Rendered</div>
      </div>
    </div>
    
    <div class="flex-1 overflow-auto bg-editor-bg min-h-0">
      <div class="max-w-none mx-auto px-12 py-12">
        <article class="prose prose-lg prose-invert prose-gray max-w-none" v-html="renderedHtml"/>
      </div>
    </div>
  </div>
</template>

<style>
/* Mermaid diagram styling to match dark theme */
.mermaid {
  background: transparent !important;
  color: #e6edf3 !important;
}

.mermaid svg {
  max-width: 100%;
  height: auto;
  background: transparent !important;
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