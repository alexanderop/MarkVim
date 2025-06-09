<script setup lang="ts">
import { useEditorSettings, useShortcuts } from '#imports'
import { useTheme } from '@/composables/useTheme'

const { settings, toggleVimMode, updateFontSize, resetToDefaults, togglePreviewSync } = useEditorSettings()
const { showSettings, closeSettings, openSettings } = useShortcuts()
const { theme } = useTheme()

const themes = ['light', 'dark', 'auto']
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
        data-testid="settings-modal-trigger"
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
          <div class="p-3 border border-subtle rounded-lg bg-surface-secondary flex items-center justify-between">
            <div>
              <h4 class="text-sm text-text-bright font-medium">
                Vim Mode
              </h4>
              <p class="text-xs text-text-secondary">
                Enable vim keybindings
              </p>
            </div>
            <SwitchRoot
              :model-value="settings.vimMode"
              class="rounded-full inline-flex h-5 w-9 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background" :class="[
                settings.vimMode ? 'bg-accent' : 'bg-border',
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

          <div class="p-3 border border-subtle rounded-lg bg-surface-secondary flex items-center justify-between">
            <div>
              <h4 class="text-sm text-text-bright font-medium">
                Synchronized Scrolling
              </h4>
              <p class="text-xs text-text-secondary">
                Sync scroll position in split view
              </p>
            </div>
            <SwitchRoot
              :model-value="settings.previewSync"
              class="rounded-full inline-flex h-5 w-9 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background" :class="[
                settings.previewSync ? 'bg-accent' : 'bg-border',
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
        <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-2 uppercase">
          Appearance
        </h3>
        <div class="space-y-2">
          <!-- Theme and Font Size in one row -->
          <div class="p-3 border border-subtle rounded-lg bg-surface-secondary">
            <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <h4 class="text-sm text-text-bright font-medium mb-2">
                  Theme
                </h4>
                <div class="flex gap-1 p-1 bg-surface-primary rounded-lg">
                  <button
                    v-for="themeOption in themes"
                    :key="themeOption"
                    class="text-xs font-medium px-3 py-1.5 rounded-md capitalize transition-colors w-full"
                    :class="[
                      theme === themeOption
                        ? 'bg-accent text-white shadow-md'
                        : 'text-text-secondary hover:text-text-primary',
                    ]"
                    :data-testid="`theme-${themeOption}-btn`"
                    @click="theme = themeOption"
                  >
                    {{ themeOption }}
                  </button>
                </div>
              </div>

              <div>
                <h4 class="text-sm text-text-bright font-medium mb-2">
                  Font Size
                </h4>
                <div class="flex gap-2 items-center">
                  <button
                    class="p-1 rounded hover:bg-surface-hover text-text-secondary hover:text-text-primary"
                    @click="updateFontSize(settings.fontSize - 1)"
                  >
                    <Icon name="heroicons:minus" class="h-3 w-3" />
                  </button>
                  <span class="text-sm text-text-primary font-mono text-center min-w-[3rem]">{{ settings.fontSize }}px</span>
                  <button
                    class="p-1 rounded hover:bg-surface-hover text-text-secondary hover:text-text-primary"
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
        <h3 class="text-xs text-text-secondary tracking-wider font-medium mb-2 uppercase">
          Advanced
        </h3>
        <div class="space-y-2">
          <!-- Line Numbers -->
          <div class="p-3 border border-subtle rounded-lg bg-surface-secondary">
            <div class="space-y-2">
              <label class="flex gap-2 items-center">
                <input
                  v-model="settings.lineNumbers"
                  type="checkbox"
                  class="border-border rounded h-3 w-3 text-accent focus:ring-accent"
                >
                <span class="text-sm text-text-bright font-medium">Show Line Numbers</span>
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
          <div class="p-3 border border-subtle rounded-lg bg-surface-secondary">
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
      <button
        class="text-xs text-text-secondary font-medium px-3 py-1.5 border border-border rounded transition-colors hover:text-text-primary hover:bg-surface-hover"
        @click="resetToDefaults"
      >
        Reset to Defaults
      </button>
    </template>
  </BaseModal>
</template>
