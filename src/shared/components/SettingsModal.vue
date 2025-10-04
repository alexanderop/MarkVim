<script setup lang="ts">
import type { Ref } from 'vue'
import { UButton, UModal } from '#components'
import { computed, ref } from 'vue'
import { useEditorSettings } from '~/modules/editor/api'
import { type FeatureName, useFeatureFlagsStore } from '~/modules/feature-flags/api'
import { useShortcuts } from '~/modules/shortcuts/api'
import BaseSwitch from './BaseSwitch.vue'

const { settings, updateFontSize, resetToDefaults, clearAllData } = useEditorSettings()
const { showSettings, toggleSettings } = useShortcuts()
const featureFlagsStore = useFeatureFlagsStore()

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
  return featureFlagsStore.flags[feature]
}

function toggleFeature(feature: FeatureName): void {
  featureFlagsStore.dispatch({ type: 'TOGGLE_FEATURE', payload: { feature } })
}

function handleResetToDefaults(): void {
  resetToDefaults()
  featureFlagsStore.dispatch({ type: 'RESET_TO_DEFAULTS' })
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
                <div class="flex gap-2 items-center">
                  <input
                    id="line-numbers"
                    v-model="settings.lineNumbers"
                    type="checkbox"
                    class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                  >
                  <label
                    for="line-numbers"
                    class="text-sm text-text-primary font-medium"
                  >Show Line Numbers</label>
                </div>

                <div
                  v-if="settings.lineNumbers"
                  class="ml-5 space-y-1"
                >
                  <div class="flex gap-4">
                    <div class="flex gap-1 items-center">
                      <input
                        id="line-mode-absolute"
                        v-model="settings.lineNumberMode"
                        type="radio"
                        value="absolute"
                        class="border-border h-3 w-3 text-accent focus:ring-accent"
                      >
                      <label
                        for="line-mode-absolute"
                        class="text-xs text-text-primary"
                      >Absolute</label>
                    </div>
                    <div class="flex gap-1 items-center">
                      <input
                        id="line-mode-relative"
                        v-model="settings.lineNumberMode"
                        type="radio"
                        value="relative"
                        class="border-border h-3 w-3 text-accent focus:ring-accent"
                      >
                      <label
                        for="line-mode-relative"
                        class="text-xs text-text-primary"
                      >Relative</label>
                    </div>
                    <div class="flex gap-1 items-center">
                      <input
                        id="line-mode-both"
                        v-model="settings.lineNumberMode"
                        type="radio"
                        value="both"
                        class="border-border h-3 w-3 text-accent focus:ring-accent"
                      >
                      <label
                        for="line-mode-both"
                        class="text-xs text-text-primary"
                      >Hybrid</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Other Settings -->
            <div class="p-3 border border-border rounded-md bg-surface-primary">
              <div class="gap-3 grid grid-cols-3">
                <div class="flex gap-2 items-center">
                  <input
                    id="line-wrapping"
                    v-model="settings.lineWrapping"
                    type="checkbox"
                    class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                  >
                  <label
                    for="line-wrapping"
                    class="text-xs text-text-primary"
                  >Line Wrapping</label>
                </div>
                <div class="flex gap-2 items-center">
                  <input
                    id="auto-save"
                    v-model="settings.autoSave"
                    type="checkbox"
                    class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                  >
                  <label
                    for="auto-save"
                    class="text-xs text-text-primary"
                  >Auto Save</label>
                </div>
                <div class="flex gap-2 items-center">
                  <input
                    id="live-preview"
                    v-model="settings.livePreview"
                    type="checkbox"
                    class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                  >
                  <label
                    for="live-preview"
                    class="text-xs text-text-primary"
                  >Live Preview</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div class="text-xs text-text-tertiary">
          Press <kbd class="text-xs text-text-primary font-mono px-1 border border-border rounded bg-surface-primary inline-flex h-4 min-w-[1rem] items-center justify-center">⎋</kbd> to close
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
