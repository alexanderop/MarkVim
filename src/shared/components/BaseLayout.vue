<script setup lang="ts">
// No need for Shiki CSS injection anymore since we're using proper dual themes
</script>

<template>
  <div class="text-text-primary font-sans bg-background flex flex-col h-screen overflow-hidden">
    <slot />
  </div>
</template>

<style>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(220 10% 25% / 0.5);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(220 10% 30% / 0.7);
}

.cm-editor {
  background-color: var(--background) !important;
  color: var(--foreground) !important;
  border: none !important;
  outline: none !important;
  font-family: var(--font-family-mono) !important;
  font-size: var(--font-size-base) !important;
  font-feature-settings: 'liga' 1, 'calt' 1 !important;
  font-variant-ligatures: contextual !important;
}

.cm-editor .cm-scroller {
  color: var(--foreground) !important;
  font-size: var(--font-size-base) !important;
}

.cm-editor.cm-focused {
  outline: none !important;
  border-left-color: var(--accent) !important;
}

.cm-activeLine {
  background-color: color-mix(in oklch, var(--accent) 15%, var(--background)) !important;
}

.cm-gutters {
  background-color: var(--background) !important;
  border-right: 1px solid var(--border) !important;
  color: var(--foreground) !important;
  opacity: 0.5;
}

.cm-lineNumbers .cm-gutterElement {
  color: var(--foreground) !important;
  opacity: 0.5;
  font-size: var(--font-size-sm) !important;
}

.cm-activeLineGutter {
  color: var(--foreground) !important;
  opacity: 0.8;
}

button, a {
  transition-property: color, background-color, border-color, transform, opacity, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
[role="button"]:focus-visible,
[role="switch"]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Enhanced markdown styling */
:deep(.cm-header-1) { font-size: 1.25em !important; color: var(--foreground) !important; font-weight: 600 !important; }
:deep(.cm-header-2) { font-size: 1.15em !important; color: var(--foreground) !important; font-weight: 600 !important; }

:deep(.cm-strong) { font-weight: 600 !important; color: var(--foreground) !important; }

:deep(.cm-strikethrough) { color: var(--foreground) !important; opacity: 0.6; text-decoration: line-through !important; }

:deep(.cm-inline-code) {
  background: color-mix(in oklch, var(--accent) 10%, var(--background)) !important;
  color: var(--accent) !important;
  padding: 0.125rem 0.25rem !important;
  border-radius: 0.25rem !important;
  font-family: 'Fira Code', monospace !important;
}

:deep(.cm-link), :deep(.cm-url) { color: var(--accent) !important; text-decoration: none !important; }

:deep(.cm-blockquote) {
  color: var(--foreground) !important;
  opacity: 0.8;
  border-left: 3px solid color-mix(in oklch, var(--accent) 30%, transparent) !important;
  padding-left: 1rem !important;
  margin-left: 0 !important;
}

:deep(.cm-meta) { color: var(--foreground) !important; opacity: 0.6; }
:deep(.cm-hr) { color: var(--border) !important; }

/* Focus styles */
:deep(.cm-focused) {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
</style>
