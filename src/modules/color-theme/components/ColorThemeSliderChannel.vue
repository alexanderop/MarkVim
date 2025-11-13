<script setup lang="ts">
import type { OklchColor } from '../store'
import { USlider } from '#components'
import { computed } from 'vue'

const { channel, fullColor, min, max, step } = defineProps<{
  channel: 'l' | 'c' | 'h' | 'a'
  fullColor: OklchColor
  min: number
  max: number
  step: number
}>()
const model = defineModel<number>({ required: true })

// Percentage conversion factor (lightness and alpha are 0-1, displayed as 0-100%)
const PERCENTAGE_FACTOR = 100

const channelInfo = computed(() => {
  switch (channel) {
    case 'l':
      return {
        label: 'Lightness',
        unit: '%',
      }
    case 'c':
      return {
        label: 'Chroma',
        unit: '',
      }
    case 'h':
      return {
        label: 'Hue',
        unit: '°',
      }
    case 'a':
      return {
        label: 'Alpha',
        unit: '%',
      }
    default:
      return { label: '', unit: '' }
  }
})

const displayValue = computed(() => {
  if (channel === 'l' || channel === 'a') {
    return Math.round(model.value * PERCENTAGE_FACTOR)
  }
  if (channel === 'h') {
    return Math.round(model.value)
  }
  return model.value.toFixed(2)
})

const trackGradient = computed(() => {
  const { l, c, h } = fullColor

  if (channel === 'h') {
    return `linear-gradient(to right, oklch(${l} ${c} 0), oklch(${l} ${c} 60), oklch(${l} ${c} 120), oklch(${l} ${c} 180), oklch(${l} ${c} 240), oklch(${l} ${c} 300), oklch(${l} ${c} 360))`
  }

  if (channel === 'l') {
    return `linear-gradient(to right, oklch(0 ${c} ${h}), oklch(1 ${c} ${h}))`
  }

  if (channel === 'c') {
    return `linear-gradient(to right, oklch(${l} 0 ${h}), oklch(${l} 0.4 ${h}))`
  }

  // channel === 'a'
  return `linear-gradient(to right, oklch(${l} ${c} ${h} / 0), oklch(${l} ${c} ${h} / 1))`
})

function handleInputChange(event: Event): void {
  if (!(event.target instanceof HTMLInputElement))
    return
  const target = event.target
  let value = Number.parseFloat(target.value)

  if (channel === 'l' || channel === 'a') {
    value = value / PERCENTAGE_FACTOR
  }

  if (!Number.isNaN(value)) {
    model.value = Math.max(min, Math.min(max, value))
  }
}
</script>

<template>
  <div class="space-y-2">
    <!-- Compact Channel Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="{
            'bg-yellow-400': channel === 'l',
            'bg-purple-400': channel === 'c',
            'bg-blue-400': channel === 'h',
            'bg-gray-400': channel === 'a',
          }"
        />
        <label
          :for="`${channel}-input`"
          class="text-xs font-medium text-text-primary"
        >
          {{ channelInfo.label }}
        </label>
      </div>

      <div class="flex items-center gap-2">
        <input
          :id="`${channel}-input`"
          :value="displayValue"
          type="number"
          :min="min"
          :max="max"
          :step="channel === 'l' || channel === 'a' ? 1 : channel === 'h' ? 1 : 0.001"
          class="w-12 px-1 py-0.5 text-xs font-mono border border-border rounded bg-surface-primary text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent transition-all duration-200"
          :aria-label="`${channelInfo.label} value`"
          @input="handleInputChange"
        >
        <span class="text-xs text-text-secondary">
          {{ channelInfo.unit }}
        </span>
      </div>
    </div>

    <!-- Compact Slider -->
    <div class="relative">
      <div class="relative flex items-center select-none touch-none w-full">
        <USlider
          v-model="model"
          :min="min"
          :max="max"
          :step="step"
          color="primary"
          size="sm"
          :ui="{
            root: 'w-full',
            track: 'relative grow rounded-full h-2 overflow-hidden',
            range: 'absolute h-full bg-transparent',
          }"
          :style="{ '--track-gradient': trackGradient }"
          class="oklch-slider"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.oklch-slider :deep([class*="track"]) {
  background: var(--track-gradient) !important;
}
</style>
