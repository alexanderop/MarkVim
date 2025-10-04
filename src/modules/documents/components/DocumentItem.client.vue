<script setup lang="ts">
import type { ContextMenuItem } from '#ui/types'
import type { Document as DocType } from '~/modules/documents/api'
import { Icon, UButton, UContextMenu } from '#components'
import { computed } from 'vue'
import { emitAppEvent } from '@/shared/utils/eventBus'
import { getDocumentTitle } from '~/modules/documents/api'

interface Props {
  document: DocType
  isActive: boolean
  index: number
}

const { document, isActive, index } = defineProps<Props>()

// Time conversion constants
const MILLISECONDS_IN_SECOND = 1000
const SECONDS_IN_MINUTE = 60
const MINUTES_IN_HOUR = 60
const HOURS_IN_DAY = 24
const DAYS_IN_WEEK = 7
const PREVIEW_MAX_LENGTH = 20

function handleDocumentClick(): void {
  emitAppEvent('document:select', { documentId: document.id })
}

function handleSelectDocument(): void {
  emitAppEvent('document:select', { documentId: document.id })
}

function handleDeleteDocument(): void {
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
  const preview = firstNonHeaderLine?.trim() || ''
  if (!preview)
    return 'No content'

  return preview.slice(0, PREVIEW_MAX_LENGTH)
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR)

  if (diffInHours < HOURS_IN_DAY) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffInHours < HOURS_IN_DAY * DAYS_IN_WEEK) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const contextMenuItems = computed<ContextMenuItem[][]>(() => [
  [
    {
      label: 'Select',
      icon: 'lucide:mouse-pointer-click',
      onSelect: handleSelectDocument,
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'lucide:trash-2',
      color: 'error' as const,
      onSelect: handleDeleteDocument,
    },
  ],
])
</script>

<template>
  <UContextMenu :items="contextMenuItems">
    <UButton
      variant="ghost"
      class="px-3 py-3 md:py-3 border rounded-lg cursor-pointer transition-all duration-200 relative active:scale-[0.98] w-full text-left h-auto"
      :class="[
        isActive
          ? 'bg-[var(--accent)] bg-opacity-10 border-[var(--accent)] border-opacity-15 shadow-sm'
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
    </UButton>
  </UContextMenu>
</template>
