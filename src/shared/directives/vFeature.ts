import type { FeatureDirective } from '@/types/directives'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useFeatureFlagsStore } from '../store/feature-flags'

export const vFeature = {
  mounted(el, binding) {
    const store = useFeatureFlagsStore()
    const { state } = storeToRefs(store)
    const featureName = binding.value

    // Initial check
    const updateVisibility = (): void => {
      const isEnabled = state.value.flags[featureName] ?? true
      if (isEnabled) {
        el.style.removeProperty('display')
        return
      }
      el.style.setProperty('display', 'none', 'important')
    }

    updateVisibility()

    // Watch for changes in feature flags
    const unwatch = watch(
      () => state.value.flags[featureName],
      () => {
        updateVisibility()
      },
    )

    // Store cleanup function on element
    el._vFeatureCleanup = unwatch
  },

  updated(el, binding) {
    const store = useFeatureFlagsStore()
    const { state } = storeToRefs(store)
    const featureName = binding.value
    const isEnabled = state.value.flags[featureName] ?? true

    if (isEnabled) {
      el.style.removeProperty('display')
      return
    }
    el.style.setProperty('display', 'none', 'important')
  },

  unmounted(el) {
    // Cleanup watcher
    const cleanup = el._vFeatureCleanup
    if (cleanup) {
      cleanup()
      delete el._vFeatureCleanup
    }
  },
} satisfies FeatureDirective
