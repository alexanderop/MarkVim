---
description: "Instructions for working with the layout module - responsive design, resizable panes, and view modes"
applyTo: "src/modules/layout/**/*"
---

# Layout Module Instructions

## Module Purpose
Manages application layout including resizable panes, view mode switching, header toolbar, status bar, and responsive design patterns.

## Key Components
- `StatusBar.vue` - Bottom status bar with vim mode and stats
- `HeaderToolbar.vue` - Top navigation and view controls
- `composables/useResizablePanes.ts` - Draggable pane resizing
- `composables/useViewMode.ts` - View mode state management
- `composables/useSyncedScroll.ts` - Synchronized scrolling

## View Mode System

### View Mode Types
```typescript
type ViewMode = 'split' | 'editor' | 'preview'

// Computed visibility states
const isPreviewVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'preview')
const isSplitView = computed(() => viewMode.value === 'split')
const isEditorVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'editor')
```

### View Mode Management
- **Split**: Side-by-side editor and preview
- **Editor**: Editor only view
- **Preview**: Preview only view
- Persists to localStorage with hydration safety
- Supports keyboard toggling

## Development Guidelines

### Resizable Panes Implementation
```typescript
const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()

// Performance optimizations:
// - RequestAnimationFrame throttling
// - Pointer event capture
// - Cached container boundaries
// - 20-80% width constraints
```

### Performance Optimizations
- Use `requestAnimationFrame` for smooth 60fps resizing
- Throttle expensive operations during drag
- Cache DOM measurements for better performance
- Batch updates to prevent layout thrashing

### Responsive Design Patterns
```typescript
const isMobile = useMediaQuery('(max-width: 768px)')

// Mobile-specific behavior:
// - Disable pane resizing
// - Auto-hide sidebars
// - Stack layout instead of split
// - Touch-friendly controls
```

## Component Patterns

### Status Bar Features
- Show current vim mode
- Display document statistics (lines, characters)
- Keyboard shortcut hints
- Responsive visibility on mobile

### Header Toolbar
- View mode toggle buttons
- Document actions (new, save, delete)
- Settings and theme access
- Mobile hamburger menu

### Pane Management
```typescript
// Resizable pane setup
<div ref="containerRef" class="flex h-full">
  <div :style="{ width: `${leftPaneWidth}%` }">
    <!-- Left pane content -->
  </div>
  <div 
    class="resize-handle" 
    @pointerdown="startDrag"
  />
  <div :style="{ width: `${rightPaneWidth}%` }">
    <!-- Right pane content -->
  </div>
</div>
```

## Synchronized Scrolling

### Scroll Sync Implementation
```typescript
const { editorScrollContainer, previewScrollContainer } = useSyncedScroll(previewSyncEnabled)

// Features:
// - Bidirectional scroll synchronization
// - Enable/disable via settings
// - Performance optimized with throttling
// - Maintains scroll position ratios
```

## Common Tasks

### Adding Layout Components
1. Create component in `src/modules/layout/components/`
2. Follow responsive design patterns
3. Use semantic HTML structure
4. Implement proper keyboard navigation

### View Mode Extensions
- Add new view modes to type union
- Update computed visibility states
- Modify toggle logic for new modes
- Update keyboard shortcuts

### Mobile Optimization
```typescript
// Mobile-responsive patterns
const isMobile = useMediaQuery('(max-width: 768px)')

// Conditional behavior
if (isMobile.value) {
  // Mobile-specific logic
  // - Disable complex interactions
  // - Simplify UI elements
  // - Stack layouts vertically
}
```

## State Management

### LocalStorage Persistence
```typescript
// Consistent patterns across layout state
const viewMode = useState<ViewMode>('markvim-view-mode', defaultValue)
const leftPaneWidth = useLocalStorage('markvim-pane-width', initialWidth)

// Handle hydration safety
const isMounted = useMounted()
if (isMounted.value && typeof localStorage !== 'undefined') {
  // Safe localStorage access
}
```

### Data Reset Integration
```typescript
const { onDataReset } = useDataReset()
onDataReset(() => {
  // Reset layout state to defaults
  viewMode.value = 'split'
  leftPaneWidth.value = 50
})
```

## Performance Considerations

### Drag Performance
- Use pointer events over mouse events
- Implement throttling with RAF
- Cache DOM measurements
- Disable pointer events during drag
- Clean up event listeners properly

### Layout Calculations
- Minimize reflows and repaints
- Use CSS transforms for animations
- Batch DOM updates
- Optimize for 60fps interactions

### Memory Management
```typescript
onUnmounted(() => {
  // Clean up event listeners
  // Cancel animation frames
  // Release pointer captures
})
```

## Integration Points
- Works with editor module for content display
- Integrates with documents module for sidebar
- Connects to shortcuts module for keyboard navigation
- Syncs with settings for user preferences

## Accessibility Features
- Keyboard navigation for all controls
- Screen reader announcements for mode changes
- High contrast mode support
- Focus management during layout changes
- ARIA labels for interactive elements

## CSS Architecture
- Use UnoCSS atomic classes
- Implement CSS custom properties for theming
- Follow mobile-first responsive design
- Use CSS Grid/Flexbox for layouts
- Optimize for different screen densities

## Testing Considerations
- Test across different screen sizes
- Verify touch interactions on mobile
- Check keyboard navigation flows
- Test with assistive technologies
- Validate performance under load