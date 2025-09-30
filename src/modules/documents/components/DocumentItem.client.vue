<script setup lang="ts">
import type { Document as DocType } from '~/modules/documents/api'
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from 'reka-ui'
import { emitAppEvent } from '@/shared/utils/eventBus'
import { getDocumentTitle } from '~/modules/documents/api'

interface Props {
  document: DocType
  isActive: boolean
  index: number
}

const { document, isActive, index } = defineProps<Props>()

function handleDocumentClick() {
  emitAppEvent('document:select', { documentId: document.id })
}

function handleSelectDocument() {
  emitAppEvent('document:select', { documentId: document.id })
}

function handleDeleteDocument() {
  emitAppEvent('document:delete', {
    documentId: document.id,
    documentTitle: getDocumentTitle(document.content),
  })
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
  if (diffInHours < 24 * 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
</script>

<template>
  <ContextMenuRoot>
    <!-- Main document item -->
    <ContextMenuTrigger as-child>
      <button
        type="button"
        class="px-3 py-3 md:py-3 border rounded-lg cursor-pointer transition-all duration-200 relative active:scale-[0.98] w-full text-left"
        :class="[
          isActive
            ? 'bg-[var(--accent)] bg-opacity-10 border-[var(--accent)] border-opacity-30 shadow-lg'
            : 'border-transparent hover:bg-[var(--muted)] hover:border-[var(--border)]',
        ]"
        :aria-label="`Select document: ${getDocumentTitle(document.content)}`"
        :aria-current="isActive ? 'true' : undefined"
        :data-testid="isActive ? `document-item-active-${index}` : `document-item-inactive-${index}`"
        @click="handleDocumentClick"
      >
        <!-- Active indicator line -->
        <div
          v-if="isActive"
          class="rounded-full bg-[var(--accent)] h-6 w-1 left-0 top-1/2 absolute -translate-y-1/2"
        />

        <div class="flex gap-3 items-start">
          <!-- Document icon -->
          <div class="mt-0.5 flex-shrink-0">
            <div
              class="rounded-md flex h-6 w-6 transition-all duration-200 items-center justify-center"
              :class="[
                isActive
                  ? 'bg-[var(--accent)] bg-opacity-20 text-[var(--accent)]'
                  : 'bg-[var(--muted)] text-[var(--foreground)] opacity-60 group-hover:bg-[var(--muted)] group-hover:opacity-80',
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
                  isActive
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--foreground)] opacity-90 group-hover:opacity-100',
                ]"
                :data-testid="`document-title-${index}`"
              >
                {{ getDocumentTitle(document.content) }}
              </h3>
              <span
                class="text-xs flex-shrink-0 tabular-nums"
                :class="[
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--foreground)] opacity-50 group-hover:opacity-60',
                ]"
                :data-testid="`document-timestamp-${index}`"
              >
                {{ formatDate(document.updatedAt) }}
              </span>
            </div>

            <p
              class="text-xs leading-relaxed truncate"
              :class="[
                isActive
                  ? 'text-[var(--foreground)] opacity-60'
                  : 'text-[var(--foreground)] opacity-50 group-hover:opacity-60',
              ]"
              :data-testid="`document-preview-${index}`"
            >
              {{ getDocumentPreview(document.content) }}
            </p>
          </div>
        </div>
      </button>
    </ContextMenuTrigger>

    <!-- Context Menu -->
    <ContextMenuPortal>
      <ContextMenuContent class="bg-[var(--muted)] border border-[var(--border)] rounded-lg shadow-xl p-1 min-w-[160px] z-50">
        <ContextMenuItem
          class="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background)] rounded-md cursor-pointer transition-colors"
          @click="handleSelectDocument"
        >
          <Icon
            name="lucide:mouse-pointer-click"
            class="h-4 w-4"
          />
          Select
        </ContextMenuItem>

        <ContextMenuSeparator class="h-px bg-[var(--border)] my-1" />

        <ContextMenuItem
          class="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-md cursor-pointer transition-colors"
          @click="handleDeleteDocument"
        >
          <Icon
            name="lucide:trash-2"
            class="h-4 w-4"
          />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>
