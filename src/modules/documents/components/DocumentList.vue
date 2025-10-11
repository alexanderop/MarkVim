<script setup lang="ts">
import type { Document } from '~/shared/types/Document'
import DocumentListClient from './DocumentList.client.vue'
import DocumentListSkeleton from './DocumentListSkeleton.vue'

const { documents, activeDocumentId, isVisible } = defineProps<{
  documents: Document[]
  activeDocumentId: string
  isVisible?: boolean
}>()
</script>

<template>
  <ClientOnly>
    <DocumentListClient
      v-bind="$attrs"
      :documents="documents"
      :active-document-id="activeDocumentId"
      :is-visible="isVisible"
    />
    <template #fallback>
      <DocumentListSkeleton v-bind="$attrs" />
    </template>
  </ClientOnly>
</template>
