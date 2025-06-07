<script setup lang="ts">
import { onKeyUp } from '@vueuse/core'

const { shortcutsByCategory, formatKeys, registerShortcut } = useShortcuts()

const isOpen = ref(false)

// Expose the open function globally for other shortcuts
const openModal = () => { isOpen.value = true }

  // Register keyboard shortcuts to open this modal
onMounted(() => {
  // Register for the actual "?" character instead of the key combination
  // This works better with useMagicKeys than trying to detect shift+/
  registerShortcut({
    keys: '?',
    description: 'Show keyboard shortcuts (?)',
    action: openModal,
    category: 'Help'
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
        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
        title="Keyboard shortcuts (Shift + ?)"
      >
        <Icon name="lucide:keyboard" class="w-4 h-4 mr-2" />
        Shortcuts
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      
      <DialogContent class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold">Keyboard Shortcuts</DialogTitle>
            <DialogDescription class="text-sm text-muted-foreground mt-1">
              Navigate MarkVim faster with these keyboard shortcuts
            </DialogDescription>
          </div>
          
          <DialogClose as-child>
            <button
              class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              @click="closeModal"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
              <span class="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto flex-1 pr-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="category in shortcutsByCategory"
              :key="category.name"
              class="space-y-3"
            >
              <h3 class="font-medium text-sm text-gray-400 uppercase tracking-wider">
                {{ category.name }}
              </h3>
              
              <div class="space-y-2">
                <div
                  v-for="shortcut in category.shortcuts"
                  :key="shortcut.keys"
                  class="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-800/50 transition-colors"
                >
                  <span class="text-sm text-gray-200">
                    {{ shortcut.description }}
                  </span>
                  
                  <div class="flex items-center space-x-1">
                    <kbd
                      v-for="(key, index) in formatKeys(shortcut.keys).split(/(?=[⌘⌃⌥⇧])|(?<=\w)(?=[⌘⌃⌥⇧])/)"
                      :key="index"
                      :class="[
                        'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-mono',
                        'bg-gray-700 text-gray-200 border border-gray-600 rounded shadow-sm',
                        key.match(/[⌘⌃⌥⇧]/) ? 'min-w-[1.25rem] px-1' : ''
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
        <div class="flex items-center justify-between pt-4 border-t border-gray-800">
          <div class="text-xs text-gray-500">
            Press <kbd class="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1 text-xs font-mono bg-gray-700 text-gray-200 border border-gray-600 rounded">⎋</kbd> to close
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