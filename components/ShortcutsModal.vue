<script setup lang="ts">
import { useShortcuts } from '#imports'
import { onKeyUp } from '@vueuse/core'
import { onMounted, provide, ref } from 'vue'

const { shortcutsByCategory, formatKeys, registerShortcut } = useShortcuts()

const isOpen = ref(false)

// Expose the open function globally for other shortcuts
function openModal() {
  isOpen.value = true
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

function closeModal() {
  isOpen.value = false
}

// Close on escape
onKeyUp('Escape', () => {
  if (isOpen.value) {
    closeModal()
  }
})
</script>

<template>
  <DialogRoot v-model:open="isOpen">
    <DialogTrigger as-child>
      <button
        class="bg-background border-input ring-offset-background focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground text-sm font-medium px-4 py-2 border rounded-md inline-flex h-10 transition-colors items-center justify-center focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-offset-2"
        title="Keyboard shortcuts (Shift + ?)"
      >
        <Icon name="lucide:keyboard" class="mr-2 h-4 w-4" />
        Shortcuts
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="bg-black/50 inset-0 fixed z-50 backdrop-blur-sm" />

      <DialogContent class="bg-background p-6 border flex flex-col gap-4 grid max-h-[90vh] max-w-4xl w-full shadow-lg translate-x-[-50%] translate-y-[-50%] duration-200 left-[50%] top-[50%] fixed z-50 overflow-hidden sm:rounded-lg">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold">
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription class="text-muted-foreground text-sm mt-1">
              Navigate MarkVim faster with these keyboard shortcuts
            </DialogDescription>
          </div>

          <DialogClose as-child>
            <button
              class="ring-offset-background focus:ring-ring rounded-sm opacity-70 transition-opacity focus:outline-none hover:opacity-100 disabled:pointer-events-none focus:ring-2 focus:ring-offset-2"
              @click="closeModal"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
              <span class="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        <!-- Content -->
        <div class="pr-2 flex-1 overflow-y-auto">
          <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div
              v-for="category in shortcutsByCategory"
              :key="category.name"
              class="space-y-3"
            >
              <h3 class="text-sm text-gray-400 tracking-wider font-medium uppercase">
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
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
          <div class="text-xs text-gray-500">
            Press <kbd class="text-xs text-gray-200 font-mono px-1 border border-gray-600 rounded bg-gray-700 inline-flex h-5 min-w-[1.5rem] items-center justify-center">⎋</kbd> to close
          </div>

          <div class="text-xs text-gray-500">
            {{ shortcutsByCategory.reduce((total, cat) => total + cat.shortcuts.length, 0) }} shortcuts available
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* Custom scrollbar for the shortcuts content */
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
