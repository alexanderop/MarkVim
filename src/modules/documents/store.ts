import { defaultDocumentContent } from './defaultContent'

// Nuxt auto-imports: defineStore, computed, useLocalStorage, useEventBus, ref, nextTick

export interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

// Use a consistent default document ID
const DEFAULT_DOCUMENT_ID = 'default-welcome-document-id'
// Use fixed timestamps to avoid hydration mismatches
const DEFAULT_TIMESTAMP = 1703980800000 // 2023-12-31 00:00:00 UTC

function createDefaultDocument(): Document {
  return {
    id: DEFAULT_DOCUMENT_ID,
    content: defaultDocumentContent,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP,
  }
}

export const useDocumentsStore = defineStore('documents', () => {
  const defaultDoc = createDefaultDocument()

  // Since components are client-only, we can use localStorage directly
  const _documents = useLocalStorage<Document[]>('markvim-documents', [defaultDoc])
  const _activeDocumentId = useLocalStorage('markvim-active-document-id', defaultDoc.id)

  const { onDataReset } = useDataReset()

  // Initialize store state
  function initializeStore() {
    // Ensure we have at least one document
    if (_documents.value.length === 0) {
      const newDefaultDoc = createDefaultDocument()
      _documents.value = [newDefaultDoc]
      _activeDocumentId.value = newDefaultDoc.id
    }

    // Ensure active document exists
    if (!_documents.value.find(doc => doc.id === _activeDocumentId.value)) {
      _activeDocumentId.value = _documents.value[0]?.id || DEFAULT_DOCUMENT_ID
    }
  }

  // Initialize immediately
  initializeStore()

  // Data reset handling
  onDataReset(() => {
    const newDefaultDoc = createDefaultDocument()
    _documents.value = [newDefaultDoc]
    _activeDocumentId.value = newDefaultDoc.id
  })

  // Computed properties
  const documents = computed(() => {
    return [..._documents.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const activeDocument = computed(() => {
    return documents.value.find(doc => doc.id === _activeDocumentId.value) || documents.value[0]
  })

  const activeDocumentId = computed(() => _activeDocumentId.value)

  // Actions
  function createDocument(): string {
    const now = Date.now()
    const newDoc: Document = {
      id: crypto.randomUUID(),
      content: '# New Note\n\nStart writing...',
      createdAt: now,
      updatedAt: now,
    }

    _documents.value.unshift(newDoc)
    _activeDocumentId.value = newDoc.id

    return newDoc.id
  }

  function setActiveDocument(id: string): void {
    const doc = _documents.value.find(d => d.id === id)
    if (doc) {
      _activeDocumentId.value = id
    }
  }

  function updateDocument(id: string, content: string): void {
    const docIndex = _documents.value.findIndex(d => d.id === id)
    if (docIndex !== -1) {
      _documents.value[docIndex] = {
        ..._documents.value[docIndex],
        content,
        updatedAt: Date.now(),
      }
    }
  }

  function deleteDocument(id: string): void {
    const docIndex = _documents.value.findIndex(d => d.id === id)

    if (docIndex === -1) {
      return
    }

    _documents.value.splice(docIndex, 1)

    // If we deleted the active document, select another one
    if (_activeDocumentId.value === id) {
      if (_documents.value.length === 0) {
        // Create a new document if none exist
        createDocument()
      }
      else {
        // Select the first available document
        const newActiveId = _documents.value[0].id
        _activeDocumentId.value = newActiveId
      }
    }
  }

  function getDocumentTitle(content: string): string {
    const firstLine = content.split('\n')[0].trim()
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '') || 'Untitled'
    }
    return firstLine || 'Untitled'
  }

  function getDocumentById(id: string): Document | undefined {
    return _documents.value.find(doc => doc.id === id)
  }

  return {
    documents,
    activeDocument,
    activeDocumentId,
    createDocument,
    setActiveDocument,
    updateDocument,
    deleteDocument,
    getDocumentTitle,
    getDocumentById,
  }
})
