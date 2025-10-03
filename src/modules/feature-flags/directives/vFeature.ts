import type { Directive, WatchStopHandle } from 'vue'
import { watch } from 'vue'
import { type FeatureName, useFeatureFlagsStore } from '../store'

interface FeatureElement extends HTMLElement {
  _vFeatureCleanup?: WatchStopHandle
}

export const vFeature: Directive<FeatureElement, FeatureName> = {
  mounted(el, binding) {
    const store = useFeatureFlagsStore()
    const featureName = binding.value

    // Initial check
    const updateVisibility = (): void => {
      const isEnabled = store.flags[featureName] ?? true
      if (!isEnabled) {
        el.style.display = 'none'
      }
      else {
        el.style.display = ''
      }
    }

    updateVisibility()

    // Watch for changes in feature flags
    const unwatch = watch(
      () => store.flags[featureName],
      () => {
        updateVisibility()
      },
    )

    // Store cleanup function on element
    el._vFeatureCleanup = unwatch
  },

  updated(el, binding) {
    const store = useFeatureFlagsStore()
    const featureName = binding.value
    const isEnabled = store.flags[featureName] ?? true

    if (!isEnabled) {
      el.style.display = 'none'
    }
    else {
      el.style.display = ''
    }
  },

  unmounted(el) {
    // Cleanup watcher
    const cleanup = el._vFeatureCleanup
    if (cleanup) {
      cleanup()
      delete el._vFeatureCleanup
    }
  },
}
