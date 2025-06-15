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

function updateAlpha(value: number) {
  currentColor.value = { ...currentColor.value, a: value }
}

// OKLCH input handling
const oklchInput = ref('')
const isValidInput = ref(true)

// Update input when color changes from sliders
watch(colorPreview, (newValue) => {
  if (document.activeElement?.getAttribute('data-testid') === 'oklch-string-input')
    return
  oklchInput.value = newValue
}, { immediate: true })

// Parse OKLCH string to extract L, C, H values
function parseOklchString(input: string): OklchColor | null {
  // Remove extra whitespace and normalize
  const cleaned = input.trim().toLowerCase()

  // Match oklch(L% C H) format - allow negative hue values and values beyond 360
  const match = cleaned.match(/oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([-0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)/)

  if (!match)
    return null

  const [, lightness, chroma, hue, alpha] = match
  const l = Number.parseFloat(lightness)
  const c = Number.parseFloat(chroma)
  const h = Number.parseFloat(hue)
  const a = alpha !== undefined ? Number.parseFloat(alpha) : 1

  // Validate ranges - note: hue has no limits as it's circular
  if (Number.isNaN(l) || Number.isNaN(c) || Number.isNaN(h))
    return null
  if (l < 0 || l > 100)
    return null
  if (c < 0 || c > 1)
    return null
  if (Number.isNaN(a) || a < 0 || a > 1)
    return null
  // No hue validation - it's circular and unlimited

  return {
    l: l / 100, // Convert percentage to decimal
    c,
    h, // Keep original hue value, don't normalize
    a,
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

const isOutOfGamut = computed(() => {
  const { l, c } = currentColor.value
  // Heuristic for sRGB gamut check without a full library.
  // High chroma is the main cause, especially at lightness extremes.
  if (c > 0.33)
    return true
  if (c > 0.25 && (l < 0.3 || l > 0.85))
    return true
  return false
})

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(colorPreview.value)
  }
  catch (error) {
    console.warn('Failed to copy to clipboard:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Compact Header with Large Preview -->
    <div class="flex items-center gap-4">
      <div class="flex-1">
        <h4 class="text-base font-semibold text-text-primary">
          {{ label }}
        </h4>
        <p v-if="description" class="text-sm text-text-secondary">
          {{ description }}
        </p>
      </div>

      <!-- Large Color Preview -->
      <div class="relative">
        <div
          class="w-20 h-16 rounded-lg border-2 border-border shadow-md bg-cover transition-all duration-200 hover:shadow-lg"
          :style="{
            backgroundImage: `url('data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill-opacity='.05'%3e%3cpath d='M0 0h8v8H0zM8 8h8v8H8z'/%3e%3c/svg%3e')`,
          }"
        >
          <div
            class="w-full h-full rounded-lg transition-all duration-200"
            :style="{ backgroundColor: colorPreview }"
          />
        </div>

        <!-- Compact out of gamut indicator -->
        <div v-if="isOutOfGamut" class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center" title="Out of sRGB gamut">
          <BaseIcon name="lucide:alert-triangle" class="w-2 h-2 text-white" />
        </div>
      </div>
    </div>

    <!-- Compact OKLCH Input -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-text-primary">OKLCH Value</label>
        <button
          class="text-xs text-accent hover:text-accent/80 transition-colors"
          title="Copy to clipboard"
          @click="copyToClipboard"
        >
          Copy
        </button>
      </div>

      <input
        :value="oklchInput"
        type="text"
        placeholder="oklch(60% 0.18 240)"
        class="w-full px-3 py-2 text-sm font-mono bg-surface-primary border rounded-lg transition-all duration-200 focus:outline-none"
        :class="[
          isValidInput
            ? 'border-border focus:border-accent focus:ring-2 focus:ring-accent/20'
            : 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20',
        ]"
        data-testid="oklch-string-input"
        @input="handleOklchInput"
        @blur="handleInputBlur"
      >

      <!-- Compact validation message -->
      <p v-if="!isValidInput" class="text-xs text-red-500">
        Invalid format. Use: oklch(lightness% chroma hue)
      </p>
      <p v-else-if="isOutOfGamut" class="text-xs text-yellow-600 dark:text-yellow-400">
        Out of sRGB gamut
      </p>
    </div>

    <!-- Compact Sliders -->
    <div class="space-y-4">
      <h5 class="text-sm font-medium text-text-primary">
        Color Components
      </h5>

      <!-- Lightness -->
      <OklchChannelSlider
        :model-value="currentColor.l"
        channel="l"
        :full-color="currentColor"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="updateLightness"
      />

      <!-- Chroma -->
      <OklchChannelSlider
        :model-value="currentColor.c"
        channel="c"
        :full-color="currentColor"
        :min="0"
        :max="0.4"
        :step="0.001"
        @update:model-value="updateChroma"
      />

      <!-- Hue -->
      <OklchChannelSlider
        :model-value="currentColor.h"
        channel="h"
        :full-color="currentColor"
        :min="0"
        :max="360"
        :step="1"
        @update:model-value="updateHue"
      />

      <!-- Alpha -->
      <OklchChannelSlider
        :model-value="currentColor.a ?? 1"
        channel="a"
        :full-color="currentColor"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="updateAlpha"
      />
    </div>

    <!-- Compact Color Values -->
    <div class="bg-surface-secondary rounded-lg p-3 border border-border">
      <div class="grid grid-cols-4 gap-3 text-xs">
        <div class="text-center">
          <div class="text-text-secondary">
            L
          </div>
          <div class="font-mono text-text-primary">
            {{ (currentColor.l * 100).toFixed(0) }}%
          </div>
        </div>
        <div class="text-center">
          <div class="text-text-secondary">
            C
          </div>
          <div class="font-mono text-text-primary">
            {{ currentColor.c.toFixed(2) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-text-secondary">
            H
          </div>
          <div class="font-mono text-text-primary">
            {{ currentColor.h.toFixed(0) }}°
          </div>
        </div>
        <div class="text-center">
          <div class="text-text-secondary">
            A
          </div>
          <div class="font-mono text-text-primary">
            {{ ((currentColor.a ?? 1) * 100).toFixed(0) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
