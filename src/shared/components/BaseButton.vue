<script setup lang="ts">
const {
  variant = 'default',
  size = 'md',
  disabled = false,
  type = 'button',
  iconOnly = false,
  dataTestid,
  title,
  icon,
  class: className,
} = defineProps<{
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  dataTestid?: string
  title?: string
  icon?: string
  iconOnly?: boolean
  class?: any
}>()

defineEmits<Emits>()

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    default: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border',
    primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
    secondary: 'bg-surface-primary text-text-primary hover:bg-surface-hover border border-border',
    destructive: 'bg-error text-accent-foreground hover:bg-error-hover focus:ring-error focus:ring-offset-surface-primary',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
    icon: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg',
  }

  const sizes = {
    sm: iconOnly ? 'h-6 w-6 p-1' : 'text-xs px-2 py-1 h-6',
    md: iconOnly ? 'h-8 w-8 p-1.5' : 'text-sm px-4 py-2 h-8',
    lg: iconOnly ? 'h-10 w-10 p-2' : 'text-sm px-6 py-2.5 h-10',
    icon: 'h-8 w-8 p-1.5',
  }

  return [
    base,
    variants[variant],
    sizes[size],
    className,
  ].filter(Boolean).join(' ')
})

const iconClasses = computed(() => {
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    icon: 'h-4 w-4',
  }

  const hasSlotContent = !!useSlots().default
  return [
    iconSizes[size],
    !iconOnly && hasSlotContent ? 'mr-2' : '',
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :data-testid="dataTestid"
    :title="title"
    :type="type"
    @click="$emit('click', $event)"
  >
    <Icon v-if="icon" :name="icon" :class="iconClasses" />
    <slot />
  </button>
</template>
