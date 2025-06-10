<script setup lang="ts">
const { renderedHtml } = defineProps<{
  renderedHtml: string
}>()

const root = ref<HTMLElement>()

// Initialize Mermaid only on client side
if (import.meta.client) {
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

/* GitHub-style Alert Styling */
.prose .markdown-alert {
  padding: 1rem;
  margin: 1.5rem 0;
  border-left: 4px solid;
  border-radius: 0.5rem;
  background: hsl(220 26% 8%);
  border-color: hsl(215 18% 20%);
  transition: all 0.2s ease-in-out;
  position: relative;
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
  color: white !important;
  fill: white !important;
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

/* Footnotes Styling */
.prose hr.footnotes-sep {
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  border-color: hsl(215 18% 15%);
}

.prose .footnotes-list {
  padding-left: 1.25rem;
  font-size: 0.9em;
  color: hsl(215 12% 55%);
}

.prose .footnote-item p {
  display: inline;
}

.prose .footnote-backref {
  margin-left: 0.5rem;
  text-decoration: none;
  color: hsl(250 84% 60%);
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
  color: hsl(250 84% 65%);
  background-color: hsl(250 84% 60% / 0.1);
  border-radius: 5px;
  font-weight: 500;
  transition: all 150ms ease-in-out;
}

.prose sup[id^='fnref'] a:hover {
  background-color: hsl(250 84% 60% / 0.2);
  color: hsl(250 84% 70%);
}
</style>
