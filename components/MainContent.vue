<script setup lang="ts">
interface LayoutState {
  isEditorVisible: boolean
  isPreviewVisible: boolean
  isSplitView: boolean
  isMobile: boolean
  leftPaneWidth: number
  rightPaneWidth: number
  isDragging: boolean
}

interface ContentState {
  markdown: string
  settings: any
  renderedMarkdown: string
}

interface Props {
  layout: LayoutState
  content: ContentState
}

interface Emits {
  (e: 'update:markdown', value: string): void
  (e: 'startDrag', event: PointerEvent): void
}

const { layout, content } = defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div
    class="flex flex-1 flex-col relative overflow-hidden md:flex-row" :class="[
      !layout.isSplitView && !layout.isMobile ? 'md:justify-center md:items-center' : '',
      layout.isDragging ? 'select-none' : '',
    ]"
  >
    <div
      v-if="layout.isEditorVisible"
      class="w-full transition-all duration-300 ease-in-out" :class="[
        layout.isSplitView ? 'md:border-r border-gray-800 border-b md:border-b-0' : '',
        layout.isSplitView ? 'h-1/2 md:h-full' : 'h-full',
        !layout.isSplitView && !layout.isMobile ? 'md:max-w-6xl md:h-[90vh] md:rounded-lg md:border md:border-gray-800 md:shadow-2xl' : '',
        layout.isDragging ? 'opacity-90' : '',
      ]"
      :style="{
        transform: layout.isEditorVisible ? 'translateX(0)' : 'translateX(-100%)',
        width: layout.isSplitView && !layout.isMobile ? `${layout.leftPaneWidth}%` : '100%',
      }"
    >
      <MarkdownEditor
        :model-value="content.markdown"
        :settings="content.settings"
        class="h-full"
        @update:model-value="$emit('update:markdown', $event)"
      />
    </div>

    <ResizableSplitter
      v-if="layout.isSplitView"
      :is-dragging="layout.isDragging"
      class="hidden md:block"
      @start-drag="$emit('startDrag', $event)"
    />

    <div
      v-if="layout.isPreviewVisible"
      class="w-full transition-all duration-300 ease-in-out overflow-hidden" :class="[
        layout.isSplitView ? 'h-1/2 md:h-full' : 'h-full',
        !layout.isSplitView && !layout.isMobile ? 'md:max-w-6xl md:h-[90vh] md:rounded-lg md:border md:border-gray-800 md:shadow-2xl' : '',
        layout.isDragging ? 'opacity-90' : '',
      ]"
      :style="{
        transform: layout.isPreviewVisible ? 'translateX(0)' : 'translateX(100%)',
        width: layout.isSplitView && !layout.isMobile ? `${layout.rightPaneWidth}%` : '100%',
      }"
    >
      <MarkdownPreview
        :rendered-html="content.renderedMarkdown"
        class="h-full"
      />
    </div>

    <!-- Drag overlay for better visual feedback -->
    <div
      v-if="layout.isDragging"
      class="bg-black/5 pointer-events-none transition-opacity duration-200 inset-0 fixed z-10"
    />
  </div>
</template>
