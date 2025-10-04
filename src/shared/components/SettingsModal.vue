<script setup lang="ts">
import type { Ref } from 'vue'
import { UButton, UCheckbox, UKbd, UModal, URadioGroup } from '#components'
import { computed, ref } from 'vue'
import { emitAppEvent } from '@/shared/utils/eventBus'
import { useEditorSettings } from '~/modules/editor/api'
import { type FeatureName, useFeatureFlagsState } from '~/modules/feature-flags/api'
import { useShortcuts } from '~/modules/shortcuts/api'
import BaseSwitch from './BaseSwitch.vue'

const { settings, updateFontSize, resetToDefaults, clearAllData } = useEditorSettings()
const { showSettings, toggleSettings } = useShortcuts()
const { state: featureFlagsState } = useFeatureFlagsState()

// Use defineModel with getter/setter to sync with store without duplicating state
const isOpen = defineModel<boolean>('open', {
  get: () => showSettings.value,
  set: toggleSettings,
})

interface Feature {
  key: FeatureName
  label: string
  description: string
}

const features = computed<Feature[]>(() => [
  { key: 'documents', label: 'Documents', description: 'Document management and sidebar' },
  { key: 'editor', label: 'Editor', description: 'Markdown editor (core feature)' },
  { key: 'markdown-preview', label: 'Markdown Preview', description: 'Live preview with Mermaid diagrams' },
  { key: 'vim-mode', label: 'Vim Mode Support', description: 'Vim keybindings in editor' },
  { key: 'color-theme', label: 'Color Theme', description: 'OKLCH color customization' },
  { key: 'share', label: 'Share', description: 'Import/Export documents' },
  { key: 'shortcuts', label: 'Shortcuts', description: 'Keyboard shortcuts and command palette' },
])

function isFeatureEnabled(feature: FeatureName): boolean {
  return featureFlagsState.value.flags[feature]
}

function toggleFeature(feature: FeatureName): void {
  emitAppEvent('feature:toggle', { feature })
}

function handleResetToDefaults(): void {
  resetToDefaults()
  emitAppEvent('feature:reset')
}

function useClearDataModal(): {
  showClearDataModal: Ref<boolean>
  openClearDataModal: () => void
  closeClearDataModal: () => void
  confirmClearData: () => void
} {
  const showClearDataModal = ref(false)

  const openClearDataModal = (): void => {
    showClearDataModal.value = true
  }

  const closeClearDataModal = (): void => {
    showClearDataModal.value = false
  }

  const confirmClearData = (): void => {
    clearAllData()
    closeClearDataModal()
    toggleSettings(false)
  }

  return {
    showClearDataModal,
    openClearDataModal,
    closeClearDataModal,
    confirmClearData,
  }
}

const { showClearDataModal, openClearDataModal, closeClearDataModal, confirmClearData } = useClearDataModal()
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    size="md"
    icon="lucide:settings"
    title="Settings (g s)"
    data-testid="settings-button"
    square
    @click="() => { toggleSettings(true) }"
  />

  <UModal
    v-model:open="isOpen"
    title="Settings"
    description="Configure your MarkVim editor preferences"
    :ui="{ content: 'max-w-3xl' }"
    data-testid="settings-modal"
  >
    <template #body>
      <!-- Settings Content -->
      <div class="space-y-4">
        <!-- Editor Behavior Section -->
        <div>
          <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-2 uppercase">
            Editor Behavior
          </h3>
          <div class="space-y-2">
            <BaseSwitch
              v-model="settings.vimMode"
              label="Vim Mode"
              description="Enable vim keybindings"
              data-testid="vim-mode-toggle"
            />

            <BaseSwitch
              v-model="settings.previewSync"
              label="Synchronized Scrolling"
              description="Sync scroll position in split view"
              data-testid="sync-scroll-toggle"
            />
          </div>
        </div>

        <!-- Feature Flags Section -->
        <div>
          <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-2 uppercase">
            Features
          </h3>
          <div class="space-y-2">
            <BaseSwitch
              v-for="feature in features"
              :key="feature.key"
              :model-value="isFeatureEnabled(feature.key)"
              :label="feature.label"
              :description="feature.description"
              :data-testid="`feature-${feature.key}-toggle`"
              @update:model-value="toggleFeature(feature.key)"
            />
          </div>
        </div>

        <!-- Appearance Section -->
        <div>
          <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-2 uppercase">
            Appearance
          </h3>
          <div class="space-y-2">
            <!-- Font Size -->
            <div class="p-3 border border-border rounded-md bg-surface-primary">
              <div>
                <h4 class="text-sm text-text-primary font-medium mb-1">
                  Font Size
                </h4>
                <div class="flex gap-2 items-center">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    icon="heroicons:minus"
                    square
                    data-testid="font-size-decrease"
                    @click="updateFontSize(settings.fontSize - 1)"
                  />
                  <span
                    class="text-sm text-text-primary font-mono text-center min-w-[3rem]"
                    data-testid="font-size-display"
                  >{{ settings.fontSize }}px</span>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    icon="heroicons:plus"
                    square
                    data-testid="font-size-increase"
                    @click="updateFontSize(settings.fontSize + 1)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div>
          <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-2 uppercase">
            Advanced
          </h3>
          <div class="space-y-2">
            <!-- Line Numbers -->
            <div class="p-3 border border-border rounded-md bg-surface-primary">
              <div class="space-y-2">
                <UCheckbox
                  v-model="settings.lineNumbers"
                  label="Show Line Numbers"
                  size="sm"
                  color="primary"
                />

                <URadioGroup
                  v-if="settings.lineNumbers"
                  v-model="settings.lineNumberMode"
                  orientation="horizontal"
                  size="xs"
                  color="primary"
                  class="ml-5"
                  :items="[
                    { label: 'Absolute', value: 'absolute' },
                    { label: 'Relative', value: 'relative' },
                    { label: 'Hybrid', value: 'both' },
                  ]"
                />
              </div>
            </div>

            <!-- Other Settings -->
            <div class="p-3 border border-border rounded-md bg-surface-primary">
              <div class="gap-3 grid grid-cols-3">
                <UCheckbox
                  v-model="settings.lineWrapping"
                  label="Line Wrapping"
                  size="xs"
                  color="primary"
                />
                <UCheckbox
                  v-model="settings.autoSave"
                  label="Auto Save"
                  size="xs"
                  color="primary"
                />
                <UCheckbox
                  v-model="settings.livePreview"
                  label="Live Preview"
                  size="xs"
                  color="primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div class="text-xs text-text-tertiary">
          Press <UKbd
            size="sm"
            color="neutral"
            class="font-mono"
          >
            ⎋
          </UKbd> to close
        </div>
        <div class="flex gap-2 items-center">
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            icon="lucide:trash-2"
            data-testid="clear-data-button"
            @click="openClearDataModal"
          >
            Clear Local Data
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            icon="lucide:rotate-ccw"
            @click="handleResetToDefaults"
          >
            Reset to Defaults
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Clear Data Confirmation Modal -->
  <UModal
    v-model:open="showClearDataModal"
    title="Clear Local Data"
    :ui="{ content: 'max-w-md' }"
    data-testid="clear-data-confirm-modal"
  >
    <template #body>
      <div class="py-4">
        <p class="text-text-primary text-sm leading-relaxed">
          Are you sure you want to clear all local data? This will remove:
        </p>
        <ul class="text-text-secondary text-sm mt-3 space-y-1 list-disc list-inside">
          <li>All saved documents</li>
          <li>Editor settings and preferences</li>
          <li>Feature flags and enabled features</li>
          <li>View mode preferences</li>
          <li>Command history</li>
          <li>Sidebar and pane layout settings</li>
        </ul>
        <p class="text-error text-sm mt-3 font-medium">
          This action cannot be undone.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3 items-center justify-end w-full">
        <UButton
          color="neutral"
          variant="outline"
          icon="lucide:x"
          data-testid="clear-data-cancel-btn"
          @click="closeClearDataModal"
        >
          Cancel
        </UButton>
        <UButton
          color="error"
          variant="solid"
          icon="lucide:trash-2"
          data-testid="clear-data-confirm-btn"
          @click="confirmClearData"
        >
          Clear All Data
        </UButton>
      </div>
    </template>
  </UModal>
</template>
