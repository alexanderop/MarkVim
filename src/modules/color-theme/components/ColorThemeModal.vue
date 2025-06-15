<script setup lang="ts">
const { theme, updateColor, resetToDefaults, exportTheme, oklchToString } = useColorTheme()
const { showColorTheme, openColorTheme, closeColorTheme } = useShortcuts()

const showColorPickerModal = ref(false)
const selectedColorKey = ref<keyof typeof theme.value>('background')
const selectedColorData = ref({
  key: 'background' as keyof typeof theme.value,
  label: 'Background',
  description: 'Main application background color',
  icon: 'lucide:layout',
})

// Temporary color state for preview (doesn't update main theme until OK is clicked)
const tempColor = ref({ l: 0.7, c: 0.15, h: 200, a: 1 })

function resetThemeToDefaults() {
  resetToDefaults()
}

async function handleExportTheme() {
  try {
    const themeData = exportTheme()
    await navigator.clipboard.writeText(themeData)

    // Show success feedback (you can replace this with your notification system)
    // Theme exported to clipboard successfully

    // Optional: Show visual feedback
    const button = document.querySelector('[data-testid="export-theme-button"]')
    if (button) {
      const originalText = button.textContent
      button.textContent = 'Copied!'
      setTimeout(() => {
        button.textContent = originalText
      }, 2000)
    }
  }
  catch (error) {
    console.error('Failed to copy theme to clipboard:', error)

    // Fallback: Create a downloadable file
    const themeData = exportTheme()
    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markvim-theme.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

function openColorPicker(colorDef: typeof colorDefinitions[0]) {
  selectedColorKey.value = colorDef.key
  selectedColorData.value = colorDef
  // Initialize temp color with current theme color, ensuring alpha defaults to 1
  tempColor.value = { ...theme.value[colorDef.key], a: theme.value[colorDef.key].a ?? 1 }
  showColorPickerModal.value = true
}

function _closeColorPicker() {
  showColorPickerModal.value = false
}

function updateTempColor(color: typeof theme.value.background) {
  tempColor.value = { ...color, a: color.a ?? 1 }
}

function acceptColorChange() {
  updateColor(selectedColorKey.value, tempColor.value)
  showColorPickerModal.value = false
}

function cancelColorChange() {
  showColorPickerModal.value = false
}

function parseOklch(str: string) {
  const re = /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i
  const m = re.exec(str)
  if (!m)
    return null
  return {
    l: Number(m[1]) / (str.includes('%') ? 100 : 1),
    c: Number(m[2]),
    h: Number(m[3]),
    a: m[4] ? Number(m[4]) : 1,
  }
}

const colorDefinitions = [
  {
    key: 'background' as const,
    label: 'Background',
    description: 'Main application background color',
    icon: 'lucide:layout',
    category: 'core',
  },
  {
    key: 'foreground' as const,
    label: 'Foreground',
    description: 'Primary text and content color',
    icon: 'lucide:type',
    category: 'core',
  },
  {
    key: 'accent' as const,
    label: 'Accent',
    description: 'Interactive elements, links, and highlights',
    icon: 'lucide:zap',
    category: 'core',
  },
  {
    key: 'muted' as const,
    label: 'Muted',
    description: 'Subtle backgrounds and secondary surfaces hover for example',
    icon: 'lucide:layers',
    category: 'core',
  },
  {
    key: 'border' as const,
    label: 'Border',
    description: 'Separators, input borders, and dividers',
    icon: 'lucide:minus',
    category: 'core',
  },
  {
    key: 'alertNote' as const,
    label: 'Alert Note',
    description: 'Note/info alert color (blue)',
    icon: 'lucide:info',
    category: 'alerts',
  },
  {
    key: 'alertTip' as const,
    label: 'Alert Tip',
    description: 'Tip/success alert color (green)',
    icon: 'lucide:lightbulb',
    category: 'alerts',
  },
  {
    key: 'alertImportant' as const,
    label: 'Alert Important',
    description: 'Important alert color (purple)',
    icon: 'lucide:alert-triangle',
    category: 'alerts',
  },
  {
    key: 'alertWarning' as const,
    label: 'Alert Warning',
    description: 'Warning alert color (orange)',
    icon: 'lucide:alert-circle',
    category: 'alerts',
  },
  {
    key: 'alertCaution' as const,
    label: 'Alert Caution',
    description: 'Caution/danger alert color (red)',
    icon: 'lucide:octagon-x',
    category: 'alerts',
  },
]

const coreColors = colorDefinitions.filter(def => def.category === 'core')
const alertColors = colorDefinitions.filter(def => def.category === 'alerts')
</script>

<template>
  <BaseModal
    :open="showColorTheme"
    title="Color Theme"
    description="Customize your editor colors with OKLCH color space"
    max-width="4xl"
    data-testid="color-theme-modal"
    @update:open="(open) => !open && closeColorTheme()"
    @close="closeColorTheme"
  >
    <template #trigger>
      <BaseButton
        variant="ghost"
        size="sm"
        icon="lucide:palette"
        icon-only
        title="Color Theme"
        data-testid="color-theme-button"
        @click="openColorTheme"
      />
    </template>

    <!-- Current Theme Overview - Always visible -->
    <div class="space-y-6">
      <div>
        <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-3 uppercase">
          Current Theme
        </h3>

        <!-- Color Palette Preview -->
        <div class="flex gap-2 mb-4 p-3 bg-surface-primary border border-border rounded-md" data-testid="color-palette-preview">
          <div
            v-for="colorDef in colorDefinitions"
            :key="colorDef.key"
            class="flex flex-col items-center gap-1"
            :data-testid="`color-preview-${colorDef.key}`"
          >
            <div
              class="w-8 h-8 rounded-md border border-border shadow-sm"
              :style="{ backgroundColor: oklchToString(theme[colorDef.key]) }"
              :title="`${colorDef.label}: ${oklchToString(theme[colorDef.key])}`"
            />
            <span class="text-xs text-text-secondary font-medium">
              {{ colorDef.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Scrollable color sections -->
      <div class="max-h-[50vh] overflow-y-auto space-y-6">
        <!-- Core Colors -->
        <div data-testid="core-colors-section">
          <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-3 uppercase">
            Core Colors
          </h3>

          <div class="grid gap-3">
            <button
              v-for="colorDef in coreColors"
              :key="colorDef.key"
              class="flex items-center justify-between p-4 bg-surface-primary border border-border rounded-md hover:bg-surface-secondary transition-colors cursor-pointer group"
              :data-testid="`color-button-${colorDef.key}`"
              @click="openColorPicker(colorDef)"
            >
              <div class="flex items-center gap-3">
                <div class="text-left">
                  <div class="font-medium text-sm text-text-primary">
                    {{ colorDef.label }}
                  </div>
                  <div class="text-xs text-text-secondary">
                    {{ colorDef.description }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <!-- Color Preview & Value -->
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded border border-border"
                    :style="{ backgroundColor: oklchToString(theme[colorDef.key]) }"
                  />
                  <code class="text-xs text-text-secondary font-mono">
                    {{ oklchToString(theme[colorDef.key]) }}
                  </code>
                </div>

                <!-- Arrow -->
                <span class="text-text-secondary group-hover:text-text-primary transition-colors">→</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Alert Colors -->
        <div data-testid="alert-colors-section">
          <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-3 uppercase">
            Alert Colors
          </h3>

          <div class="grid gap-3">
            <button
              v-for="colorDef in alertColors"
              :key="colorDef.key"
              class="flex items-center justify-between p-4 bg-surface-primary border border-border rounded-md hover:bg-surface-secondary transition-colors cursor-pointer group"
              :data-testid="`color-button-${colorDef.key}`"
              @click="openColorPicker(colorDef)"
            >
              <div class="flex items-center gap-3">
                <div class="text-left">
                  <div class="font-medium text-sm text-text-primary">
                    {{ colorDef.label }}
                  </div>
                  <div class="text-xs text-text-secondary">
                    {{ colorDef.description }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <!-- Color Preview & Value -->
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded border border-border"
                    :style="{ backgroundColor: oklchToString(theme[colorDef.key]) }"
                  />
                  <code class="text-xs text-text-secondary font-mono">
                    {{ oklchToString(theme[colorDef.key]) }}
                  </code>
                </div>

                <!-- Arrow -->
                <span class="text-text-secondary group-hover:text-text-primary transition-colors">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer slot for theme actions -->
    <template #footer>
      <div class="flex gap-2 w-full">
        <BaseButton
          variant="ghost"
          size="sm"
          icon="lucide:rotate-ccw"
          @click="resetThemeToDefaults"
        >
          Reset Colors
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          icon="lucide:download"
          data-testid="export-theme-button"
          @click="handleExportTheme"
        >
          Export Theme
        </BaseButton>
      </div>
    </template>
  </BaseModal>

  <!-- Color Picker Modal -->
  <BaseModal
    :open="showColorPickerModal"
    :title="`Choose ${selectedColorData.label} Color`"
    :description="selectedColorData.description"
    max-width="md"
    @update:open="(open) => !open && cancelColorChange()"
    @close="cancelColorChange"
  >
    <div class="p-2">
      <div class="oklch-picker" :style="{ '--current-color': oklchToString(tempColor) }">
        <!-- live preview -->
        <div class="preview" :style="{ background: oklchToString(tempColor) }" />

        <!-- editable OKLCH string -->
        <label class="field">
          <span class="field__label">OKLCH string</span>
          <input
            :value="oklchToString(tempColor)"
            class="field__input"
            spellcheck="false"
            autocomplete="off"
            data-testid="oklch-string-input"
            @input="(e) => {
              const target = e.target as HTMLInputElement
              const parsed = parseOklch(target.value)
              if (parsed) updateTempColor(parsed)
            }"
          >
        </label>

        <!-- lightness slider -->
        <div class="slider">
          <span class="slider__label">Lightness {{ (tempColor.l * 100).toFixed(0) }}%</span>
          <input
            class="range range--lightness"
            type="range"
            min="0"
            max="1"
            step="0.001"
            :value="tempColor.l"
            @input="(e) => updateTempColor({ ...tempColor, l: Number((e.target as HTMLInputElement).value) })"
          >
        </div>

        <!-- chroma slider -->
        <div class="slider">
          <span class="slider__label">Chroma {{ tempColor.c.toFixed(3) }}</span>
          <input
            class="range range--chroma"
            type="range"
            min="0"
            max="0.4"
            step="0.001"
            :value="tempColor.c"
            @input="(e) => updateTempColor({ ...tempColor, c: Number((e.target as HTMLInputElement).value) })"
          >
        </div>

        <!-- hue slider -->
        <div class="slider">
          <span class="slider__label">Hue {{ tempColor.h.toFixed(0) }}°</span>
          <input
            class="range range--hue"
            type="range"
            min="0"
            max="360"
            step="1"
            :value="tempColor.h"
            @input="(e) => updateTempColor({ ...tempColor, h: Number((e.target as HTMLInputElement).value) })"
          >
        </div>

        <!-- alpha slider -->
        <div class="slider">
          <span class="slider__label">Alpha {{ (tempColor.a * 100).toFixed(0) }}%</span>
          <input
            class="range range--alpha"
            type="range"
            min="0"
            max="1"
            step="0.001"
            :value="tempColor.a"
            @input="(e) => updateTempColor({ ...tempColor, a: Number((e.target as HTMLInputElement).value) })"
          >
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2 pt-3 border-t">
          <BaseButton
            variant="ghost"
            size="sm"
            @click="cancelColorChange"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="default"
            size="sm"
            data-testid="accept-color-change-button"
            @click="acceptColorChange"
          >
            OK
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
/* Color picker styles using design tokens */
.oklch-picker {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
  background: var(--background);
  font-family: system-ui, sans-serif;
}

.preview {
  height: 3rem;
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px var(--border) inset;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--foreground);
  opacity: 0.7;
}

.field__input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  background: var(--background);
  color: var(--foreground);
}

.field__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

.slider {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.slider__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--foreground);
  opacity: 0.7;
}

.range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: var(--muted);
  outline: none;
}

.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--background);
  border: 2px solid var(--foreground);
  cursor: pointer;
  margin-top: -4px;
}

.range::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--background);
  border: 2px solid var(--foreground);
  cursor: pointer;
}

.range--hue {
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
}

.range--lightness {
  background: linear-gradient(to right, oklch(0% 0 0), oklch(100% 0 0));
}

.range--chroma {
  background: linear-gradient(to right, oklch(from var(--current-color) l 0 h), var(--current-color));
}

.range--alpha {
  background: linear-gradient(
    to right,
    transparent,
    oklch(from var(--current-color) l c h)
  );
  background-image:
    linear-gradient(to right, transparent, oklch(from var(--current-color) l c h)),
    conic-gradient(#fff 0deg 90deg, #ccc 90deg 180deg, #fff 180deg 270deg, #ccc 270deg);
  background-size: 100% 100%, 10px 10px;
}

.border-t {
  border-top: 1px solid var(--border);
}
</style>
