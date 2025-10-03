/**
 * Feature Flags Module API
 *
 * This file defines the public interface for the feature-flags module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export directive
export { vFeature } from './directives/vFeature'
// Export store
export { useFeatureFlagsStore } from './store'

export type { FeatureFlags, FeatureFlagsMessage, FeatureFlagsState, FeatureName } from './store'
