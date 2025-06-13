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
  dataTestid?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
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
        :data-testid="props.dataTestid"
        class="bg-surface-primary border border-subtle flex flex-col gap-3 w-full shadow-2xl shadow-black/40 ring-1 ring-white/10 translate-x-[-50%] translate-y-[-50%] duration-200 left-[50%] top-[50%] fixed z-50 overflow-hidden rounded-lg p-0"
        :class="[maxWidthClasses[props.maxWidth]]"
        :style="{ maxHeight: props.maxHeight }"
      >
        <div class="p-4 border-b border-subtle flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold text-text-bright">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="text-text-secondary text-sm mt-1">
              {{ description }}
            </DialogDescription>
          </div>

          <DialogClose v-if="showCloseButton" as-child>
            <BaseButton
              variant="icon"
              size="icon"
              icon="lucide:x"
              icon-only
              title="Close"
              @click="handleClose"
            />
          </DialogClose>
        </div>

        <div class="px-4 py-2 flex-1 overflow-y-auto">
          <slot />
        </div>

        <div v-if="footerLeft || footerRight || $slots.footer || $slots['footer-left'] || $slots['footer-right']" class="p-3 bg-surface-primary/60 border-t border-subtle flex items-center justify-between">
          <div class="text-xs text-text-tertiary">
            <slot name="footer-left">
              {{ footerLeft || '' }}
            </slot>
          </div>

          <div class="text-xs text-text-tertiary">
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
  background: var(--border);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

.glass-modal {
  background: var(--background);
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 10px 10px -5px rgb(0 0 0 / 0.04);
}

.divider {
  height: 1px;
  background: var(--border);
}

.divider:hover,
.divider.hover {
  background: var(--accent);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
