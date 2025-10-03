<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { ColorThemeModal, useColorThemeStore } from '~/modules/color-theme/api'
import { DocumentActionManager, DocumentList, DocumentListSkeleton, useDocumentsStore } from '~/modules/documents/api'
import { MarkdownEditor, MarkdownEditorSkeleton, useEditorSettings } from '~/modules/editor/api'
import { HeaderToolbar, StatusBar, useResizablePanes, useSyncedScroll, useViewMode } from '~/modules/layout/api'
import { MarkdownPreview } from '~/modules/markdown-preview/api'
import { ShareManager } from '~/modules/share/api'
import { ShortcutsManager } from '~/modules/shortcuts/api'
import ResizableSplitter from '~/shared/components/ResizableSplitter.vue'

const documentsStore = useDocumentsStore()
const { documents, activeDocument, activeDocumentId, activeDocumentTitle } = storeToRefs(documentsStore)

const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()
const { settings } = useEditorSettings()
const { viewMode, isPreviewVisible, isSplitView, isEditorVisible, setViewMode, isSidebarVisible, isMobile } = useViewMode()

useColorThemeStore()

const previewSyncEnabled = computed(() => settings.value.previewSync && isSplitView.value)
const { editorScrollContainer, previewScrollContainer } = useSyncedScroll(previewSyncEnabled)

function handleContentUpdate(value: string): void {
  if (activeDocument.value) {
    documentsStore.dispatch({ type: 'UPDATE_DOCUMENT', payload: { documentId: activeDocument.value.id, content: value } })
  }
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col h-[100dvh] w-screen overflow-hidden"
  >
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
          v-feature="'documents'"
          :documents="documents"
          :active-document-id="activeDocumentId"
          :is-visible="isSidebarVisible"
          class="w-72 transition-all duration-300 ease-out fixed md:relative h-full z-20 md:z-auto bg-surface-primary shadow-2xl md:shadow-none"
          :class="[
            isSidebarVisible
              ? 'transform translate-x-0 opacity-100'
              : 'transform -translate-x-full opacity-0 pointer-events-none',
          ]"
        />
        <template #fallback>
          <DocumentListSkeleton
            v-show="isSidebarVisible"
            class="w-72 transition-all duration-300 ease-out fixed md:relative h-full z-20 md:z-auto bg-surface-primary shadow-2xl md:shadow-none"
            :class="[
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
          class="flex flex-1 flex-col relative overflow-hidden md:flex-row"
          :class="[
            !isSplitView && !isMobile ? 'md:justify-center md:items-center' : '',
            isDragging ? 'select-none' : '',
          ]"
        >
          <div
            v-if="isEditorVisible"
            ref="editorScrollContainer"
            v-feature="'editor'"
            data-testid="editor-pane"
            class="w-full transition-all duration-300 ease-in-out overflow-auto"
            :class="[
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
                @update:content="handleContentUpdate"
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
            v-feature="'markdown-preview'"
            data-testid="preview-pane"
            class="w-full transition-all duration-300 ease-in-out overflow-hidden"
            :class="[
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
      :show-vim-mode="settings.vimMode"
    />

    <ShortcutsManager v-feature="'shortcuts'" />

    <DocumentActionManager v-feature="'documents'" />

    <ShareManager v-feature="'share'" />

    <ColorThemeModal v-feature="'color-theme'" />
  </div>
</template>
