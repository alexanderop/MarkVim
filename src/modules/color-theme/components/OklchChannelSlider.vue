<script setup lang="ts">
interface Props {
  modelValue: number
  channel: 'l' | 'c' | 'h'
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1,
  step: 0.01,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// For hue, we use a different approach to handle unlimited values
const sliderValue = computed({
  get: () => {
    if (props.channel === 'h') {
      // Show the normalized value (0-360) for the slider display
      return props.modelValue % 360
    }
    return props.modelValue
  },
  set: (value: number) => {
    if (props.channel === 'h') {
      // For hue, calculate the difference and add it to the current value
      // This preserves values beyond 360° while allowing smooth slider interaction
      const currentNormalized = props.modelValue % 360
      const diff = value - currentNormalized

      // Handle wrap-around cases (e.g., going from 359° to 1°)
      let adjustedDiff = diff
      if (Math.abs(diff) > 180) {
        adjustedDiff = diff > 0 ? diff - 360 : diff + 360
      }

      emit('update:modelValue', props.modelValue + adjustedDiff)
    }
    else {
      emit('update:modelValue', value)
    }
  },
})

const channelInfo = computed(() => {
  switch (props.channel) {
    case 'l':
      return {
        label: 'Lightness',
        unit: '%',
        description: 'Controls how bright the color appears',
        displayValue: (props.modelValue * 100).toFixed(1),
      }
    case 'c':
      return {
        label: 'Chroma',
        unit: '',
        description: 'Controls how vivid/saturated the color is',
        displayValue: props.modelValue.toFixed(3),
      }
    case 'h':
      return {
        label: 'Hue',
        unit: '°',
        description: 'Circular color wheel - values beyond 360° wrap around',
        displayValue: Math.round(props.modelValue).toString(),
        normalizedValue: Math.round(props.modelValue % 360).toString(),
      }
    default:
      return {
        label: 'Unknown',
        unit: '',
        description: '',
        displayValue: props.modelValue.toString(),
      }
  }
})

const sliderBackground = computed(() => {
  switch (props.channel) {
    case 'l':
      return 'linear-gradient(to right, oklch(0% 0 0), oklch(100% 0 0))'
    case 'c':
      return 'linear-gradient(to right, oklch(70% 0 0), oklch(70% 0.4 0))'
    case 'h':
      return `linear-gradient(to right, 
        oklch(70% 0.15 0), 
        oklch(70% 0.15 60), 
        oklch(70% 0.15 120), 
        oklch(70% 0.15 180), 
        oklch(70% 0.15 240), 
        oklch(70% 0.15 300), 
        oklch(70% 0.15 360)
      )`
    default:
      return 'transparent'
  }
})

// Special handling for hue input
const hueInputValue = ref('')
const isEditingHue = ref(false)

// Update hue input when model value changes (but not when editing)
watch(() => props.modelValue, (newValue) => {
  if (props.channel === 'h' && !isEditingHue.value) {
    hueInputValue.value = Math.round(newValue).toString()
  }
}, { immediate: true })

function handleHueInputChange(event: Event) {
  if (props.channel !== 'h')
    return

  const target = event.target as HTMLInputElement
  const value = target.value
  hueInputValue.value = value

  const numValue = Number.parseFloat(value)
  if (!Number.isNaN(numValue)) {
    emit('update:modelValue', numValue)
  }
}

function handleHueInputFocus() {
  if (props.channel === 'h') {
    isEditingHue.value = true
  }
}

function handleHueInputBlur() {
  if (props.channel === 'h') {
    isEditingHue.value = false
    // Ensure the display value is updated
    hueInputValue.value = Math.round(props.modelValue).toString()
  }
}
</script>

<template>
  <div class="space-y-2">
    <!-- Channel Label and Value -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <label class="text-xs font-medium text-text-primary">
          {{ channelInfo.label }}
        </label>
        <span class="text-xs text-text-secondary opacity-70" :title="channelInfo.description">
          {{ channelInfo.description }}
        </span>
      </div>

      <!-- Special display for hue with editable input -->
      <div v-if="channel === 'h'" class="flex items-center gap-2">
        <input
          :value="hueInputValue"
          type="number"
          class="w-16 px-1 py-0.5 text-xs font-mono text-text-secondary bg-surface-secondary border border-border rounded focus:border-accent focus:outline-none"
          data-testid="hue-input"
          @input="handleHueInputChange"
          @focus="handleHueInputFocus"
          @blur="handleHueInputBlur"
        >
        <span class="text-xs text-text-secondary">
          °
        </span>
        <span
          v-if="Math.abs(modelValue) >= 360 || modelValue < 0"
          class="text-xs text-text-tertiary opacity-60"
          :title="`Normalized: ${channelInfo.normalizedValue}°`"
        >
          (≡{{ channelInfo.normalizedValue }}°)
        </span>
      </div>

      <!-- Standard display for lightness and chroma -->
      <span v-else class="text-xs font-mono text-text-secondary bg-surface-secondary px-2 py-0.5 rounded">
        {{ channelInfo.displayValue }}{{ channelInfo.unit }}
      </span>
    </div>

    <!-- Slider Container -->
    <div class="relative">
      <!-- Background Gradient -->
      <div
        class="absolute inset-0 h-3 rounded-full border border-border shadow-inner"
        :style="{ background: sliderBackground }"
      />

      <!-- Range Input -->
      <input
        v-model.number="sliderValue"
        type="range"
        :min="channel === 'h' ? 0 : min"
        :max="channel === 'h' ? 360 : max"
        :step="channel === 'h' ? 1 : step"
        class="oklch-slider"
        :data-testid="`oklch-slider-${channel}`"
      >
    </div>

    <!-- Special note for hue -->
    <div v-if="channel === 'h'" class="text-xs text-text-tertiary opacity-60">
      <BaseIcon name="lucide:rotate-cw" class="w-3 h-3 inline mr-1" />
      Hue is circular - values beyond 360° wrap around
    </div>
  </div>
</template>

<style scoped>
.oklch-slider {
  @apply relative w-full h-3 bg-transparent appearance-none cursor-pointer;
}

/* WebKit/Blink browsers (Chrome, Safari, Edge) */
.oklch-slider::-webkit-slider-thumb {
  @apply appearance-none;
  width: 18px;
  height: 18px;
  background: var(--accent);
  border-radius: 50%;
  border: 2px solid var(--background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.oklch-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px var(--accent);
}

.oklch-slider::-webkit-slider-thumb:active {
  transform: scale(1.05);
}

.oklch-slider::-webkit-slider-track {
  @apply bg-transparent;
}

/* Firefox */
.oklch-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--accent);
  border-radius: 50%;
  border: 2px solid var(--background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.oklch-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px var(--accent);
}

.oklch-slider::-moz-range-track {
  @apply bg-transparent;
}

/* Focus states */
.oklch-slider:focus-visible {
  outline: none;
}

.oklch-slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px var(--accent);
}

.oklch-slider:focus-visible::-moz-range-thumb {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px var(--accent);
}
</style>
