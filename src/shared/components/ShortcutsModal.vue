<script setup lang="ts">
import { Icon } from '#components'
import { onKeyUp } from '@vueuse/core'
import { computed, onMounted, provide, ref } from 'vue'
import { useShortcuts } from '~/modules/shortcuts/api'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

const { shortcutsByCategory, formatKeys, registerShortcut, getDefaultIconForCategory } = useShortcuts()

const isOpen = ref(false)

// Expose the open function globally for other shortcuts
function openModal(): void {
  isOpen.value = true
}

function closeModal(): void {
  isOpen.value = false
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

// Close on escape
onKeyUp('Escape', () => {
  if (isOpen.value) {
    closeModal()
  }
})

// Computed for footer
const totalShortcuts = computed(() =>
  shortcutsByCategory.value.reduce((total, cat) => total + cat.shortcuts.length, 0),
)
</script>

<template>
  <BaseModal
    :open="isOpen"
    title="Keyboard Shortcuts"
    description="Navigate MarkVim faster with these keyboard shortcuts"
    max-width="4xl"
    max-height="90vh"
    data-testid="keyboard-shortcuts-modal"
    @update:open="isOpen = $event"
    @close="closeModal"
  >
    <template #trigger>
      <BaseButton
        v-feature="'shortcuts'"
        variant="icon"
        size="icon"
        icon="lucide:keyboard"
        title="Keyboard shortcuts (Shift + ?)"
        data-testid="keyboard-shortcuts-button"
        icon-only
        @click="openModal"
      />
    </template>

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
              <kbd
                v-for="(key, index) in formatKeys(shortcut.keys).split(/(?=[⌘⌃⌥⇧])|(?<=\w)(?=[⌘⌃⌥⇧])/)"
                :key="index"
                class="text-xs text-text-primary font-mono px-1.5 border border-border rounded bg-surface-primary inline-flex h-6 min-w-[1.5rem] shadow-sm items-center justify-center"
                :class="[
                  key.match(/[⌘⌃⌥⇧]/) ? 'min-w-[1.25rem] px-1' : '',
                ]"
              >
                {{ key }}
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer-left>
      Press <kbd class="text-xs text-text-primary font-mono px-1 border border-border rounded bg-surface-primary inline-flex h-5 min-w-[1.5rem] items-center justify-center">⎋</kbd> to close
    </template>

    <template #footer-right>
      {{ totalShortcuts }} shortcuts available
    </template>
  </BaseModal>
</template>
