/**
 * Layout Module API
 *
 * This file defines the public interface for the layout module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export components that are used externally
export { default as HeaderToolbar } from './components/HeaderToolbar.vue'
export { default as StatusBar } from './components/StatusBar.vue'
export { useResizablePanes } from './composables/useResizablePanes'

export { useSyncedScroll } from './composables/useSyncedScroll'
// Export composables that other modules might need
export { useViewMode, type ViewMode } from './composables/useViewMode'
