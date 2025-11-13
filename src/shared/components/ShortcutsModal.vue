<script setup lang="ts">
import { Icon, UButton, UKbd, UModal } from '#components'
import { useShortcuts } from '@modules/shortcuts'
import { computed, onMounted, provide, ref } from 'vue'

const { shortcutsByCategory, formatKeys, registerShortcut, getDefaultIconForCategory } = useShortcuts()

const isOpen = ref(false)

// Expose the open function globally for other shortcuts
function openModal(): void {
  isOpen.value = true
}

// Register keyboard shortcuts to open this modal
onMounted(() => {
  // Register for the actual "?" character instead of the key combination
  // This works better with useMagicKeys than trying to detect shift+/
  registerShortcut({
    keys: '?',
    description: 'Show keyboard shortcuts',
    action: openModal,
    category: 'Help',
    icon: 'lucide:help-circle',
  })
})

// Provide a way for other components to open the modal
provide('openShortcutsModal', openModal)

// Computed for footer
const totalShortcuts = computed(() =>
  shortcutsByCategory.value.reduce((total, cat) => total + cat.shortcuts.length, 0),
)
</script>

<template>
  <UButton
    v-feature="'shortcuts'"
    color="neutral"
    variant="ghost"
    size="md"
    icon="lucide:keyboard"
    title="Keyboard shortcuts (Shift + ?)"
    data-testid="keyboard-shortcuts-button"
    square
    @click="openModal"
  />

  <UModal
    v-model:open="isOpen"
    title="Keyboard Shortcuts"
    description="Navigate MarkVim faster with these keyboard shortcuts"
    :ui="{ content: 'max-w-4xl max-h-[90vh]' }"
    data-testid="keyboard-shortcuts-modal"
  >
    <template #body>
      <!-- Shortcuts Content -->
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
        <div
          v-for="category in shortcutsByCategory"
          :key="category.name"
          class="space-y-3"
        >
          <h3 class="text-xs text-text-secondary tracking-wider font-medium uppercase">
            {{ category.name }}
          </h3>

          <div class="space-y-2">
            <div
              v-for="shortcut in category.shortcuts"
              :key="shortcut.keys"
              class="px-3 py-2 rounded-md flex transition-colors items-center hover:bg-surface-hover"
              data-testid="shortcut-item"
            >
              <div class="flex items-center flex-1 min-w-0">
                <!-- Icon -->
                <div class="mr-3 flex-shrink-0">
                  <Icon
                    :name="shortcut.icon || getDefaultIconForCategory(shortcut.category || 'General')"
                    class="w-4 h-4 text-text-secondary"
                  />
                </div>

                <!-- Description -->
                <span class="text-sm text-text-primary flex-1 min-w-0">
                  {{ shortcut.description }}
                </span>
              </div>

              <!-- Keyboard shortcuts -->
              <div class="flex items-center space-x-1 ml-4">
                <UKbd
                  v-for="(key, index) in formatKeys(shortcut.keys).split(/(?=[⌘⌃⌥⇧])|(?<=\w)(?=[⌘⌃⌥⇧])/)"
                  :key="index"
                  size="lg"
                  color="neutral"
                  class="font-mono shadow-sm"
                  :class="[
                    key.match(/[⌘⌃⌥⇧]/) ? 'min-w-[1.25rem] px-1' : '',
                  ]"
                >
                  {{ key }}
                </UKbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full text-xs text-text-tertiary">
        <div>
          Press <UKbd
            size="md"
            color="neutral"
            class="font-mono"
          >
            ⎋
          </UKbd> to close
        </div>
        <div>
          {{ totalShortcuts }} shortcuts available
        </div>
      </div>
    </template>
  </UModal>
</template>
