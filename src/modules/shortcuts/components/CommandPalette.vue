<script setup lang="ts">
import type { Document as DocType } from '~/modules/documents/api'
import { UCommandPalette, UModal } from '#components'
import { computed, ref } from 'vue'
import { getDocumentTitle } from '~/modules/documents/api'
import { useCommandHistory, useShortcuts } from '~/modules/shortcuts/api'

const { documents = [] } = defineProps<{
  documents?: DocType[]
}>()

const emit = defineEmits<{
  selectDocument: [id: string]
}>()

const open = defineModel<boolean>('open')

const searchTerm = ref('')

// Get command palette items from shortcuts composable
const { commandPaletteItems } = useShortcuts()
const { trackCommandUsage, commandHistory } = useCommandHistory()

// Maximum number of recent commands to show
const MAX_RECENT_COMMANDS = 8

// Transform documents into command palette items
const documentItems = computed(() => {
  return (documents || []).map(doc => ({
    id: `doc-${doc.id}`,
    label: getDocumentTitle(doc.content),
    suffix: `Last updated: ${new Date(doc.updatedAt).toLocaleDateString()}`,
    icon: 'lucide:file-text',
    category: 'Files',
    onSelect: (e?: Event) => {
      e?.preventDefault()
      emit('selectDocument', doc.id)
      open.value = false
    },
  }))
})

// Create groups for command palette
const groups = computed(() => {
  const allItems = [...commandPaletteItems.value, ...documentItems.value]
  const recentIds = new Set(commandHistory.value.slice(0, MAX_RECENT_COMMANDS))

  // Separate recent and other items
  const recentItems = allItems.filter(item => recentIds.has(item.id))
  const otherItems = allItems.filter(item => !recentIds.has(item.id))

  const result: Array<{
    id: string
    label?: string
    items: any[]
  }> = []

  // Add "Recently Used" group if we have recent items
  if (recentItems.length > 0 && !searchTerm.value) {
    result.push({
      id: 'recent',
      label: 'Recently Used',
      items: recentItems,
    })
  }

  // Group other items by category
  const itemsByCategory: Record<string, any[]> = {}
  otherItems.forEach((item) => {
    const category = item.category || 'Other'
    if (!itemsByCategory[category]) {
      itemsByCategory[category] = []
    }
    itemsByCategory[category].push(item)
  })

  // Add groups in specific order
  const groupOrder = ['Files', 'File', 'View', 'Insert', 'Format', 'Navigation', 'Settings', 'Help', 'General', 'Other']

  groupOrder.forEach((category) => {
    if (itemsByCategory[category]?.length) {
      result.push({
        id: category.toLowerCase(),
        label: category,
        items: itemsByCategory[category],
      })
    }
  })

  return result
})

// Handle item selection to track usage
function handleSelect(item: any): void {
  if (item?.id) {
    trackCommandUsage(item.id)
  }
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'max-w-2xl' }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="groups"
        placeholder="Type a command or search..."
        data-testid="command-palette"
        class="flex-1"
        @update:model-value="handleSelect"
      />
    </template>
  </UModal>
</template>
