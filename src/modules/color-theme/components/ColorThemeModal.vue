<script setup lang="ts">
import type { ColorTheme } from '../store'
import { ref } from 'vue'
import { useColorThemeStore } from '~/modules/color-theme/api'
import { useShortcuts } from '~/modules/shortcuts/api'
import BaseButton from '~/shared/components/BaseButton.vue'
import BaseModal from '~/shared/components/BaseModal.vue'
import ColorThemeOklchColorPicker from './OklchColorPicker.vue'

const { theme, updateColor, resetToDefaults, exportTheme, oklchToString } = useColorThemeStore()
const { showColorTheme, closeColorTheme } = useShortcuts()

const showColorPickerModal = ref(false)
const selectedColorKey = ref<keyof ColorTheme>('background')
const selectedColorData = ref<{
  key: keyof ColorTheme
  label: string
  description: string
  icon: string
}>({
  key: 'background',
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
  const currentColor = theme[colorDef.key]
  tempColor.value = { ...currentColor, a: currentColor.a ?? 1 }
  showColorPickerModal.value = true
}

function acceptColorChange() {
  updateColor(selectedColorKey.value, tempColor.value)
  showColorPickerModal.value = false
}

function cancelColorChange() {
  showColorPickerModal.value = false
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
    <div class="space-y-6">
      <div>
        <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-3 uppercase">
          Current Theme
        </h3>

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

      <div class="max-h-[50vh] overflow-y-auto space-y-6">
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
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded border border-border"
                    :style="{ backgroundColor: oklchToString(theme[colorDef.key]) }"
                  />
                  <code class="text-xs text-text-secondary font-mono">
                    {{ oklchToString(theme[colorDef.key]) }}
                  </code>
                </div>
                <span class="text-text-secondary group-hover:text-text-primary transition-colors">→</span>
              </div>
            </button>
          </div>
        </div>

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
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded border border-border"
                    :style="{ backgroundColor: oklchToString(theme[colorDef.key]) }"
                  />
                  <code class="text-xs text-text-secondary font-mono">
                    {{ oklchToString(theme[colorDef.key]) }}
                  </code>
                </div>
                <span class="text-text-secondary group-hover:text-text-primary transition-colors">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

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

  <BaseModal
    :open="showColorPickerModal"
    :title="`Choose ${selectedColorData.label} Color`"
    :description="selectedColorData.description"
    max-width="2xl"
    @update:open="(open) => !open && cancelColorChange()"
    @close="cancelColorChange"
  >
    <div class="p-4 border-t border-b border-border">
      <ColorThemeOklchColorPicker
        v-model="tempColor"
        :label="selectedColorData.label"
        :description="selectedColorData.description"
      />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
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
    </template>
  </BaseModal>
</template>
