import type { FeatureDirective } from '@/types/directives'
import { watch } from 'vue'
import { useFeatureFlagsStore } from '../store'

export const vFeature = {
  mounted(el, binding) {
    const store = useFeatureFlagsStore()
    const featureName = binding.value

    // Initial check
    const updateVisibility = (): void => {
      const isEnabled = store.state.flags[featureName] ?? true
      if (isEnabled) {
        el.style.removeProperty('display')
        return
      }
      el.style.setProperty('display', 'none', 'important')
    }

    updateVisibility()

    // Watch for changes in feature flags
    const unwatch = watch(
      () => store.state.flags[featureName],
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
    const isEnabled = store.state.flags[featureName] ?? true

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
