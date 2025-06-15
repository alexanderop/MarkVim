<script setup lang="ts">
const { settings, toggleVimMode, updateFontSize, resetToDefaults, togglePreviewSync, clearAllData } = useEditorSettings()
const { showSettings, closeSettings, openSettings } = useShortcuts()

function useClearDataModal() {
  const showClearDataModal = ref(false)

  const openClearDataModal = () => {
    showClearDataModal.value = true
  }

  const closeClearDataModal = () => {
    showClearDataModal.value = false
  }

  const confirmClearData = () => {
    clearAllData()
    closeClearDataModal()
    closeSettings()
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
  <BaseModal
    :open="showSettings"
    title="Settings"
    description="Configure your MarkVim editor preferences"
    max-width="3xl"
    data-testid="settings-modal"
    @update:open="(open) => !open && closeSettings()"
    @close="closeSettings"
  >
    <template #trigger>
      <ToolbarButton
        variant="toggle"
        icon="lucide:settings"
        text="Settings"
        title="Settings (g s)"
        data-testid="settings-button"
        @click="openSettings"
      />
    </template>

    <!-- Settings Content -->
    <div class="space-y-4">
      <!-- Editor Behavior Section -->
      <div>
        <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-2 uppercase">
          Editor Behavior
        </h3>
        <div class="space-y-2">
          <div class="p-3 border border-border rounded-md bg-surface-primary flex items-center justify-between">
            <div>
              <h4 class="text-sm text-text-primary font-medium">
                Vim Mode
              </h4>
              <p class="text-xs text-text-secondary">
                Enable vim keybindings
              </p>
            </div>
            <SwitchRoot
              :model-value="settings.vimMode"
              class="rounded-full inline-flex h-5 w-9 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface-primary" :class="[
                settings.vimMode ? 'bg-accent' : 'bg-surface-hover',
              ]"
              @update:model-value="toggleVimMode"
            >
              <SwitchThumb
                class="rounded-full bg-background h-3 w-3 inline-block transform transition-transform" :class="[
                  settings.vimMode ? 'translate-x-5' : 'translate-x-1',
                ]"
              />
            </SwitchRoot>
          </div>

          <div class="p-3 border border-border rounded-md bg-surface-primary flex items-center justify-between">
            <div>
              <h4 class="text-sm text-text-primary font-medium">
                Synchronized Scrolling
              </h4>
              <p class="text-xs text-text-secondary">
                Sync scroll position in split view
              </p>
            </div>
            <SwitchRoot
              :model-value="settings.previewSync"
              class="rounded-full inline-flex h-5 w-9 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface-primary" :class="[
                settings.previewSync ? 'bg-accent' : 'bg-surface-hover',
              ]"
              data-testid="sync-scroll-toggle"
              @update:model-value="togglePreviewSync"
            >
              <SwitchThumb
                class="rounded-full bg-background h-3 w-3 inline-block transform transition-transform" :class="[
                  settings.previewSync ? 'translate-x-5' : 'translate-x-1',
                ]"
              />
            </SwitchRoot>
          </div>
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
                <BaseButton
                  variant="ghost"
                  size="sm"
                  icon="heroicons:minus"
                  icon-only
                  data-testid="font-size-decrease"
                  @click="updateFontSize(settings.fontSize - 1)"
                />
                <span class="text-sm text-text-primary font-mono text-center min-w-[3rem]" data-testid="font-size-display">{{ settings.fontSize }}px</span>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  icon="heroicons:plus"
                  icon-only
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
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.lineNumbers"
                  type="checkbox"
                  class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                >
                <span class="text-sm text-text-primary font-medium">Show Line Numbers</span>
              </label>

              <div v-if="settings.lineNumbers" class="ml-5 space-y-1">
                <div class="flex gap-4">
                  <label class="flex gap-1 items-center">
                    <input
                      v-model="settings.lineNumberMode"
                      type="radio"
                      value="absolute"
                      class="border-border h-3 w-3 text-accent focus:ring-accent"
                    >
                    <span class="text-xs text-text-primary">Absolute</span>
                  </label>
                  <label class="flex gap-1 items-center">
                    <input
                      v-model="settings.lineNumberMode"
                      type="radio"
                      value="relative"
                      class="border-border h-3 w-3 text-accent focus:ring-accent"
                    >
                    <span class="text-xs text-text-primary">Relative</span>
                  </label>
                  <label class="flex gap-1 items-center">
                    <input
                      v-model="settings.lineNumberMode"
                      type="radio"
                      value="both"
                      class="border-border h-3 w-3 text-accent focus:ring-accent"
                    >
                    <span class="text-xs text-text-primary">Hybrid</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Settings -->
          <div class="p-3 border border-border rounded-md bg-surface-primary">
            <div class="gap-3 grid grid-cols-3">
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.lineWrapping"
                  type="checkbox"
                  class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                >
                <span class="text-xs text-text-primary">Line Wrapping</span>
              </label>
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.autoSave"
                  type="checkbox"
                  class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                >
                <span class="text-xs text-text-primary">Auto Save</span>
              </label>
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.livePreview"
                  type="checkbox"
                  class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                >
                <span class="text-xs text-text-primary">Live Preview</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer-left>
      Press <kbd class="text-xs text-text-primary font-mono px-1 border border-border rounded bg-surface-primary inline-flex h-4 min-w-[1rem] items-center justify-center">⎋</kbd> to close
    </template>

    <template #footer-right>
      <div class="flex gap-2 items-center">
        <BaseButton
          variant="default"
          size="sm"
          icon="lucide:trash-2"
          data-testid="clear-data-button"
          @click="openClearDataModal"
        >
          Clear Local Data
        </BaseButton>
        <BaseButton
          variant="default"
          size="sm"
          icon="lucide:rotate-ccw"
          @click="resetToDefaults"
        >
          Reset to Defaults
        </BaseButton>
      </div>
    </template>
  </BaseModal>

  <!-- Clear Data Confirmation Modal -->
  <BaseModal
    :open="showClearDataModal"
    title="Clear Local Data"
    max-width="md"
    data-testid="clear-data-confirm-modal"
    @update:open="showClearDataModal = $event"
    @close="closeClearDataModal"
  >
    <div class="py-4">
      <p class="text-text-primary text-sm leading-relaxed">
        Are you sure you want to clear all local data? This will remove:
      </p>
      <ul class="text-text-secondary text-sm mt-3 space-y-1 list-disc list-inside">
        <li>All saved documents</li>
        <li>Editor settings and preferences</li>
        <li>View mode preferences</li>
        <li>Command history</li>
        <li>Sidebar and pane layout settings</li>
      </ul>
      <p class="text-error text-sm mt-3 font-medium">
        This action cannot be undone.
      </p>
    </div>

    <div class="flex gap-3 items-center justify-end pt-4 border-t border-border">
      <BaseButton
        variant="default"
        icon="lucide:x"
        data-testid="clear-data-cancel-btn"
        @click="closeClearDataModal"
      >
        Cancel
      </BaseButton>
      <BaseButton
        variant="destructive"
        icon="lucide:trash-2"
        data-testid="clear-data-confirm-btn"
        @click="confirmClearData"
      >
        Clear All Data
      </BaseButton>
    </div>
  </BaseModal>
</template>
