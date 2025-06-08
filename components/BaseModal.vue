<script setup lang="ts">
interface Props {
  open: boolean
  title: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  maxHeight?: string
  footerLeft?: string
  footerRight?: string
  showCloseButton?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}

withDefaults(defineProps<Props>(), {
  maxWidth: '3xl',
  maxHeight: '85vh',
  showCloseButton: true,
})

const emit = defineEmits<Emits>()

function handleClose() {
  emit('update:open', false)
  emit('close')
}

// Map maxWidth prop to Tailwind classes
const maxWidthClasses = {
  'sm': 'max-w-sm',
  'md': 'max-w-md',
  'lg': 'max-w-lg',
  'xl': 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
}
</script>

<template>
  <DialogRoot :open="open" @update:open="(newOpen) => $emit('update:open', newOpen)">
    <!-- Trigger slot for custom trigger button -->
    <slot name="trigger" />

    <DialogPortal>
      <DialogOverlay class="bg-black/70 inset-0 fixed z-50" />

      <DialogContent
        class="bg-gray-900 border border-gray-700 p-6 flex flex-col gap-3 w-full shadow-2xl translate-x-[-50%] translate-y-[-50%] duration-200 left-[50%] top-[50%] fixed z-50 overflow-hidden rounded-lg"
        :class="[maxWidthClasses[maxWidth]]"
        :style="{ maxHeight }"
      >
        <!-- Header -->
        <div class="pb-2 flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold text-gray-100">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="text-gray-400 text-sm mt-1">
              {{ description }}
            </DialogDescription>
          </div>

          <DialogClose v-if="showCloseButton" as-child>
            <button
              class="text-gray-400 hover:text-gray-100 hover:bg-gray-700/50 rounded-md p-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              @click="handleClose"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
              <span class="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        <!-- Content -->
        <div class="pr-2 flex-1 overflow-y-auto">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="footerLeft || footerRight || $slots.footer" class="pt-3 border-t border-gray-800 flex items-center justify-between">
          <div class="text-xs text-gray-500">
            <slot name="footer-left">
              {{ footerLeft || '' }}
            </slot>
          </div>

          <div class="text-xs text-gray-400">
            <slot name="footer-right">
              {{ footerRight || '' }}
            </slot>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* Custom scrollbar for modal content */
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
