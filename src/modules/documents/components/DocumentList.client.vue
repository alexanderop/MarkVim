<script setup lang="ts">
import type { Document as DocType } from '~/modules/documents/api'
import { Icon, UButton } from '#components'
import { useDocumentsStore } from '~/modules/documents/api'
import { vFeature } from '~/modules/feature-flags/api'
import DocumentItemClient from './DocumentItem.client.vue'

const { documents, activeDocumentId } = defineProps<{
  documents: DocType[]
  activeDocumentId: string
}>()

const documentsStore = useDocumentsStore()

function handleCreateDocument(): void {
  documentsStore.dispatch({ type: 'CREATE_DOCUMENT' })
}
</script>

<template>
  <aside
    v-feature="'documents'"
    aria-label="Documents"
    data-testid="document-list"
    class="border-r border-[var(--border)] bg-[var(--background)] flex flex-col h-full w-72"
  >
    <!-- Header -->
    <div class="px-4 py-3 md:py-0 border-b border-[var(--border)] flex h-14 items-center justify-between">
      <div class="flex gap-3 items-center">
        <h2 class="text-base md:text-sm text-[var(--foreground)] font-medium">
          Notes
        </h2>
        <div class="rounded-full bg-[var(--muted)] flex h-5 w-5 items-center justify-center">
          <span class="text-xs text-[var(--foreground)] opacity-70 font-medium">{{ documents.length }}</span>
        </div>
      </div>

      <UButton
        data-testid="create-document-btn"
        color="primary"
        variant="solid"
        size="sm"
        icon="i-lucide-plus"
        square
        title="New note"
        class="shadow-lg"
        @click="handleCreateDocument"
      />
    </div>

    <!-- Document List -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-2">
        <div
          v-for="(document, index) in documents"
          :key="document.id"
          class="group mb-1 relative last:mb-0"
          :data-testid="`document-item-${index}`"
        >
          <DocumentItemClient
            :document="document"
            :is-active="document.id === activeDocumentId"
            :index="index"
          />

          <!-- Separator line (except for last item) -->
          <div
            v-if="index < documents.length - 1"
            class="mx-3 mt-1 bg-[var(--border)] h-px"
          />
        </div>

        <!-- Empty state -->
        <div
          v-if="documents.length === 0"
          class="py-12 text-center flex flex-col items-center justify-center"
        >
          <div class="mb-3 rounded-lg bg-[var(--muted)] flex h-12 w-12 items-center justify-center">
            <Icon
              name="lucide:file-plus"
              class="text-[var(--foreground)] opacity-50 h-6 w-6"
            />
          </div>
          <p class="text-sm text-[var(--foreground)] opacity-70 mb-1">
            No notes yet
          </p>
          <p class="text-xs text-[var(--foreground)] opacity-50">
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
