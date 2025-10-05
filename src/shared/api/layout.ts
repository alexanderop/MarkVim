/**
 * Layout Module API
 *
 * This file defines the public interface for the layout module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export components that are used externally
export { default as LayoutHeader } from '../components/LayoutHeader.vue'
export { default as LayoutStatusBar } from '../components/LayoutStatusBar.vue'
export { useResizablePanes } from '../composables/useResizablePanes'

export { useSyncedScroll } from '../composables/useSyncedScroll'
// Export composables that other modules might need
export { useViewMode, type ViewMode } from '../composables/useViewMode'

// Export events
export type { LayoutEvents } from '../events/layout'
