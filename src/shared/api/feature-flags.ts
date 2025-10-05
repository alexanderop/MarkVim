/**
 * Feature Flags Module API
 *
 * This file defines the public interface for the feature-flags module.
 * Other modules should import from this API file, not directly from internal files.
 */

import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { type FeatureFlagsState, type FeatureName, useFeatureFlagsStore } from '../store/feature-flags'

// Export directive
export { vFeature } from '../directives/vFeature'

export type { FeatureFlagsEvents } from '../events/feature-flags'
// Export types
export type { FeatureFlags, FeatureFlagsMessage, FeatureFlagsState, FeatureName } from '../store/feature-flags'
export type { FeatureDirective, FeatureElement } from '@/types/directives'

/**
 * Public facade for feature flags module.
 * Provides read-only state access and action methods for mutations.
 * Use this composable from any module (same or cross-module).
 */
export function useFeatureFlags(): {
  // Readonly state
  state: Ref<FeatureFlagsState>
  // Actions
  toggleFeature: (feature: FeatureName) => void
  enableFeature: (feature: FeatureName) => void
  disableFeature: (feature: FeatureName) => void
  resetFeatures: () => void
} {
  const store = useFeatureFlagsStore()
  const { state } = storeToRefs(store)

  return {
    // Readonly state
    state,
    // Actions
    toggleFeature: (feature: FeatureName) => store.dispatch({ type: 'TOGGLE_FEATURE', payload: { feature } }),
    enableFeature: (feature: FeatureName) => store.dispatch({ type: 'ENABLE_FEATURE', payload: { feature } }),
    disableFeature: (feature: FeatureName) => store.dispatch({ type: 'DISABLE_FEATURE', payload: { feature } }),
    resetFeatures: () => store.dispatch({ type: 'RESET_TO_DEFAULTS' }),
  }
}

/**
 * @deprecated Use useFeatureFlags() instead
 */
export function useFeatureFlagsState(): ReturnType<typeof useFeatureFlags> {
  return useFeatureFlags()
}
