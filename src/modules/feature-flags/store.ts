import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useDataReset } from '@/shared/composables/useDataReset'

export type FeatureName
  = | 'documents'
    | 'editor'
    | 'markdown-preview'
    | 'color-theme'
    | 'share'
    | 'shortcuts'
    | 'vim-mode'

export interface FeatureFlags {
  'documents': boolean
  'editor': boolean
  'markdown-preview': boolean
  'color-theme': boolean
  'share': boolean
  'shortcuts': boolean
  'vim-mode': boolean
}

// --- THE MODEL ---
// This interface represents the entire state of the feature-flags module.
export interface FeatureFlagsState {
  flags: FeatureFlags
}

// --- THE MESSAGES ---
// A union type of all possible actions that can change the state.
export type FeatureFlagsMessage
  = | { type: 'ENABLE_FEATURE', payload: { feature: FeatureName } }
    | { type: 'DISABLE_FEATURE', payload: { feature: FeatureName } }
    | { type: 'TOGGLE_FEATURE', payload: { feature: FeatureName } }
    | { type: 'RESET_TO_DEFAULTS' }

// Default: all features enabled
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  'documents': true,
  'editor': true,
  'markdown-preview': true,
  'color-theme': true,
  'share': true,
  'shortcuts': true,
  'vim-mode': true,
}

// --- THE UPDATE FUNCTION (Reducer) ---
// A pure function that calculates the next state based on the current state and a message.
function update(currentState: FeatureFlagsState, message: FeatureFlagsMessage): FeatureFlagsState {
  switch (message.type) {
    case 'ENABLE_FEATURE':
      return {
        flags: {
          ...currentState.flags,
          [message.payload.feature]: true,
        },
      }

    case 'DISABLE_FEATURE':
      return {
        flags: {
          ...currentState.flags,
          [message.payload.feature]: false,
        },
      }

    case 'TOGGLE_FEATURE': {
      const currentValue = currentState.flags[message.payload.feature] ?? true
      return {
        flags: {
          ...currentState.flags,
          [message.payload.feature]: !currentValue,
        },
      }
    }

    case 'RESET_TO_DEFAULTS':
      return {
        flags: { ...DEFAULT_FEATURE_FLAGS },
      }

    default:
      return currentState
  }
}

// Feature Flags store following The Elm Architecture (TEA) pattern
export const useFeatureFlagsStore = defineStore('feature-flags', () => {
  // The state (Model) is initialized and synced with localStorage.
  const state = useLocalStorage<FeatureFlagsState>('markvim-feature-flags', {
    flags: DEFAULT_FEATURE_FLAGS,
  }, {
    mergeDefaults: true,
  })

  const { onDataReset } = useDataReset()

  // --- GETTERS (Selectors) ---
  const flags = computed(() => state.value.flags)

  // --- ACTIONS (The only way to mutate state) ---
  function dispatch(message: FeatureFlagsMessage): void {
    // Pass the current state and the message to our pure update function.
    // The result is the new state, which we assign back to our reactive state object.
    state.value = update(state.value, message)
  }

  // Data reset handling
  onDataReset(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' })
  })

  return {
    flags,
    dispatch,
  }
})
