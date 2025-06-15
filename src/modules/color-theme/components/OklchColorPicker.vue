<script setup lang="ts">
import type { OklchColor } from '../composables/useColorTheme'

interface Props {
  modelValue: OklchColor
  label: string
  description?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: OklchColor]
}>()

const { oklchToString } = useColorTheme()

const currentColor = computed({
  get: () => props.modelValue,
  set: (value: OklchColor) => emit('update:modelValue', value),
})

const colorPreview = computed(() => oklchToString(currentColor.value))

function updateLightness(value: number) {
  currentColor.value = { ...currentColor.value, l: value }
}

function updateChroma(value: number) {
  currentColor.value = { ...currentColor.value, c: value }
}

function updateHue(value: number) {
  currentColor.value = { ...currentColor.value, h: value }
}

// OKLCH input handling
const oklchInput = ref('')
const isValidInput = ref(true)

// Update input when color changes from sliders
watch(colorPreview, (newValue) => {
  oklchInput.value = newValue
}, { immediate: true })

// Parse OKLCH string to extract L, C, H values
function parseOklchString(input: string): OklchColor | null {
  // Remove extra whitespace and normalize
  const cleaned = input.trim().toLowerCase()

  // Match oklch(L% C H) format - allow negative hue values and values beyond 360
  const match = cleaned.match(/oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([-0-9.]+)\s*\)/)

  if (!match)
    return null

  const [, lightness, chroma, hue] = match
  const l = Number.parseFloat(lightness)
  const c = Number.parseFloat(chroma)
  const h = Number.parseFloat(hue)

  // Validate ranges - note: hue has no limits as it's circular
  if (Number.isNaN(l) || Number.isNaN(c) || Number.isNaN(h))
    return null
  if (l < 0 || l > 100)
    return null
  if (c < 0 || c > 1)
    return null
  // No hue validation - it's circular and unlimited

  return {
    l: l / 100, // Convert percentage to decimal
    c,
    h, // Keep original hue value, don't normalize
  }
}

// Handle OKLCH input changes
function handleOklchInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value
  oklchInput.value = value

  const parsedColor = parseOklchString(value)

  if (parsedColor) {
    isValidInput.value = true
    currentColor.value = parsedColor
  }
  else {
    isValidInput.value = value === '' || value === colorPreview.value
  }
}

// Handle input blur to reset invalid inputs
function handleInputBlur() {
  if (!isValidInput.value) {
    oklchInput.value = colorPreview.value
    isValidInput.value = true
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Color Info Header -->
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-medium text-text-primary">
          {{ label }}
        </h4>
        <p v-if="description" class="text-xs text-text-secondary">
          {{ description }}
        </p>
      </div>

      <!-- Color Preview -->
      <div
        class="w-10 h-10 rounded-md border border-border shadow-sm"
        :style="{ backgroundColor: colorPreview }"
        :title="colorPreview"
      />
    </div>

    <!-- OKLCH Direct Input -->
    <div class="space-y-1">
      <label class="text-xs font-medium text-text-primary">
        OKLCH Value
      </label>
      <div class="relative">
        <input
          :value="oklchInput"
          type="text"
          placeholder="oklch(60% 0.18 240)"
          class="w-full px-3 py-2 text-sm font-mono bg-surface-secondary border rounded-md transition-colors"
          :class="[
            isValidInput
              ? 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
              : 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500',
          ]"
          data-testid="oklch-string-input"
          @input="handleOklchInput"
          @blur="handleInputBlur"
        >

        <!-- Paste hint -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2">
          <BaseIcon
            name="lucide:clipboard"
            class="w-4 h-4 text-text-secondary opacity-50"
            title="Paste OKLCH value here"
          />
        </div>
      </div>

      <!-- Validation message -->
      <p v-if="!isValidInput" class="text-xs text-red-500">
        Invalid OKLCH format. Use: oklch(lightness% chroma hue) - hue can be any value (circular)
      </p>
      <p v-else class="text-xs text-text-secondary opacity-70">
        Paste or type OKLCH values directly - hue values beyond 360° are supported
      </p>
    </div>

    <!-- OKLCH Sliders -->
    <div class="space-y-3">
      <div class="text-xs font-medium text-text-primary mb-2">
        Adjust Values
      </div>

      <!-- Lightness -->
      <OklchChannelSlider
        :model-value="currentColor.l"
        channel="l"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="updateLightness"
      />

      <!-- Chroma -->
      <OklchChannelSlider
        :model-value="currentColor.c"
        channel="c"
        :min="0"
        :max="0.4"
        :step="0.001"
        @update:model-value="updateChroma"
      />

      <!-- Hue -->
      <OklchChannelSlider
        :model-value="currentColor.h"
        channel="h"
        @update:model-value="updateHue"
      />
    </div>
  </div>
</template>
