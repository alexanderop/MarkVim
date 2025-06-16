<script setup lang="ts">
import type { OklchColor } from '../composables/useColorTheme'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, ref } from 'vue'

interface Props {
  modelValue: number
  channel: 'l' | 'c' | 'h' | 'a'
  fullColor: OklchColor
  min: number
  max: number
  step: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const showTooltip = ref(false)

const channelInfo = computed(() => {
  switch (props.channel) {
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
  if (props.channel === 'l') {
    return (props.modelValue * 100).toFixed(4)
  }
  if (props.channel === 'a') {
    return Math.round(props.modelValue * 100)
  }
  if (props.channel === 'h') {
    return Math.round(props.modelValue)
  }
  if (props.channel === 'c') {
    return props.modelValue.toFixed(4)
  }
  return props.modelValue.toFixed(2)
})

const trackGradient = computed(() => {
  const { l, c, h } = props.fullColor

  if (props.channel === 'h') {
    return `linear-gradient(to right, oklch(${l} ${c} 0), oklch(${l} ${c} 60), oklch(${l} ${c} 120), oklch(${l} ${c} 180), oklch(${l} ${c} 240), oklch(${l} ${c} 300), oklch(${l} ${c} 360))`
  }

  if (props.channel === 'l') {
    return `linear-gradient(to right, oklch(0 ${c} ${h}), oklch(1 ${c} ${h}))`
  }

  if (props.channel === 'c') {
    return `linear-gradient(to right, oklch(${l} 0 ${h}), oklch(${l} 0.4 ${h}))`
  }

  if (props.channel === 'a') {
    return `linear-gradient(to right, oklch(${l} ${c} ${h} / 0), oklch(${l} ${c} ${h} / 1))`
  }

  return 'linear-gradient(to right, #000, #fff)'
})

const tooltipPosition = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

function handleSliderChange(value: number[] | undefined) {
  if (value && value.length > 0) {
    emit('update:modelValue', value[0])
  }
}

function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  let value = Number.parseFloat(target.value)

  if (props.channel === 'l' || props.channel === 'a') {
    value = value / 100
  }

  if (!Number.isNaN(value)) {
    emit('update:modelValue', Math.max(props.min, Math.min(props.max, value)))
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
        <label class="text-xs font-medium text-text-primary">
          {{ channelInfo.label }}
        </label>
      </div>

      <div class="flex items-center gap-2">
        <input
          :value="displayValue"
          type="number"
          :min="min"
          :max="max"
          :step="channel === 'l' ? 0.0001 : channel === 'a' ? 1 : channel === 'h' ? 1 : channel === 'c' ? 0.0001 : 0.001"
          class="px-1 py-0.5 text-xs font-mono border border-border rounded bg-surface-primary text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent transition-all duration-200" :class="[
            channel === 'l' || channel === 'c' ? 'w-16' : 'w-12',
          ]"
          @input="handleInputChange"
        >
        <span class="text-xs text-text-secondary">
          {{ channelInfo.unit }}
        </span>
      </div>
    </div>

    <!-- Compact Slider -->
    <div class="relative group">
      <SliderRoot
        :model-value="[modelValue]"
        :min="min"
        :max="max"
        :step="step"
        class="relative flex items-center select-none touch-none w-full h-5"
        @update:model-value="handleSliderChange"
      >
        <SliderTrack class="bg-border relative grow rounded-full h-2 overflow-hidden">
          <div
            class="absolute inset-0 rounded-full"
            :style="{ background: trackGradient }"
          />
          <SliderRange class="absolute h-full bg-transparent" />
        </SliderTrack>
        <SliderThumb
          class="block w-4 h-4 bg-white border-2 border-accent rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200 cursor-grab active:cursor-grabbing"
          :style="{ transform: 'translateX(-50%)' }"
        />
      </SliderRoot>

      <!-- Compact tooltip -->
      <div
        v-if="showTooltip"
        class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-10"
        :style="{ left: `${tooltipPosition}%` }"
      >
        {{ displayValue }}{{ channelInfo.unit }}
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styling for better visual feedback */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
