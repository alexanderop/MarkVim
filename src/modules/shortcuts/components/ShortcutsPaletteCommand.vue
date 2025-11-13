<script setup lang="ts">
import type { Document as DocType } from '@modules/documents'
import type { Ref } from 'vue'
import { UCommandPalette, UModal } from '#components'
import { getDocumentTitle } from '@modules/documents'
import { computed, ref } from 'vue'
import { useCommandHistory } from '../composables/useCommandHistory'
import { useShortcuts } from '../composables/useShortcuts'

const { documents = [] } = defineProps<{
  documents?: DocType[]
}>()

const emit = defineEmits<{
  selectDocument: [id: string]
}>()

const open = defineModel<boolean>('open')

// External composables
const { commandPaletteItems } = useShortcuts()
const { trackCommandUsage, commandHistory } = useCommandHistory()

// Component logic
const searchTerm = ref('')
const { documentItems } = useDocumentItems(documents, emit, open)
const { groups } = useCommandGroups(commandPaletteItems, documentItems, commandHistory, searchTerm)

function handleSelect(item: any): void {
  if (item?.id) {
    trackCommandUsage(item.id)
  }
  open.value = false
}

// Inline composables
function useDocumentItems(
  documents: DocType[],
  emit: any,
  open: Ref<boolean | undefined>,
): { documentItems: Ref<any[]> } {
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

  return { documentItems }
}

function useCommandGroups(
  commandPaletteItems: Ref<any[]>,
  documentItems: Ref<any[]>,
  commandHistory: Readonly<Ref<readonly string[]>>,
  searchTerm: Ref<string>,
): { groups: Ref<Array<{ id: string, label?: string, items: any[] }>> } {
  const MAX_RECENT_COMMANDS = 8

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

  return { groups }
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
