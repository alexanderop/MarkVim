<script setup lang="ts">
const { settings, toggleVimMode, updateFontSize, resetToDefaults, updateTheme, togglePreviewSync, clearAllLocalData } = useEditorSettings()
const { showSettings, closeSettings, openSettings } = useShortcuts()
const themes: EditorSettings['theme'][] = ['dark', 'light', 'auto']

function useClearDataModal() {
  const showClearDataModal = ref(false)

  const openClearDataModal = () => {
    showClearDataModal.value = true
  }

  const closeClearDataModal = () => {
    showClearDataModal.value = false
  }

  const confirmClearData = () => {
    clearAllLocalData()
    closeClearDataModal()
    closeSettings()

    // Reload the page to ensure all components reflect the cleared state
    if (import.meta.client) {
      window.location.reload()
    }
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
        <h3 class="text-xs text-gray-400 tracking-wider font-medium mb-2 uppercase">
          Editor Behavior
        </h3>
        <div class="space-y-2">
          <div class="p-3 border border-gray-700 rounded-md bg-gray-800/50 flex items-center justify-between">
            <div>
              <h4 class="text-sm text-gray-100 font-medium">
                Vim Mode
              </h4>
              <p class="text-xs text-gray-400">
                Enable vim keybindings
              </p>
            </div>
            <SwitchRoot
              :model-value="settings.vimMode"
              class="rounded-full inline-flex h-5 w-9 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-900" :class="[
                settings.vimMode ? 'bg-blue-600' : 'bg-gray-600',
              ]"
              @update:model-value="toggleVimMode"
            >
              <SwitchThumb
                class="rounded-full bg-white h-3 w-3 inline-block transform transition-transform" :class="[
                  settings.vimMode ? 'translate-x-5' : 'translate-x-1',
                ]"
              />
            </SwitchRoot>
          </div>

          <div class="p-3 border border-gray-700 rounded-md bg-gray-800/50 flex items-center justify-between">
            <div>
              <h4 class="text-sm text-gray-100 font-medium">
                Synchronized Scrolling
              </h4>
              <p class="text-xs text-gray-400">
                Sync scroll position in split view
              </p>
            </div>
            <SwitchRoot
              :model-value="settings.previewSync"
              class="rounded-full inline-flex h-5 w-9 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-900" :class="[
                settings.previewSync ? 'bg-blue-600' : 'bg-gray-600',
              ]"
              @update:model-value="togglePreviewSync"
            >
              <SwitchThumb
                class="rounded-full bg-white h-3 w-3 inline-block transform transition-transform" :class="[
                  settings.previewSync ? 'translate-x-5' : 'translate-x-1',
                ]"
              />
            </SwitchRoot>
          </div>
        </div>
      </div>

      <!-- Appearance Section -->
      <div>
        <h3 class="text-xs text-gray-400 tracking-wider font-medium mb-2 uppercase">
          Appearance
        </h3>
        <div class="space-y-2">
          <!-- Theme and Font Size in one row -->
          <div class="p-3 border border-gray-700 rounded-md bg-gray-800/50">
            <div class="gap-4 grid grid-cols-2">
              <div>
                <h4 class="text-sm text-gray-100 font-medium mb-1">
                  Theme
                </h4>
                <div class="flex gap-1">
                  <button
                    v-for="theme in themes"
                    :key="theme"
                    class="text-xs font-medium px-2 py-1 rounded capitalize transition-colors" :class="[
                      settings.theme === theme
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                    ]"
                    @click="updateTheme(theme)"
                  >
                    {{ theme }}
                  </button>
                </div>
              </div>

              <div>
                <h4 class="text-sm text-gray-100 font-medium mb-1">
                  Font Size
                </h4>
                <div class="flex gap-2 items-center">
                  <button
                    class="p-1 rounded hover:bg-gray-700 text-gray-300"
                    @click="updateFontSize(settings.fontSize - 1)"
                  >
                    <Icon name="heroicons:minus" class="h-3 w-3" />
                  </button>
                  <span class="text-sm text-gray-100 font-mono text-center min-w-[3rem]">{{ settings.fontSize }}px</span>
                  <button
                    class="p-1 rounded hover:bg-gray-700 text-gray-300"
                    @click="updateFontSize(settings.fontSize + 1)"
                  >
                    <Icon name="heroicons:plus" class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div>
        <h3 class="text-xs text-gray-400 tracking-wider font-medium mb-2 uppercase">
          Advanced
        </h3>
        <div class="space-y-2">
          <!-- Line Numbers -->
          <div class="p-3 border border-gray-700 rounded-md bg-gray-800/50">
            <div class="space-y-2">
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.lineNumbers"
                  type="checkbox"
                  class="border-gray-600 rounded h-3 w-3 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-100 font-medium">Show Line Numbers</span>
              </label>

              <div v-if="settings.lineNumbers" class="ml-5 space-y-1">
                <div class="flex gap-4">
                  <label class="flex gap-1 items-center">
                    <input
                      v-model="settings.lineNumberMode"
                      type="radio"
                      value="absolute"
                      class="border-gray-600 h-3 w-3 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="text-xs text-gray-200">Absolute</span>
                  </label>
                  <label class="flex gap-1 items-center">
                    <input
                      v-model="settings.lineNumberMode"
                      type="radio"
                      value="relative"
                      class="border-gray-600 h-3 w-3 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="text-xs text-gray-200">Relative</span>
                  </label>
                  <label class="flex gap-1 items-center">
                    <input
                      v-model="settings.lineNumberMode"
                      type="radio"
                      value="both"
                      class="border-gray-600 h-3 w-3 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="text-xs text-gray-200">Hybrid</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Settings -->
          <div class="p-3 border border-gray-700 rounded-md bg-gray-800/50">
            <div class="gap-3 grid grid-cols-3">
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.lineWrapping"
                  type="checkbox"
                  class="border-gray-600 rounded h-3 w-3 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-xs text-gray-200">Line Wrapping</span>
              </label>
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.autoSave"
                  type="checkbox"
                  class="border-gray-600 rounded h-3 w-3 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-xs text-gray-200">Auto Save</span>
              </label>
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.livePreview"
                  type="checkbox"
                  class="border-gray-600 rounded h-3 w-3 text-blue-600 focus:ring-blue-500"
                >
                <span class="text-xs text-gray-200">Live Preview</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer-left>
      Press <kbd class="text-xs text-gray-200 font-mono px-1 border border-gray-600 rounded bg-gray-700 inline-flex h-4 min-w-[1rem] items-center justify-center">⎋</kbd> to close
    </template>

    <template #footer-right>
      <div class="flex gap-2 items-center">
        <button
          class="text-xs text-red-400 font-medium px-3 py-1.5 border border-red-600/50 rounded transition-colors hover:text-red-300 hover:bg-red-600/10"
          data-testid="clear-data-button"
          @click="openClearDataModal"
        >
          Clear Local Data
        </button>
        <button
          class="text-xs text-gray-400 font-medium px-3 py-1.5 border border-gray-600 rounded transition-colors hover:text-gray-200 hover:bg-gray-700"
          @click="resetToDefaults"
        >
          Reset to Defaults
        </button>
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
      <p class="text-gray-200 text-sm leading-relaxed">
        Are you sure you want to clear all local data? This will remove:
      </p>
      <ul class="text-gray-400 text-sm mt-3 space-y-1 list-disc list-inside">
        <li>All saved documents</li>
        <li>Editor settings and preferences</li>
        <li>View mode preferences</li>
        <li>Command history</li>
        <li>Sidebar and pane layout settings</li>
      </ul>
      <p class="text-red-400 text-sm mt-3 font-medium">
        This action cannot be undone.
      </p>
    </div>

    <div class="flex gap-3 items-center justify-end pt-4 border-t border-gray-700">
      <button
        data-testid="clear-data-cancel-btn"
        class="text-sm font-medium px-4 py-2 rounded-md transition-colors text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
        @click="closeClearDataModal"
      >
        Cancel
      </button>
      <button
        data-testid="clear-data-confirm-btn"
        class="text-sm font-medium px-4 py-2 rounded-md transition-colors bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        @click="confirmClearData"
      >
        Clear All Data
      </button>
    </div>
  </BaseModal>
</template>
