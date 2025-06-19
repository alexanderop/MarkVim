import { defaultDocumentContent } from './defaultContent'

// Nuxt auto-imports: defineStore, computed, useLocalStorage, useEventBus, ref, nextTick

export interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

// Use a consistent default document ID to avoid SSR hydration mismatches
const DEFAULT_DOCUMENT_ID = 'default-welcome-document-id'
// Use fixed timestamps to avoid SSR/client hydration mismatches
const DEFAULT_TIMESTAMP = 1703980800000 // 2023-12-31 00:00:00 UTC

function createDefaultDocument(): Document {
  return {
    id: DEFAULT_DOCUMENT_ID,
    content: defaultDocumentContent,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP,
  }
}

// Client-side only localStorage operations to avoid SSR issues
function createClientSafeLocalStorage<T>(key: string, defaultValue: T) {
  // During SSR, return reactive ref with default value
  if (import.meta.server) {
    return ref(defaultValue)
  }

  // On client, use normal useLocalStorage
  return useLocalStorage(key, defaultValue)
}

// Private internal store (not exported)
const _useDocumentsInternalStore = defineStore('documents-internal', () => {
  console.log('[Documents Store] Initializing documents store')

  const defaultDoc = createDefaultDocument()
  const _documents = createClientSafeLocalStorage<Document[]>('markvim-documents', [defaultDoc])
  const _activeDocumentId = createClientSafeLocalStorage('markvim-active-document-id', defaultDoc.id)

  // Only log localStorage details on client-side to avoid SSR issues
  if (import.meta.client) {
    console.log('[Documents Store] Loaded from localStorage:', {
      documentsCount: _documents.value.length,
      activeDocumentId: _activeDocumentId.value,
      documents: _documents.value.map(d => ({ id: d.id, title: d.content.split('\n')[0], createdAt: new Date(d.createdAt).toISOString() })),
    })
  }
  else {
    console.log('[Documents Store] SSR initialization with default document')
  }

  // Initialize store state - handle both SSR and client scenarios
  function initializeStore() {
    // Ensure we have at least one document
    if (_documents.value.length === 0) {
      console.log('[Documents Store] No documents found, creating default document')
      const newDefaultDoc = createDefaultDocument()
      _documents.value = [newDefaultDoc]
      _activeDocumentId.value = newDefaultDoc.id
    }

    // Ensure active document exists
    if (!_documents.value.find(doc => doc.id === _activeDocumentId.value)) {
      console.log('[Documents Store] Active document not found, selecting first available:', {
        requestedId: _activeDocumentId.value,
        availableIds: _documents.value.map(d => d.id),
        selectedId: _documents.value[0]?.id || DEFAULT_DOCUMENT_ID,
      })
      _activeDocumentId.value = _documents.value[0]?.id || DEFAULT_DOCUMENT_ID
    }
  }

  // Initialize immediately
  initializeStore()

  // Re-initialize on client hydration to ensure persistence works
  if (import.meta.client) {
    nextTick(() => {
      initializeStore()
    })
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

  // Data reset handling - only on client-side
  if (import.meta.client) {
    onDataReset(() => {
      console.log('[Documents Store] Data reset triggered, resetting to default document')
      const newDefaultDoc = createDefaultDocument()
      internalStore.documents = [newDefaultDoc]
      internalStore.activeDocumentId = newDefaultDoc.id
      console.log('[Documents Store] Data reset complete')
    })
  }

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
    const now = Date.now()
    const newDoc: Document = {
      id: crypto.randomUUID(),
      content: '# New Note\n\nStart writing...',
      createdAt: now,
      updatedAt: now,
    }

    console.log('[Documents Store] Creating new document:', {
      id: newDoc.id,
      title: newDoc.content.split('\n')[0],
      documentsCountBefore: internalStore.documents.length,
    })

    internalStore.documents.unshift(newDoc)
    internalStore.activeDocumentId = newDoc.id

    console.log('[Documents Store] Document created successfully:', {
      documentsCountAfter: internalStore.documents.length,
      activeDocumentId: internalStore.activeDocumentId,
    })

    return newDoc.id
  }

  function setActiveDocument(id: string): void {
    const doc = internalStore.documents.find(d => d.id === id)
    console.log('[Documents Store] Setting active document:', {
      requestedId: id,
      found: !!doc,
      currentActiveId: internalStore.activeDocumentId,
    })
    if (doc) {
      internalStore.activeDocumentId = id
      console.log('[Documents Store] Active document changed to:', id)
    }
    else {
      console.warn('[Documents Store] Document not found:', id)
    }
  }

  function updateDocument(id: string, content: string): void {
    const docIndex = internalStore.documents.findIndex(d => d.id === id)
    console.log('[Documents Store] Updating document:', {
      id,
      found: docIndex !== -1,
      contentLength: content.length,
      title: content.split('\n')[0],
    })
    if (docIndex !== -1) {
      internalStore.documents[docIndex] = {
        ...internalStore.documents[docIndex],
        content,
        updatedAt: Date.now(),
      }
      console.log('[Documents Store] Document updated successfully:', {
        id,
        updatedAt: new Date().toISOString(),
      })
    }
    else {
      console.warn('[Documents Store] Document not found for update:', id)
    }
  }

  function deleteDocument(id: string): void {
    const docIndex = internalStore.documents.findIndex(d => d.id === id)
    console.log('[Documents Store] Deleting document:', {
      id,
      found: docIndex !== -1,
      documentsCountBefore: internalStore.documents.length,
      isActiveDocument: internalStore.activeDocumentId === id,
    })

    if (docIndex === -1) {
      console.warn('[Documents Store] Document not found for deletion:', id)
      return
    }

    internalStore.documents.splice(docIndex, 1)
    console.log('[Documents Store] Document deleted:', {
      id,
      documentsCountAfter: internalStore.documents.length,
    })

    // If we deleted the active document, select another one
    if (internalStore.activeDocumentId === id) {
      console.log('[Documents Store] Deleted document was active, selecting new active document')
      if (internalStore.documents.length === 0) {
        console.log('[Documents Store] No documents left, creating new default document')
        // Create a new document if none exist
        createDocument()
      }
      else {
        // Select the first available document
        const newActiveId = internalStore.documents[0].id
        console.log('[Documents Store] Selecting first available document as active:', newActiveId)
        internalStore.activeDocumentId = newActiveId
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
