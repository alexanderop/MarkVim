<script setup lang="ts">
import type { Document } from '~/composables/useDocuments'

interface Props {
  documents: Document[]
  activeDocumentId: string
  isVisible: boolean
}

interface Emits {
  (e: 'select-document', id: string): void
  (e: 'create-document'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getDocumentTitle } = useDocuments()

function handleDocumentClick(id: string) {
  emit('select-document', id)
}

function handleCreateDocument() {
  emit('create-document')
}

function getDocumentPreview(content: string): string {
  const lines = content.split('\n')
  const firstNonHeaderLine = lines.find(line => 
    line.trim() && !line.trim().startsWith('#')
  )
  return firstNonHeaderLine?.trim().slice(0, 60) || 'No content'
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}
</script>

<template>
  <aside 
    v-if="isVisible"
    class="w-80 bg-gray-900/95 border-r border-gray-800 flex flex-col h-full"
  >
    <!-- Header -->
    <div class="p-4 border-b border-gray-800/50">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-medium text-gray-200">Notes</h2>
        <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{{ documents.length }}</span>
      </div>
      
      <button
        @click="handleCreateDocument"
        class="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all duration-200 font-medium text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Note
      </button>
    </div>

    <!-- Document List -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-2 space-y-1">
        <div
          v-for="document in documents"
          :key="document.id"
          @click="handleDocumentClick(document.id)"
          class="group px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 relative"
          :class="[
            document.id === activeDocumentId
              ? 'bg-blue-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
              : 'hover:bg-gray-800/60 border border-transparent'
          ]"
        >
          <!-- Active indicator -->
          <div
            v-if="document.id === activeDocumentId"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"
          />
          
          <div class="flex items-center gap-3">
            <!-- Document icon -->
            <div class="flex-shrink-0">
              <svg 
                class="w-4 h-4"
                :class="[
                  document.id === activeDocumentId
                    ? 'text-blue-400'
                    : 'text-gray-500 group-hover:text-gray-400'
                ]"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <h3 
                  class="font-medium text-sm truncate"
                  :class="[
                    document.id === activeDocumentId
                      ? 'text-gray-100'
                      : 'text-gray-300 group-hover:text-gray-200'
                  ]"
                >
                  {{ getDocumentTitle(document.content) }}
                </h3>
                <span 
                  class="text-xs flex-shrink-0"
                  :class="[
                    document.id === activeDocumentId
                      ? 'text-blue-400'
                      : 'text-gray-500'
                  ]"
                >
                  {{ formatDate(document.updatedAt) }}
                </span>
              </div>
              
              <p 
                class="text-xs line-clamp-1 leading-relaxed"
                :class="[
                  document.id === activeDocumentId
                    ? 'text-gray-400'
                    : 'text-gray-500 group-hover:text-gray-400'
                ]"
              >
                {{ getDocumentPreview(document.content) }}
              </p>
            </div>
          </div>
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