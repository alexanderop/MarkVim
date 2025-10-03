import type { FeatureDirective } from '@/types/directives'
import { watch } from 'vue'
import { useFeatureFlagsStore } from '../store'

export const vFeature = {
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
} satisfies FeatureDirective
