---
description: "Instructions for working with the markdown preview module - markdown rendering and Mermaid diagram integration"
applyTo: "src/modules/markdown-preview/**/*"
---

# Markdown Preview Module Instructions

## Module Purpose
Renders markdown content to HTML with syntax highlighting, Mermaid diagram support, and synchronized theme integration.

## Key Components
- `MarkdownPreview.vue` - Main preview component
- `composables/useMarkdown.ts` - Markdown rendering logic
- `composables/useMermaid.ts` - Mermaid diagram integration

## Markdown Rendering System

### Core Rendering
```typescript
const { renderedMarkdown, updateMarkdown } = useMarkdown(markdownContent)

// Features:
// - MarkdownIt based rendering
// - Plugin system for extensions
// - Error handling with fallback
// - Reactive content updates
```

### Supported Extensions
- Tables
- Footnotes
- Math blocks (KaTeX)
- Code syntax highlighting
- Custom alert blocks
- Mermaid diagrams

## Development Guidelines

### Markdown Configuration
```typescript
// Shared utility creates configured renderer
const md = await createMarkdownRenderer()

// Common plugins:
// - markdown-it-footnote
// - markdown-it-table
// - markdown-it-math
// - markdown-it-alerts
// - Custom syntax highlighting
```

### Mermaid Integration
```typescript
const { setupMermaid, renderDiagrams, cleanup, isLoading, isReady } = useMermaid(rootElement)

// Theme synchronization:
// - CSS custom properties integration
// - Light/dark mode detection
// - Dynamic theme variable mapping
// - Automatic re-rendering on theme change
```

### Theme Integration
```typescript
// CSS custom properties for Mermaid theming
const primaryColor = useCssVar('--accent')
const primaryTextColor = useCssVar('--foreground')
const background = useCssVar('--background')

// Dynamic color calculations
const errorBkgColor = computed(() =>
  `oklch(from ${primaryColor.value} calc(l - 0.2) c calc(h + 180))`
)
```

## Component Patterns

### Preview Component Setup
```vue
<script setup>
const previewContainer = ref<HTMLElement>()
const { renderedMarkdown } = useMarkdown(content)
const { setupMermaid, renderDiagrams } = useMermaid(previewContainer)

onMounted(() => {
  setupMermaid()
})

watch(renderedMarkdown, () => {
  nextTick(renderDiagrams)
})
</script>

<template>
  <div
    ref="previewContainer"
    class="markdown-preview"
    v-html="renderedMarkdown"
  />
</template>
```

### Performance Optimization
- Lazy load Mermaid library
- Use `useAsyncState` for async operations
- Debounce markdown rendering
- Cache rendered content when possible

### Error Handling
```typescript
try {
  const rawHtml = md.render(markdownContent.value)
  renderedMarkdown.value = addDataTestIdToAlerts(rawHtml)
}
catch (error) {
  console.error('Failed to render markdown:', error)
  // Fallback to basic MarkdownIt
  const basicMd = new MarkdownIt()
  renderedMarkdown.value = basicMd.render(markdownContent.value)
}
```

## Mermaid Diagram Handling

### Initialization
```typescript
mermaid.default.initialize({
  startOnLoad: false,
  theme: isCurrentlyDark ? 'dark' : 'base',
  darkMode: isCurrentlyDark,
  themeVariables: {
    primaryColor: primaryColor.value,
    // ... all theme variables
  }
})
```

### Diagram Re-rendering
- Handle theme changes with mutation observer
- Reset processed diagrams for re-rendering
- Preserve original diagram source
- Clean up previous renderings

### Theme Synchronization
```typescript
// Monitor theme changes
const { stop } = useMutationObserver(
  () => import.meta.client ? document.documentElement : null,
  () => {
    nextTick(renderDiagrams)
  },
  {
    attributes: true,
    attributeFilter: ['class'],
  }
)
```

## Common Tasks

### Adding Markdown Extensions
1. Install markdown-it plugin
2. Configure in shared utils (`~/shared/utils/markdown`)
3. Update markdown renderer creation
4. Test with various content types

### Custom Alert Blocks
```typescript
// Add data-testid attributes for E2E testing
function addDataTestIdToAlerts(html: string) {
  return html.replace(
    /<div class="alert alert-(\w+)"/g,
    '<div class="alert alert-$1" data-testid="alert-$1"'
  )
}
```

### Mermaid Theme Variables
```typescript
// Map CSS custom properties to Mermaid theme
themeVariables: {
  primaryColor: primaryColor.value,
  primaryTextColor: primaryTextColor.value,
  background: background.value,
  // Extended color palette...
}
```

## Integration Points
- Syncs with color-theme module for consistent styling
- Works with editor module for live preview
- Connects to layout module for synchronized scrolling
- Integrates with documents module for content rendering

## Performance Considerations

### Rendering Optimization
- Use `requestAnimationFrame` for smooth updates
- Implement content diffing for minimal re-renders
- Cache expensive computations
- Lazy load heavy libraries (Mermaid, KaTeX)

### Memory Management
```typescript
onUnmounted(() => {
  // Clean up mutation observers
  cleanup()
  // Remove event listeners
  // Clear cached renderers
})
```

### Large Document Handling
- Implement virtual scrolling for large content
- Use incremental rendering for better UX
- Optimize diagram rendering performance
- Handle image loading efficiently

## Testing Considerations
- Test markdown rendering accuracy
- Verify Mermaid diagram functionality
- Check theme synchronization
- Validate accessibility features
- Test with various content types

## Accessibility Features
- Semantic HTML structure in rendered content
- Alt text for generated diagrams
- Keyboard navigation for interactive elements
- Screen reader compatibility
- High contrast mode support

## Security Considerations
- Sanitize HTML output when needed
- Validate Mermaid diagram syntax
- Handle malformed markdown gracefully
- Prevent XSS vulnerabilities in custom extensions
