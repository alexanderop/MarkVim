<script setup lang="ts">
import type { EditorSettings } from '#imports'
import { useEditorSettings, useShortcuts } from '#imports'

const { settings, toggleVimMode, updateFontSize, resetToDefaults, updateTheme, togglePreviewSync } = useEditorSettings()
const { showSettings, closeSettings, openSettings } = useShortcuts()
const themes: EditorSettings['theme'][] = ['dark', 'light', 'auto']
</script>

<template>
  <BaseModal
    :open="showSettings"
    title="Settings"
    description="Configure your MarkVim editor preferences"
    max-width="3xl"
    @update:open="(open) => !open && closeSettings()"
    @close="closeSettings"
  >
    <template #trigger>
      <ToolbarButton
        variant="toggle"
        icon="lucide:settings"
        text="Settings"
        title="Settings (g s)"
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
      <button
        class="text-xs text-gray-400 font-medium px-3 py-1.5 border border-gray-600 rounded transition-colors hover:text-gray-200 hover:bg-gray-700"
        @click="resetToDefaults"
      >
        Reset to Defaults
      </button>
    </template>
  </BaseModal>
</template>
