<script setup lang="ts">
import { useShortcuts } from '#imports'
import { onKeyUp } from '@vueuse/core'
import { computed, onMounted, provide, ref } from 'vue'

const { shortcutsByCategory, formatKeys, registerShortcut } = useShortcuts()

const isOpen = ref(false)

// Expose the open function globally for other shortcuts
function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

// Register keyboard shortcuts to open this modal
onMounted(() => {
  // Register for the actual "?" character instead of the key combination
  // This works better with useMagicKeys than trying to detect shift+/
  registerShortcut({
    keys: '?',
    description: 'Show keyboard shortcuts (?)',
    action: openModal,
    category: 'Help',
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
    @update:open="isOpen = $event"
    @close="closeModal"
  >
    <template #trigger>
      <ToolbarButton
        variant="toggle"
        icon="lucide:keyboard"
        text="Shortcuts"
        title="Keyboard shortcuts (Shift + ?)"
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
        <h3 class="text-xs text-gray-400 tracking-wider font-medium uppercase">
          {{ category.name }}
        </h3>

        <div class="space-y-2">
          <div
            v-for="shortcut in category.shortcuts"
            :key="shortcut.keys"
            class="px-3 py-2 rounded-md flex transition-colors items-center justify-between hover:bg-gray-800/50"
          >
            <span class="text-sm text-gray-200">
              {{ shortcut.description }}
            </span>

            <div class="flex items-center space-x-1">
              <kbd
                v-for="(key, index) in formatKeys(shortcut.keys).split(/(?=[⌘⌃⌥⇧])|(?<=\w)(?=[⌘⌃⌥⇧])/)"
                :key="index"
                class="text-xs text-gray-200 font-mono px-1.5 border border-gray-600 rounded bg-gray-700 inline-flex h-6 min-w-[1.5rem] shadow-sm items-center justify-center" :class="[
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
      Press <kbd class="text-xs text-gray-200 font-mono px-1 border border-gray-600 rounded bg-gray-700 inline-flex h-5 min-w-[1.5rem] items-center justify-center">⎋</kbd> to close
    </template>

    <template #footer-right>
      {{ totalShortcuts }} shortcuts available
    </template>
  </BaseModal>
</template>
