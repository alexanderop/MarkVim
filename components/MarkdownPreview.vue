<script setup lang="ts">
interface Props {
  renderedHtml: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="w-1/2 flex flex-col bg-[#0c0d11] h-screen">
    <!-- Linear-style header -->
    <div class="h-14 bg-[#0c0d11] border-b border-[#1d1f23] flex items-center justify-between px-6 flex-shrink-0">
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-[#9ca3af] tracking-tight">Preview</span>
        <div class="w-px h-4 bg-[#1d1f23]"></div>
        <div class="text-xs text-[#6c7383] font-mono">Rendered</div>
      </div>
    </div>
    
    <!-- Preview content -->
    <div class="flex-1 overflow-auto bg-[#0c0d11] min-h-0">
      <div class="max-w-none mx-auto px-12 py-12">
        <article class="prose prose-lg prose-invert prose-linear max-w-none" v-html="props.renderedHtml"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Linear-inspired Prose Styling */
.prose-linear {
  color: #c9d1d9;
  line-height: 1.75;
  font-size: 18px;
  max-width: 65ch;
}

/* Enhanced typography hierarchy */
.prose-linear h1 {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin: 0 0 2rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #d1d5db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.prose-linear h2 {
  color: #f9fafb;
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin: 3rem 0 1.5rem 0;
}

.prose-linear h3 {
  color: #f3f4f6;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 2.5rem 0 1.25rem 0;
}

.prose-linear h4 {
  color: #e5e7eb;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 2rem 0 1rem 0;
}

.prose-linear h5 {
  color: #d1d5db;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 1.75rem 0 0.875rem 0;
}

.prose-linear h6 {
  color: #9ca3af;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 1.5rem 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Paragraphs with better flow */
.prose-linear p {
  margin: 0 0 1.75rem 0;
  color: #c9d1d9;
  line-height: 1.75;
}

.prose-linear p:last-child {
  margin-bottom: 0;
}

/* Lead paragraph styling */
.prose-linear > p:first-of-type {
  font-size: 1.25rem;
  color: #e5e7eb;
  font-weight: 400;
  line-height: 1.7;
}

/* Inline code with better contrast */
.prose-linear code {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-size: 0.875em;
  font-weight: 500;
  border: 1px solid rgba(251, 191, 36, 0.2);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

/* Code blocks with Linear styling */
.prose-linear pre {
  background: #161b22;
  border: 1px solid #30363d;
  color: #e6edf3;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin: 2rem 0;
  overflow-x: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.prose-linear pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border: none;
  border-radius: 0;
  font-size: 0.875rem;
  font-weight: 400;
}

/* Blockquotes with Linear accent */
.prose-linear blockquote {
  border-left: 4px solid #5e6ad2;
  background: linear-gradient(135deg, rgba(94, 106, 210, 0.1) 0%, rgba(94, 106, 210, 0.02) 100%);
  padding: 1.5rem 2rem;
  margin: 2.5rem 0;
  border-radius: 0.5rem;
  position: relative;
  font-style: italic;
  font-size: 1.05em;
}

.prose-linear blockquote p {
  color: #e5e7eb;
  margin: 0;
  line-height: 1.7;
}

.prose-linear blockquote::before {
  content: '"';
  font-size: 4rem;
  color: #5e6ad2;
  position: absolute;
  top: -0.5rem;
  left: 1rem;
  opacity: 0.3;
  font-family: Georgia, serif;
}

/* Lists with improved spacing */
.prose-linear ul,
.prose-linear ol {
  margin: 1.75rem 0;
  padding-left: 1.75rem;
}

.prose-linear li {
  margin: 0.75rem 0;
  color: #c9d1d9;
  line-height: 1.7;
}

.prose-linear li p {
  margin: 0.5rem 0;
}

.prose-linear li > ul,
.prose-linear li > ol {
  margin: 0.75rem 0;
}

/* Task lists */
.prose-linear li input[type="checkbox"] {
  margin-right: 0.875rem;
  margin-top: 0.125rem;
  accent-color: #5e6ad2;
  transform: scale(1.15);
}

.prose-linear li:has(input[type="checkbox"]) {
  list-style: none;
  margin-left: -1.75rem;
  padding-left: 1.75rem;
}

/* Links with smooth transitions */
.prose-linear a {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid rgba(96, 165, 250, 0.3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.prose-linear a:hover {
  color: #93c5fd;
  border-bottom-color: #60a5fa;
  background: rgba(96, 165, 250, 0.05);
  padding: 0.125rem 0.25rem;
  margin: -0.125rem -0.25rem;
  border-radius: 0.25rem;
}

/* Strong and emphasis */
.prose-linear strong {
  color: #ffffff;
  font-weight: 700;
}

.prose-linear em {
  color: #f3f4f6;
  font-style: italic;
}

/* Tables with Linear styling */
.prose-linear table {
  width: 100%;
  border-collapse: collapse;
  margin: 2.5rem 0;
  border: 1px solid #30363d;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.prose-linear thead {
  background: #21262d;
}

.prose-linear th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #f0f6fc;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  border-bottom: 1px solid #30363d;
}

.prose-linear td {
  padding: 0.875rem 1.25rem;
  color: #c9d1d9;
  border-bottom: 1px solid #21262d;
}

.prose-linear tbody tr:last-child td {
  border-bottom: none;
}

.prose-linear tbody tr:hover {
  background: rgba(110, 118, 129, 0.05);
}

/* Horizontal rules */
.prose-linear hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, #30363d, transparent);
  margin: 3rem 0;
}

/* Image styling */
.prose-linear img {
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin: 2rem 0;
}

/* Better spacing for nested elements */
.prose-linear > * + * {
  margin-top: 1.75rem;
}

.prose-linear > h1 + *,
.prose-linear > h2 + *,
.prose-linear > h3 + * {
  margin-top: 1rem;
}
</style> 