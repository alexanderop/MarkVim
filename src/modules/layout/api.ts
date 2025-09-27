/**
 * Layout Module API
 *
 * This file defines the public interface for the layout module.
 * Other modules should import from this API file, not directly from internal files.
 */

export { useResizablePanes } from './composables/useResizablePanes'
export { useSyncedScroll } from './composables/useSyncedScroll'
// Export composables that other modules might need
export { useViewMode, type ViewMode } from './composables/useViewMode'
