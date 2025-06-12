<script setup lang="ts">
import type { Document as DocType } from '~/modules/documents/composables/useDocuments'

interface Props {
  documents: DocType[]
  activeDocumentId: string
  isVisible: boolean
}

interface Emits {
  (e: 'selectDocument', id: string): void
  (e: 'createDocument'): void
  (e: 'deleteDocument', id: string): void
}

const _props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getDocumentTitle } = useDocuments()

function handleDocumentClick(id: string) {
  emit('selectDocument', id)
}

function handleCreateDocument() {
  emit('createDocument')
}

function handleSelectDocument(id: string) {
  emit('selectDocument', id)
}

function handleDeleteDocument(id: string) {
  emit('deleteDocument', id)
}

function getDocumentPreview(content: string): string {
  const lines = content.split('\n')
  const firstNonHeaderLine = lines.find(line =>
    line.trim() && !line.trim().startsWith('#'),
  )
  return firstNonHeaderLine?.trim().slice(0, 60) || 'No content'
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}
</script>

<template>
  <aside
    v-if="isVisible"
    data-testid="document-list"
    class="border-r border-subtle bg-background flex flex-col h-full w-72"
  >
    <!-- Header -->
    <div class="px-4 border-b border-gray-200/10 flex h-14 items-center justify-between">
      <div class="flex gap-3 items-center">
        <h2 class="text-sm text-gray-100 font-medium">
          Notes
        </h2>
        <div class="rounded-full bg-gray-800/60 flex h-5 w-5 items-center justify-center">
          <span class="text-xs text-gray-400 font-medium">{{ documents.length }}</span>
        </div>
      </div>

      <button
        data-testid="create-document-btn"
        class="group text-white rounded-md bg-accent flex h-7 w-7 shadow-accent/20 shadow-lg transition-all duration-200 items-center justify-center hover:bg-accent-hover"
        title="New note"
        @click="handleCreateDocument"
      >
        <Icon
          name="lucide:plus"
          class="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
        />
      </button>
    </div>

    <!-- Document List -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-2">
        <div
          v-for="(document, index) in documents"
          :key="document.id"
          class="group mb-1 relative last:mb-0"
        >
          <ContextMenuRoot>
            <!-- Main document item -->
            <ContextMenuTrigger as-child>
              <div
                class="px-3 py-3 border rounded-lg cursor-pointer transition-all duration-200 relative"
                :class="[
                  document.id === activeDocumentId
                    ? 'bg-accent/10 border-accent/30 shadow-lg shadow-accent/5'
                    : 'border-transparent hover:bg-surface-hover hover:border-border',
                ]"
                @click="handleDocumentClick(document.id)"
              >
                <!-- Active indicator line -->
                <div
                  v-if="document.id === activeDocumentId"
                  class="rounded-full bg-accent h-6 w-1 left-0 top-1/2 absolute -translate-y-1/2"
                />

                <div class="flex gap-3 items-start">
                  <!-- Document icon -->
                  <div class="mt-0.5 flex-shrink-0">
                    <div
                      class="rounded-md flex h-6 w-6 transition-all duration-200 items-center justify-center"
                      :class="[
                        document.id === activeDocumentId
                          ? 'bg-accent/20 text-accent-brighter'
                          : 'bg-surface-primary text-text-tertiary group-hover:bg-surface-hover group-hover:text-text-secondary',
                      ]"
                    >
                      <Icon
                        name="lucide:file-text"
                        class="h-3.5 w-3.5"
                      />
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="mb-1 flex gap-2 items-center justify-between">
                      <h3
                        class="text-sm leading-tight font-medium truncate"
                        :class="[
                          document.id === activeDocumentId
                            ? 'text-gray-100'
                            : 'text-gray-300 group-hover:text-gray-200',
                        ]"
                      >
                        {{ getDocumentTitle(document.content) }}
                      </h3>
                      <span
                        class="text-xs flex-shrink-0 tabular-nums"
                        :class="[
                          document.id === activeDocumentId
                            ? 'text-blue-400'
                            : 'text-gray-500 group-hover:text-gray-400',
                        ]"
                      >
                        {{ formatDate(document.updatedAt) }}
                      </span>
                    </div>

                    <p
                      class="text-xs leading-relaxed truncate"
                      :class="[
                        document.id === activeDocumentId
                          ? 'text-gray-400'
                          : 'text-gray-500 group-hover:text-gray-400',
                      ]"
                    >
                      {{ getDocumentPreview(document.content) }}
                    </p>
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>

            <!-- Context Menu -->
            <ContextMenuPortal>
              <ContextMenuContent class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-1 min-w-[160px] z-50">
                <ContextMenuItem
                  class="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white rounded-md cursor-pointer transition-colors"
                  @click="handleSelectDocument(document.id)"
                >
                  <Icon name="lucide:mouse-pointer-click" class="h-4 w-4" />
                  Select
                </ContextMenuItem>

                <ContextMenuSeparator class="h-px bg-gray-700 my-1" />

                <ContextMenuItem
                  class="flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 hover:text-error-hover rounded-md cursor-pointer transition-colors"
                  @click="handleDeleteDocument(document.id)"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenuPortal>
          </ContextMenuRoot>

          <!-- Separator line (except for last item) -->
          <div
            v-if="index < documents.length - 1"
            class="mx-3 mt-1 bg-gray-800/30 h-px"
          />
        </div>

        <!-- Empty state -->
        <div
          v-if="documents.length === 0"
          class="py-12 text-center flex flex-col items-center justify-center"
        >
          <div class="mb-3 rounded-lg bg-gray-800/40 flex h-12 w-12 items-center justify-center">
            <Icon name="lucide:file-plus" class="text-gray-500 h-6 w-6" />
          </div>
          <p class="text-sm text-gray-400 mb-1">
            No notes yet
          </p>
          <p class="text-xs text-gray-500">
            Create your first note to get started
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions for active states */
.group:hover .group-hover\:text-gray-200 {
  transition: color 0.2s ease;
}

.group:hover .group-hover\:text-gray-400 {
  transition: color 0.2s ease;
}
</style>
