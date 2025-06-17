import { defaultDocumentContent } from './defaultContent'

export interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

const defaultDocument: Document = {
  id: crypto.randomUUID(),
  content: defaultDocumentContent,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

// Private internal store (not exported)
const _useDocumentsInternalStore = defineStore('documents-internal', () => {
  const _documents = useLocalStorage<Document[]>('markvim-documents', [defaultDocument])
  const _activeDocumentId = useLocalStorage('markvim-active-document-id', defaultDocument.id)

  // Ensure we have at least one document
  if (_documents.value.length === 0) {
    _documents.value = [defaultDocument]
    _activeDocumentId.value = defaultDocument.id
  }

  // Ensure active document exists
  if (!_documents.value.find(doc => doc.id === _activeDocumentId.value)) {
    _activeDocumentId.value = _documents.value[0]?.id || defaultDocument.id
  }

  return {
    documents: _documents,
    activeDocumentId: _activeDocumentId,
  }
})

// Public store (exported)
export const useDocumentsStore = defineStore('documents', () => {
  const internalStore = _useDocumentsInternalStore()
  const { onDataReset } = useDataReset()

  // Data reset handling
  onDataReset(() => {
    internalStore.documents = [defaultDocument]
    internalStore.activeDocumentId = defaultDocument.id
  })

  // Computed properties
  const documents = computed(() => {
    return [...internalStore.documents].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const activeDocument = computed(() => {
    return documents.value.find(doc => doc.id === internalStore.activeDocumentId) || documents.value[0]
  })

  const activeDocumentId = computed(() => internalStore.activeDocumentId)

  // Actions
  function createDocument(): string {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      content: '# New Note\n\nStart writing...',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    internalStore.documents.unshift(newDoc)
    internalStore.activeDocumentId = newDoc.id
    return newDoc.id
  }

  function setActiveDocument(id: string): void {
    const doc = internalStore.documents.find(d => d.id === id)
    if (doc) {
      internalStore.activeDocumentId = id
    }
  }

  function updateDocument(id: string, content: string): void {
    const docIndex = internalStore.documents.findIndex(d => d.id === id)
    if (docIndex !== -1) {
      internalStore.documents[docIndex] = {
        ...internalStore.documents[docIndex],
        content,
        updatedAt: Date.now(),
      }
    }
  }

  function deleteDocument(id: string): void {
    const docIndex = internalStore.documents.findIndex(d => d.id === id)
    if (docIndex === -1)
      return

    internalStore.documents.splice(docIndex, 1)

    // If we deleted the active document, select another one
    if (internalStore.activeDocumentId === id) {
      if (internalStore.documents.length === 0) {
        // Create a new document if none exist
        createDocument()
      }
      else {
        // Select the first available document
        internalStore.activeDocumentId = internalStore.documents[0].id
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

  return {
    documents,
    activeDocument,
    activeDocumentId,
    createDocument,
    setActiveDocument,
    updateDocument,
    deleteDocument,
    getDocumentTitle,
  }
})
