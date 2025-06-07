<script setup lang="ts">
const { settings, toggleVimMode, updateTheme, updateFontSize, resetToDefaults } = useEditorSettings()
const { showSettings, closeSettings, openSettings } = useShortcuts()
</script>

<template>
  <DialogRoot :open="showSettings" @update:open="(open) => !open && closeSettings()">
    <DialogTrigger as-child>
      <button
        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
        title="Settings (g s)"
        @click="openSettings"
      >
        <Icon name="lucide:settings" class="w-4 h-4 mr-2" />
        Settings
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      
      <DialogContent class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold">Settings</DialogTitle>
            <DialogDescription class="text-sm text-muted-foreground mt-1">
              Configure your MarkVim editor preferences
            </DialogDescription>
          </div>
          
          <DialogClose as-child>
            <button
              class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              @click="closeSettings"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
              <span class="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto flex-1 pr-2">

          <div class="space-y-6">
            <!-- Vim Mode Section -->
            <div>
              <h3 class="font-medium text-sm text-gray-400 uppercase tracking-wider">Editor Behavior</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-editor-border">
                  <div class="flex flex-col">
                    <h4 class="text-text-primary font-medium">Vim Mode</h4>
                    <p class="text-text-secondary text-sm">Enable vim keybindings for the editor</p>
                  </div>
                  <button
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-editor-active focus:ring-offset-2 focus:ring-offset-surface-primary',
                      settings.vimMode ? 'bg-editor-active' : 'bg-gray-600'
                    ]"
                    role="switch"
                    :aria-checked="settings.vimMode"
                    @click="toggleVimMode"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.vimMode ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
                

              </div>
            </div>

            <!-- Appearance Section -->
            <div>
              <h3 class="font-medium text-sm text-gray-400 uppercase tracking-wider">Appearance</h3>
              <div class="space-y-4">
                <!-- Theme Selection -->
                <div class="p-4 bg-surface-secondary rounded-lg border border-editor-border">
                  <h4 class="text-text-primary font-medium mb-2">Theme</h4>
                  <div class="flex gap-2">
                    <button
                      v-for="theme in ['dark', 'light', 'auto']"
                      :key="theme"
                      :class="[
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize',
                        settings.theme === theme
                          ? 'bg-editor-active text-white'
                          : 'bg-editor-border text-text-secondary hover:bg-editor-hover'
                      ]"
                      @click="updateTheme(theme as any)"
                    >
                      {{ theme }}
                    </button>
                  </div>
                </div>

                <!-- Font Size -->
                <div class="p-4 bg-surface-secondary rounded-lg border border-editor-border">
                  <h4 class="text-text-primary font-medium mb-2">Font Size</h4>
                  <div class="flex items-center gap-3">
                    <button
                      class="p-1 rounded hover:bg-editor-hover"
                      @click="updateFontSize(settings.fontSize - 1)"
                    >
                      <Icon name="heroicons:minus" class="w-4 h-4 text-text-secondary" />
                    </button>
                    <span class="text-text-primary font-mono">{{ settings.fontSize }}px</span>
                    <button
                      class="p-1 rounded hover:bg-editor-hover"
                      @click="updateFontSize(settings.fontSize + 1)"
                    >
                      <Icon name="heroicons:plus" class="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Advanced Settings -->
            <div>
              <h3 class="font-medium text-sm text-gray-400 uppercase tracking-wider">Advanced</h3>
              <div class="space-y-4">
                <!-- Line Numbers Configuration -->
                <div class="p-4 bg-surface-secondary rounded-lg border border-editor-border">
                  <h4 class="text-text-primary font-medium mb-3">Line Numbers</h4>
                  <div class="space-y-3">
                    <label class="flex items-center gap-2">
                      <input
                        v-model="settings.lineNumbers"
                        type="checkbox"
                        class="rounded border-editor-border"
                      >
                      <span class="text-text-primary text-sm">Show Line Numbers</span>
                    </label>
                    
                    <div v-if="settings.lineNumbers" class="ml-6 space-y-2">
                      <div class="text-text-secondary text-xs mb-2">Line Number Mode:</div>
                      <div class="space-y-2">
                        <label class="flex items-center gap-2">
                          <input
                            v-model="settings.lineNumberMode"
                            type="radio"
                            value="absolute"
                            class="rounded-full border-editor-border"
                          >
                          <span class="text-text-primary text-sm">Absolute (1, 2, 3...)</span>
                        </label>
                        <label class="flex items-center gap-2">
                          <input
                            v-model="settings.lineNumberMode"
                            type="radio"
                            value="relative"
                            class="rounded-full border-editor-border"
                          >
                          <span class="text-text-primary text-sm">Relative (0, 1, 2... from cursor)</span>
                        </label>
                        <label class="flex items-center gap-2">
                          <input
                            v-model="settings.lineNumberMode"
                            type="radio"
                            value="both"
                            class="rounded-full border-editor-border"
                          >
                          <span class="text-text-primary text-sm">Hybrid (absolute on current, relative on others)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Other Settings -->
                <div class="p-4 bg-surface-secondary rounded-lg border border-editor-border">
                  <div class="grid grid-cols-2 gap-4">
                    <label class="flex items-center gap-2">
                      <input
                        v-model="settings.lineWrapping"
                        type="checkbox"
                        class="rounded border-editor-border"
                      >
                      <span class="text-text-primary text-sm">Line Wrapping</span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        v-model="settings.autoSave"
                        type="checkbox"
                        class="rounded border-editor-border"
                      >
                      <span class="text-text-primary text-sm">Auto Save</span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        v-model="settings.livePreview"
                        type="checkbox"
                        class="rounded border-editor-border"
                      >
                      <span class="text-text-primary text-sm">Live Preview</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-800">
          <div class="text-xs text-gray-500">
            Press <kbd class="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1 text-xs font-mono bg-gray-700 text-gray-200 border border-gray-600 rounded">⎋</kbd> to close
          </div>
          
          <button
            class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
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