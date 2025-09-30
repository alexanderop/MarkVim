import { computed } from 'vue'
import { getDocumentTitle } from '../api'
import { useDocumentsProxy } from './useDocumentsProxy'

/**
 * Composable that provides the active document and computed title
 */
export function useActiveDocument() {
  const { activeDocument } = useDocumentsProxy()

  const activeDocumentTitle = computed(() => {
    return activeDocument.value
      ? getDocumentTitle(activeDocument.value.content)
      : 'MarkVim'
  })

  return {
    activeDocument,
    activeDocumentTitle,
  }
}
