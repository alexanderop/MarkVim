<script setup lang="ts">
import type { EditorSettings } from '#imports'
import { useEditorSettings, useShortcuts } from '#imports'

const { settings, toggleVimMode, updateFontSize, resetToDefaults, updateTheme } = useEditorSettings()
const { showSettings, closeSettings, openSettings } = useShortcuts()
const themes: EditorSettings['theme'][] = ['dark', 'light', 'auto']
</script>

<template>
  <DialogRoot :open="showSettings" @update:open="(open) => !open && closeSettings()">
    <DialogTrigger as-child>
      <button
        class="bg-background border-input ring-offset-background focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground text-sm font-medium px-4 py-2 border rounded-md inline-flex h-10 transition-colors items-center justify-center focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-offset-2"
        title="Settings (g s)"
        @click="openSettings"
      >
        <Icon name="lucide:settings" class="mr-2 h-4 w-4" />
        Settings
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="bg-black/50 inset-0 fixed z-50 backdrop-blur-sm" />

      <DialogContent class="bg-background p-6 border flex flex-col gap-4 grid max-h-[90vh] max-w-4xl w-full shadow-lg translate-x-[-50%] translate-y-[-50%] duration-200 left-[50%] top-[50%] fixed z-50 overflow-hidden sm:rounded-lg">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold">
              Settings
            </DialogTitle>
            <DialogDescription class="text-muted-foreground text-sm mt-1">
              Configure your MarkVim editor preferences
            </DialogDescription>
          </div>

          <DialogClose as-child>
            <button
              class="ring-offset-background focus:ring-ring rounded-sm opacity-70 transition-opacity focus:outline-none hover:opacity-100 disabled:pointer-events-none focus:ring-2 focus:ring-offset-2"
              @click="closeSettings"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
              <span class="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        <!-- Content -->
        <div class="pr-2 flex-1 overflow-y-auto">
          <div class="space-y-6">
            <!-- Vim Mode Section -->
            <div>
              <h3 class="text-sm text-gray-400 tracking-wider font-medium uppercase">
                Editor Behavior
              </h3>
              <div class="space-y-4">
                <div class="p-4 border border-editor-border rounded-lg bg-surface-secondary flex items-center justify-between">
                  <div class="flex flex-col">
                    <h4 class="text-text-primary font-medium">
                      Vim Mode
                    </h4>
                    <p class="text-sm text-text-secondary">
                      Enable vim keybindings for the editor
                    </p>
                  </div>
                  <button
                    class="rounded-full inline-flex h-6 w-11 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-editor-active focus:ring-offset-surface-primary focus:ring-offset-2" :class="[
                      settings.vimMode ? 'bg-editor-active' : 'bg-gray-600',
                    ]"
                    role="switch"
                    :aria-checked="settings.vimMode"
                    @click="toggleVimMode"
                  >
                    <span
                      class="rounded-full bg-white h-4 w-4 inline-block transform transition-transform" :class="[
                        settings.vimMode ? 'translate-x-6' : 'translate-x-1',
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Appearance Section -->
            <div>
              <h3 class="text-sm text-gray-400 tracking-wider font-medium uppercase">
                Appearance
              </h3>
              <div class="space-y-4">
                <!-- Theme Selection -->
                <div class="p-4 border border-editor-border rounded-lg bg-surface-secondary">
                  <h4 class="text-text-primary font-medium mb-2">
                    Theme
                  </h4>
                  <div class="flex gap-2">
                    <button
                      v-for="theme in themes"
                      :key="theme"
                      class="text-sm font-medium px-3 py-2 rounded-md capitalize transition-colors" :class="[
                        settings.theme === theme
                          ? 'bg-editor-active text-white'
                          : 'bg-editor-border text-text-secondary hover:bg-editor-hover',
                      ]"
                      @click="updateTheme(theme)"
                    >
                      {{ theme }}
                    </button>
                  </div>
                </div>

                <!-- Font Size -->
                <div class="p-4 border border-editor-border rounded-lg bg-surface-secondary">
                  <h4 class="text-text-primary font-medium mb-2">
                    Font Size
                  </h4>
                  <div class="flex gap-3 items-center">
                    <button
                      class="p-1 rounded hover:bg-editor-hover"
                      @click="updateFontSize(settings.fontSize - 1)"
                    >
                      <Icon name="heroicons:minus" class="text-text-secondary h-4 w-4" />
                    </button>
                    <span class="text-text-primary font-mono">{{ settings.fontSize }}px</span>
                    <button
                      class="p-1 rounded hover:bg-editor-hover"
                      @click="updateFontSize(settings.fontSize + 1)"
                    >
                      <Icon name="heroicons:plus" class="text-text-secondary h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Advanced Settings -->
            <div>
              <h3 class="text-sm text-gray-400 tracking-wider font-medium uppercase">
                Advanced
              </h3>
              <div class="space-y-4">
                <!-- Line Numbers Configuration -->
                <div class="p-4 border border-editor-border rounded-lg bg-surface-secondary">
                  <h4 class="text-text-primary font-medium mb-3">
                    Line Numbers
                  </h4>
                  <div class="space-y-3">
                    <label class="flex gap-2 items-center">
                      <input
                        v-model="settings.lineNumbers"
                        type="checkbox"
                        class="border-editor-border rounded"
                      >
                      <span class="text-sm text-text-primary">Show Line Numbers</span>
                    </label>

                    <div v-if="settings.lineNumbers" class="ml-6 space-y-2">
                      <div class="text-xs text-text-secondary mb-2">
                        Line Number Mode:
                      </div>
                      <div class="space-y-2">
                        <label class="flex gap-2 items-center">
                          <input
                            v-model="settings.lineNumberMode"
                            type="radio"
                            value="absolute"
                            class="border-editor-border rounded-full"
                          >
                          <span class="text-sm text-text-primary">Absolute (1, 2, 3...)</span>
                        </label>
                        <label class="flex gap-2 items-center">
                          <input
                            v-model="settings.lineNumberMode"
                            type="radio"
                            value="relative"
                            class="border-editor-border rounded-full"
                          >
                          <span class="text-sm text-text-primary">Relative (0, 1, 2... from cursor)</span>
                        </label>
                        <label class="flex gap-2 items-center">
                          <input
                            v-model="settings.lineNumberMode"
                            type="radio"
                            value="both"
                            class="border-editor-border rounded-full"
                          >
                          <span class="text-sm text-text-primary">Hybrid (absolute on current, relative on others)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Other Settings -->
                <div class="p-4 border border-editor-border rounded-lg bg-surface-secondary">
                  <div class="gap-4 grid grid-cols-2">
                    <label class="flex gap-2 items-center">
                      <input
                        v-model="settings.lineWrapping"
                        type="checkbox"
                        class="border-editor-border rounded"
                      >
                      <span class="text-sm text-text-primary">Line Wrapping</span>
                    </label>
                    <label class="flex gap-2 items-center">
                      <input
                        v-model="settings.autoSave"
                        type="checkbox"
                        class="border-editor-border rounded"
                      >
                      <span class="text-sm text-text-primary">Auto Save</span>
                    </label>
                    <label class="flex gap-2 items-center">
                      <input
                        v-model="settings.livePreview"
                        type="checkbox"
                        class="border-editor-border rounded"
                      >
                      <span class="text-sm text-text-primary">Live Preview</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
          <div class="text-xs text-gray-500">
            Press <kbd class="text-xs text-gray-200 font-mono px-1 border border-gray-600 rounded bg-gray-700 inline-flex h-5 min-w-[1.5rem] items-center justify-center">⎋</kbd> to close
          </div>

          <button
            class="text-sm text-gray-400 font-medium px-4 py-2 border border-gray-600 rounded-lg transition-colors hover:text-gray-200 hover:bg-gray-700"
            @click="resetToDefaults"
          >
            Reset to Defaults
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* Custom scrollbar for the settings content */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
