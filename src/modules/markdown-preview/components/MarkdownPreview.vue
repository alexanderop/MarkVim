<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useViewMode } from '~/modules/layout/api'
import { useMarkdown, useMermaid } from '~/modules/markdown-preview/api'
import { useKeyboardScroll } from '~/shared/composables/useKeyboardScroll'

const { content } = defineProps<{
  content: string
}>()

const root = ref<HTMLElement>()
const scrollContainer = useTemplateRef<HTMLElement>('scrollContainer')

// Create computed for markdown content from props
const markdownContent = computed(() => content)

// Initialize markdown renderer internally
const { renderedMarkdown } = useMarkdown(markdownContent)

// Get the view mode state to detect when preview becomes visible
const { viewMode, isPreviewVisible } = useViewMode()

// Use the keyboard scroll composable
useKeyboardScroll(scrollContainer)

// Function to focus the scroll container
function focusScrollContainer() {
  if (scrollContainer.value) {
    scrollContainer.value.focus()
  }
}

// Auto-focus the scroll container when mounted
onMounted(() => {
  focusScrollContainer()
})

// Watch for view mode changes and refocus when preview is visible
watch(viewMode, () => {
  if (isPreviewVisible.value) {
    nextTick(() => {
      focusScrollContainer()
    })
  }
})

// Initialize Mermaid only on client side
const { setupMermaid, renderDiagrams, cleanup } = useMermaid(root)

onMounted(async () => {
  await setupMermaid()
})

onUnmounted(() => {
  cleanup()
})

watch(() => renderedMarkdown.value, () => nextTick(renderDiagrams))
</script>

<template>
  <div class="bg-[var(--background)] flex flex-col h-full w-full">
    <div class="px-6 border-b border-[var(--border)] bg-[var(--background)] flex flex-shrink-0 h-10 items-center justify-between">
      <div class="flex items-center space-x-4">
        <Icon
          name="lucide:eye"
          class="text-[var(--foreground)] h-4 w-4"
        />
        <span class="text-xs text-[var(--foreground)] opacity-70">Use ↑↓ or j/k to scroll</span>
      </div>
    </div>

    <div
      ref="scrollContainer"
      class="bg-[var(--background)] flex-1 min-h-0 overflow-auto focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20 focus:ring-inset transition-all"
      tabindex="0"
    >
      <div
        ref="root"
        class="mx-auto px-12 py-12 max-w-none"
      >
        <article
          class="prose-lg max-w-none prose"
          data-testid="rendered-markdown-article"
          v-html="renderedMarkdown"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Synchronized scrolling */
.preview-sync {
  border: 1px solid var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}
</style>
