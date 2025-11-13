<script setup lang="ts">
/*
 * OKLCH Color Picker with sRGB Gamut Detection
 *
 * WHAT IS sRGB GAMUT?
 * - sRGB is the standard color space used by most monitors, web browsers, and digital devices
 * - It can only display a limited range of colors compared to what human eyes can see
 * - Colors outside this range are "out of gamut" and will be automatically adjusted (clamped)
 *
 * WHY DOES OKLCH EXCEED sRGB?
 * - OKLCH is a perceptually uniform color space that can represent ALL visible colors
 * - It's designed for color science and can describe colors that don't exist in sRGB
 * - High chroma (saturation) values often exceed what sRGB monitors can display
 *
 * WHAT HAPPENS TO OUT-OF-GAMUT COLORS?
 * - Browsers automatically "clamp" them to the nearest displayable sRGB color
 * - This usually means reducing the chroma (making them less saturated)
 * - The color you see may be duller than what you specified
 *
 * WHEN ARE COLORS MOST LIKELY OUT OF GAMUT?
 * - Very high chroma values (> 0.3-0.4)
 * - Certain hue ranges (especially blues and cyans) have lower chroma limits
 *
 * HOW TO STAY IN GAMUT:
 * - Keep chroma values moderate (< 0.25 for most cases)
 * - Use the warning indicator to know when you're pushing boundaries
 */

import type { OklchColor } from '../store'
import { computed, ref, watch } from 'vue'
import { tryCatchAsync } from '~/shared/utils/result'
import { useColorThemeStore } from '../store'
import ColorThemeSliderChannel from './ColorThemeSliderChannel.vue'

const { label, description } = defineProps<{
  label: string
  description?: string
}>()
const currentColor = defineModel<OklchColor>({ required: true })

const store = useColorThemeStore()

const colorPreview = computed(() => store.oklchToString(currentColor.value))

function updateLightness(value: number): void {
  currentColor.value = { ...currentColor.value, l: value }
}

function updateChroma(value: number): void {
  currentColor.value = { ...currentColor.value, c: value }
}

function updateHue(value: number): void {
  currentColor.value = { ...currentColor.value, h: value }
}

function updateAlpha(value: number): void {
  currentColor.value = { ...currentColor.value, a: value }
}

// OKLCH input handling
const oklchInput = ref('')
const isValidInput = ref(true)

// Color constants
const PERCENTAGE_FACTOR = 100
const HUE_DEGREES_FULL_CIRCLE = 360
const EXTREME_CHROMA_THRESHOLD = 0.37
const HUE_BREAKPOINT_60 = 60
const HUE_BREAKPOINT_120 = 120
const HUE_BREAKPOINT_180 = 180
const HUE_BREAKPOINT_240 = 240
const HUE_BREAKPOINT_300 = 300
const MAX_CHROMA_RED_YELLOW = 0.35
const MAX_CHROMA_YELLOW_GREEN = 0.32
const MAX_CHROMA_GREEN_CYAN = 0.28
const MAX_CHROMA_CYAN_BLUE = 0.25
const MAX_CHROMA_BLUE_MAGENTA = 0.22
const MAX_CHROMA_MAGENTA_RED = 0.30
const MIN_LIGHTNESS_GAMUT_CHECK = 0.2
const MAX_LIGHTNESS_GAMUT_CHECK = 0.95

// Update input when color changes from sliders
watch(colorPreview, (newValue) => {
  if (typeof document !== 'undefined' && document.activeElement?.getAttribute('data-testid') === 'oklch-string-input')
    return
  oklchInput.value = newValue
}, { immediate: true })

// Validate OKLCH color values
function isValidOklchValues(l: number, c: number, h: number, a: number): boolean {
  if (Number.isNaN(l) || Number.isNaN(c) || Number.isNaN(h))
    return false
  if (l < 0 || l > PERCENTAGE_FACTOR)
    return false
  if (c < 0 || c > 1)
    return false
  if (Number.isNaN(a) || a < 0 || a > 1)
    return false
  return true
}

// Parse OKLCH string to extract L, C, H values
function parseOklchString(input: string): OklchColor | null {
  // Remove extra whitespace and normalize
  const cleaned = input.trim().toLowerCase()

  // Match oklch(L% C H) format - allow negative hue values and values beyond 360
  const match = cleaned.match(/oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([-0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)/)

  if (!match)
    return null

  const [, lightness, chroma, hue, alpha] = match

  // Type guard: match array elements are checked after null check
  if (!lightness || !chroma || !hue)
    return null

  const l = Number.parseFloat(lightness)
  const c = Number.parseFloat(chroma)
  const h = Number.parseFloat(hue)
  const a = alpha !== undefined ? Number.parseFloat(alpha) : 1

  // Validate ranges - note: hue has no limits as it's circular
  if (!isValidOklchValues(l, c, h, a))
    return null

  return {
    l: l / PERCENTAGE_FACTOR, // Convert percentage to decimal
    c,
    h, // Keep original hue value, don't normalize
    a,
  }
}

// Handle OKLCH input changes
function handleOklchInput(event: Event): void {
  if (!(event.target instanceof HTMLInputElement))
    return
  const target = event.target
  const value = target.value
  oklchInput.value = value

  const parsedColor = parseOklchString(value)

  if (parsedColor) {
    isValidInput.value = true
    currentColor.value = parsedColor
    return
  }
  isValidInput.value = value === '' || value === colorPreview.value
}

// Handle input blur to reset invalid inputs
function handleInputBlur(): void {
  if (!isValidInput.value) {
    oklchInput.value = colorPreview.value
    isValidInput.value = true
  }
}

function isExtremeChroma(chroma: number): boolean {
  return chroma > EXTREME_CHROMA_THRESHOLD
}

function getMaxChromaForHue(hue: number): number {
  const normalizedHue = ((hue % HUE_DEGREES_FULL_CIRCLE) + HUE_DEGREES_FULL_CIRCLE) % HUE_DEGREES_FULL_CIRCLE

  if (normalizedHue <= HUE_BREAKPOINT_60)
    return MAX_CHROMA_RED_YELLOW
  if (normalizedHue <= HUE_BREAKPOINT_120)
    return MAX_CHROMA_YELLOW_GREEN
  if (normalizedHue <= HUE_BREAKPOINT_180)
    return MAX_CHROMA_GREEN_CYAN
  if (normalizedHue <= HUE_BREAKPOINT_240)
    return MAX_CHROMA_CYAN_BLUE
  if (normalizedHue <= HUE_BREAKPOINT_300)
    return MAX_CHROMA_BLUE_MAGENTA
  return MAX_CHROMA_MAGENTA_RED
}

function isHueChromaOutOfGamut(lightness: number, chroma: number, hue: number): boolean {
  if (!isInMidLightnessRange(lightness))
    return false
  return chroma > getMaxChromaForHue(hue)
}

function isInMidLightnessRange(lightness: number): boolean {
  return lightness >= MIN_LIGHTNESS_GAMUT_CHECK && lightness <= MAX_LIGHTNESS_GAMUT_CHECK
}

const isOutOfGamut = computed(() => {
  const { l, c, h } = currentColor.value

  if (isExtremeChroma(c))
    return true
  if (isHueChromaOutOfGamut(l, c, h))
    return true

  return false
})

const gamutWarningText = computed(() => {
  if (!isOutOfGamut.value)
    return ''

  const { c } = currentColor.value

  if (c > EXTREME_CHROMA_THRESHOLD) {
    return 'Extremely high chroma - will be clamped to sRGB limits'
  }

  return 'Color exceeds sRGB gamut - may appear different on some displays'
})

async function copyToClipboard(): Promise<void> {
  const result = await tryCatchAsync(
    () => navigator.clipboard.writeText(colorPreview.value),
    error => (error instanceof Error ? error : new Error(String(error))),
  )

  if (!result.ok) {
    console.warn('Failed to copy to clipboard:', result.error)
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
        <p
          v-if="description"
          class="text-sm text-text-secondary"
        >
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
        <div
          v-if="isOutOfGamut"
          class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center"
          :title="gamutWarningText"
        >
          <BaseIcon
            name="lucide:alert-triangle"
            class="w-2 h-2 text-white"
          />
        </div>
      </div>
    </div>

    <!-- Compact OKLCH Input -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label
          for="oklch-input"
          class="text-sm font-medium text-text-primary"
        >OKLCH Value</label>
        <button
          type="button"
          class="text-xs text-accent hover:text-accent/80 transition-colors"
          title="Copy to clipboard"
          @click="copyToClipboard"
        >
          Copy
        </button>
      </div>

      <input
        id="oklch-input"
        :value="oklchInput"
        type="text"
        placeholder="oklch(60% 0.18 240)"
        aria-label="OKLCH color value"
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
      <p
        v-if="!isValidInput"
        class="text-xs text-red-500"
      >
        Invalid format. Use: oklch(lightness% chroma hue)
      </p>
      <p
        v-else-if="isOutOfGamut"
        class="text-xs text-yellow-600 dark:text-yellow-400"
      >
        {{ gamutWarningText }}
      </p>
    </div>

    <!-- Compact Sliders -->
    <div class="space-y-4">
      <h5 class="text-sm font-medium text-text-primary">
        Color Components
      </h5>

      <!-- Lightness -->
      <ColorThemeSliderChannel
        :model-value="currentColor.l"
        channel="l"
        :full-color="currentColor"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="updateLightness"
      />

      <!-- Chroma -->
      <ColorThemeSliderChannel
        :model-value="currentColor.c"
        channel="c"
        :full-color="currentColor"
        :min="0"
        :max="0.4"
        :step="0.001"
        @update:model-value="updateChroma"
      />

      <!-- Hue -->
      <ColorThemeSliderChannel
        :model-value="currentColor.h"
        channel="h"
        :full-color="currentColor"
        :min="0"
        :max="360"
        :step="1"
        @update:model-value="updateHue"
      />

      <!-- Alpha -->
      <ColorThemeSliderChannel
        :model-value="currentColor.a ?? 1"
        channel="a"
        :full-color="currentColor"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="updateAlpha"
      />
    </div>
  </div>
</template>
