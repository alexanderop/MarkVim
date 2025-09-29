<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { computed, ref } from 'vue'
import { onAppEvent } from '@/shared/utils/eventBus'
import { ColorThemeModal, useColorThemeStore } from '~/modules/color-theme/api'
import { DocumentActionManager, DocumentList, DocumentListSkeleton, getDocumentTitle, useDocumentsProxy } from '~/modules/documents/api'
import { MarkdownEditor, MarkdownEditorSkeleton, useEditorSettings } from '~/modules/editor/api'
import { HeaderToolbar, StatusBar, useResizablePanes, useSyncedScroll, useViewMode } from '~/modules/layout/api'
import { MarkdownPreview } from '~/modules/markdown-preview/api'
import { ShareManager } from '~/modules/share/api'
import { ShortcutsManager } from '~/modules/shortcuts/api'
import ResizableSplitter from '~/shared/components/ResizableSplitter.vue'

const isMobile = useMediaQuery('(max-width: 768px)')

const { documents, activeDocumentId, activeDocument, updateDocument } = useDocumentsProxy()

const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()
const { settings } = useEditorSettings()
const { viewMode, isPreviewVisible, isSplitView, isEditorVisible, setViewMode, isSidebarVisible } = useViewMode()

useColorThemeStore()

const previewSyncEnabled = computed(() => settings.value.previewSync && isSplitView.value)
const { editorScrollContainer, previewScrollContainer } = useSyncedScroll(previewSyncEnabled)

const shortcutsManagerRef = ref()

const activeDocumentTitle = computed(() => {
  return activeDocument.value
    ? getDocumentTitle(activeDocument.value.content)
    : 'MarkVim'
})

function handleSaveDocument() {
  if (!activeDocument.value)
    return

  const blob = new Blob([activeDocument.value.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${getDocumentTitle(activeDocument.value.content)}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// Listen to event bus events that affect AppShell state
onAppEvent('settings:save-document', () => {
  handleSaveDocument()
})

onAppEvent('document:select', () => {
  // Document selection is handled by the store, but we need to close sidebar on mobile
  if (isMobile.value) {
    isSidebarVisible.value = false
  }
})
</script>

<template>
  <div ref="containerRef" class="flex flex-col h-[100dvh] w-screen overflow-hidden">
    <HeaderToolbar
      :view-mode="viewMode"
      :is-mobile="isMobile"
      :active-document-title="activeDocumentTitle"
      :active-document="activeDocument"
      @update:view-mode="setViewMode"
    />

    <div class="flex flex-1 relative overflow-hidden">
      <ClientOnly>
        <DocumentList
          v-show="isSidebarVisible"
          :documents="documents"
          :active-document-id="activeDocumentId"
          :is-visible="isSidebarVisible"
          class="w-72 transition-all duration-300 ease-out fixed md:relative h-full z-20 md:z-auto bg-surface-primary shadow-2xl md:shadow-none" :class="[
            isSidebarVisible
              ? 'transform translate-x-0 opacity-100'
              : 'transform -translate-x-full opacity-0 pointer-events-none',
          ]"
        />
        <template #fallback>
          <DocumentListSkeleton
            v-show="isSidebarVisible"
            class="w-72 transition-all duration-300 ease-out fixed md:relative h-full z-20 md:z-auto bg-surface-primary shadow-2xl md:shadow-none" :class="[
              isSidebarVisible
                ? 'transform translate-x-0 opacity-100'
                : 'transform -translate-x-full opacity-0 pointer-events-none',
            ]"
          />
        </template>
      </ClientOnly>

      <!-- Mobile overlay when sidebar is open -->
      <button
        v-if="isSidebarVisible && isMobile"
        type="button"
        class="bg-black/50 inset-0 fixed z-10 md:hidden cursor-default"
        aria-label="Close sidebar"
        @click="isSidebarVisible = false"
      />

      <div class="bg-surface-primary/30 flex flex-1 flex-col overflow-hidden">
        <div
          class="flex flex-1 flex-col relative overflow-hidden md:flex-row" :class="[
            !isSplitView && !isMobile ? 'md:justify-center md:items-center' : '',
            isDragging ? 'select-none' : '',
          ]"
        >
          <div
            v-if="isEditorVisible"
            ref="editorScrollContainer"
            data-testid="editor-pane"
            class="w-full transition-all duration-300 ease-in-out overflow-auto" :class="[
              isSplitView ? 'md:border-r border-gray-800' : '',
              isSplitView && isMobile ? 'h-1/2' : 'h-full',
              !isSplitView && !isMobile ? 'md:max-w-6xl md:h-[90vh] md:rounded-lg md:border md:border-gray-800 md:shadow-2xl' : '',
              isDragging ? 'opacity-90' : '',
            ]"
            :style="{
              transform: isEditorVisible ? 'translateX(0)' : 'translateX(-100%)',
              width: isSplitView && !isMobile ? `${leftPaneWidth}%` : '100%',
            }"
          >
            <ClientOnly>
              <MarkdownEditor
                :content="activeDocument?.content || ''"
                :settings="settings"
                class="h-full"
                @update:content="(value) => activeDocument && updateDocument(activeDocument.id, { content: value })"
              />
              <template #fallback>
                <MarkdownEditorSkeleton />
              </template>
            </ClientOnly>
          </div>

          <ResizableSplitter
            v-if="isSplitView"
            :is-dragging="isDragging"
            data-testid="resize-splitter"
            class="hidden md:block"
            @start-drag="startDrag"
          />

          <div
            v-if="isPreviewVisible"
            ref="previewScrollContainer"
            data-testid="preview-pane"
            class="w-full transition-all duration-300 ease-in-out overflow-hidden" :class="[
              isSplitView && isMobile ? 'h-1/2' : 'h-full',
              !isSplitView && !isMobile ? 'md:max-w-6xl md:h-[90vh] md:rounded-lg md:border md:border-gray-800 md:shadow-2xl' : '',
              isDragging ? 'opacity-90' : '',
            ]"
            :style="{
              transform: isPreviewVisible ? 'translateX(0)' : 'translateX(100%)',
              width: isSplitView && !isMobile ? `${rightPaneWidth}%` : '100%',
            }"
          >
            <MarkdownPreview
              :content="activeDocument?.content || ''"
              class="h-full"
            />
          </div>

          <div
            v-if="isDragging"
            class="bg-black/5 pointer-events-none transition-opacity duration-200 inset-0 fixed z-10"
          />
        </div>
      </div>
    </div>

    <StatusBar
      :line-count="activeDocument?.content.split('\n').length || 0"
      :character-count="activeDocument?.content.length || 0"
      :format-keys="shortcutsManagerRef?.formatKeys || ((k: string) => k)"
      :show-vim-mode="settings.vimMode"
    />

    <ShortcutsManager ref="shortcutsManagerRef" />

    <DocumentActionManager />

    <ShareManager />

    <ColorThemeModal />
  </div>
</template>
