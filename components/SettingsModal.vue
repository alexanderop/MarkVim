<script setup lang="ts">
const { settings, toggleVimMode, updateTheme, updateFontSize, resetToDefaults } = useEditorSettings()
</script>

<template>
  <DialogRoot>
    <DialogTrigger as-child>
      <button
        class="p-2 rounded-lg border border-editor-border bg-surface-secondary hover:bg-editor-hover transition-colors"
        title="Settings"
      >
        <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-text-primary" />
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <DialogContent class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-surface-primary border border-editor-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <DialogTitle class="text-xl font-semibold text-text-primary">
              Editor Settings
            </DialogTitle>
            <DialogClose as-child>
              <button class="p-1 rounded-lg hover:bg-editor-hover transition-colors">
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-text-secondary" />
              </button>
            </DialogClose>
          </div>

          <div class="space-y-6">
            <!-- Vim Mode Section -->
            <div>
              <h3 class="text-lg font-medium text-text-primary mb-3">Editor Behavior</h3>
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
                
                <div v-if="settings.vimMode" class="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-editor-border">
                  <div class="flex flex-col">
                    <h4 class="text-text-primary font-medium">Custom Vim Keybindings</h4>
                    <p class="text-text-secondary text-sm">Enable custom shortcuts like 'jj' → Escape</p>
                  </div>
                  <button
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-editor-active focus:ring-offset-2 focus:ring-offset-surface-primary',
                      settings.customVimKeybindings ? 'bg-editor-active' : 'bg-gray-600'
                    ]"
                    role="switch"
                    :aria-checked="settings.customVimKeybindings"
                    @click="settings.customVimKeybindings = !settings.customVimKeybindings"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.customVimKeybindings ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Appearance Section -->
            <div>
              <h3 class="text-lg font-medium text-text-primary mb-3">Appearance</h3>
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
              <h3 class="text-lg font-medium text-text-primary mb-3">Advanced</h3>
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

            <!-- Reset Button -->
            <div class="flex justify-end pt-4 border-t border-editor-border">
              <button
                class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-editor-border rounded-lg hover:bg-editor-hover transition-colors"
                @click="resetToDefaults"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template> 