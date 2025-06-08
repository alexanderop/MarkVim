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
      <DialogOverlay class="bg-black/50 inset-0 fixed z-50 backdrop-blur-sm" />

      <DialogContent
        class="bg-background p-6 border flex flex-col gap-3 grid w-full shadow-lg translate-x-[-50%] translate-y-[-50%] duration-200 left-[50%] top-[50%] fixed z-50 overflow-hidden sm:rounded-lg"
        :class="[maxWidthClasses[maxWidth]]"
        :style="{ maxHeight }"
      >
        <!-- Header -->
        <div class="pb-2 flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="text-muted-foreground text-sm">
              {{ description }}
            </DialogDescription>
          </div>

          <DialogClose v-if="showCloseButton" as-child>
            <button
              class="ring-offset-background focus:ring-ring rounded-sm opacity-70 transition-opacity focus:outline-none hover:opacity-100 disabled:pointer-events-none focus:ring-2 focus:ring-offset-2"
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
