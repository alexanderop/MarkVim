<script setup lang="ts">
import type { ColorDefinition } from '../utils/color-definitions'
import type { ColorTheme } from '~/modules/color-theme/api'
import { UButton, UCard, UModal } from '#components'
import { ref } from 'vue'
import { useColorThemeStore } from '~/modules/color-theme/api'
import { useShortcuts } from '~/modules/shortcuts/api'
import { alertColors, colorDefinitions, coreColors } from '../utils/color-definitions'
import { copyToClipboard, downloadAsFile, showTemporaryButtonMessage } from '../utils/export-utils'
import ColorThemeButton from './ColorThemeButton.vue'
import ColorThemePicker from './ColorThemePicker.vue'

const COPIED_MESSAGE_DURATION_MS = 2000

// External composables
const { theme, dispatch, exportTheme, oklchToString } = useColorThemeStore()
const { showColorTheme, toggleColorTheme } = useShortcuts()

// Modal state sync
const isOpen = defineModel<boolean>('open', {
  get: () => showColorTheme.value,
  set: toggleColorTheme,
})

// Component logic - reads like a table of contents
const { showColorPickerModal, selectedColorData, tempColor, openColorPicker, acceptColorChange, cancelColorChange } = useColorPicker()
const { handleExportTheme } = useThemeActions()

// Inline composables - Thin Composables pattern (minimal reactivity, delegate to pure functions)
function useColorPicker(): {
  showColorPickerModal: import('vue').Ref<boolean>
  selectedColorData: import('vue').Ref<ColorDefinition>
  tempColor: import('vue').Ref<{ l: number, c: number, h: number, a: number }>
  openColorPicker: (colorDef: ColorDefinition) => void
  acceptColorChange: () => void
  cancelColorChange: () => void
} {
  const showColorPickerModal = ref(false)
  const selectedColorKey = ref<keyof ColorTheme>('background')
  const selectedColorData = ref<ColorDefinition>({
    key: 'background',
    label: 'Background',
    description: 'Main application background color',
    icon: 'lucide:layout',
    category: 'core',
  })
  const tempColor = ref({ l: 0.7, c: 0.15, h: 200, a: 1 })

  function openColorPicker(colorDef: ColorDefinition): void {
    selectedColorKey.value = colorDef.key
    selectedColorData.value = colorDef
    const currentColor = theme[colorDef.key]
    tempColor.value = { ...currentColor, a: currentColor.a ?? 1 }
    showColorPickerModal.value = true
  }

  function acceptColorChange(): void {
    dispatch({ type: 'UPDATE_COLOR', payload: { colorKey: selectedColorKey.value, color: tempColor.value } })
    showColorPickerModal.value = false
  }

  function cancelColorChange(): void {
    showColorPickerModal.value = false
  }

  return {
    showColorPickerModal,
    selectedColorData,
    tempColor,
    openColorPicker,
    acceptColorChange,
    cancelColorChange,
  }
}

function useThemeActions(): { handleExportTheme: () => Promise<void> } {
  async function handleExportTheme(): Promise<void> {
    const themeData = exportTheme()
    const copied = await copyToClipboard(themeData)

    if (!copied) {
      downloadAsFile(themeData, 'markvim-theme.json')
      return
    }

    showTemporaryButtonMessage('[data-testid="export-theme-button"]', 'Copied!', COPIED_MESSAGE_DURATION_MS)
  }

  return { handleExportTheme }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Color Theme"
    description="Customize your editor colors with OKLCH color space"
    :ui="{ content: 'max-w-4xl' }"
    data-testid="color-theme-modal"
  >
    <template #body>
      <div class="space-y-6">
        <div>
          <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-3 uppercase">
            Current Theme
          </h3>

          <UCard
            variant="outline"
            :ui="{ root: 'bg-surface-primary mb-4', body: 'p-3 flex gap-2' }"
            data-testid="color-palette-preview"
          >
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
          </UCard>
        </div>

        <div class="max-h-[50vh] overflow-y-auto space-y-6">
          <div data-testid="core-colors-section">
            <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-3 uppercase">
              Core Colors
            </h3>
            <div class="grid gap-3">
              <ColorThemeButton
                v-for="colorDef in coreColors"
                :key="colorDef.key"
                :color-def="colorDef"
                :color-string="oklchToString(theme[colorDef.key])"
                @click="openColorPicker(colorDef)"
              />
            </div>
          </div>

          <div data-testid="alert-colors-section">
            <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-3 uppercase">
              Alert Colors
            </h3>
            <div class="grid gap-3">
              <ColorThemeButton
                v-for="colorDef in alertColors"
                :key="colorDef.key"
                :color-def="colorDef"
                :color-string="oklchToString(theme[colorDef.key])"
                @click="openColorPicker(colorDef)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="lucide:rotate-ccw"
          @click="dispatch({ type: 'RESET_TO_DEFAULTS' })"
        >
          Reset Colors
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="lucide:download"
          data-testid="export-theme-button"
          @click="handleExportTheme"
        >
          Export Theme
        </UButton>
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="showColorPickerModal"
    :title="`Choose ${selectedColorData.label} Color`"
    :description="selectedColorData.description"
    :ui="{ content: 'max-w-2xl' }"
  >
    <template #body>
      <div class="p-4 border-t border-b border-border">
        <ColorThemePicker
          v-model="tempColor"
          :label="selectedColorData.label"
          :description="selectedColorData.description"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          @click="cancelColorChange"
        >
          Cancel
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          data-testid="accept-color-change-button"
          @click="acceptColorChange"
        >
          OK
        </UButton>
      </div>
    </template>
  </UModal>
</template>
