/**
 * Feature Flags Module API
 *
 * This file defines the public interface for the feature-flags module.
 * Other modules should import from this API file, not directly from internal files.
 */

import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { type FeatureFlagsState, useFeatureFlagsStore } from './store'

// Export directive
export { vFeature } from './directives/vFeature'

export type { FeatureFlagsEvents } from './events'
// Export types
export type { FeatureFlags, FeatureFlagsMessage, FeatureFlagsState, FeatureName } from './store'
export type { FeatureDirective, FeatureElement } from '@/types/directives'

/**
 * Read-only access to feature flags state.
 * External modules can only read state, not mutate it.
 * To change feature flags, emit events via emitAppEvent.
 */
export function useFeatureFlagsState(): {
  state: Ref<FeatureFlagsState>
} {
  const store = useFeatureFlagsStore()
  const { state } = storeToRefs(store)

  return {
    state,
  }
}
