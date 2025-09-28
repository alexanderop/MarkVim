import type { Document } from '~/modules/core/api'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useDataReset } from '@/shared/composables/useDataReset'
import { onAppEvent } from '@/shared/utils/eventBus'
import { defaultDocumentContent } from './defaultContent'

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

// Private store - exported for proxy access but not in public API
export const useDocumentsStorePrivate = defineStore('documents-private', () => {
  const defaultDoc = createDefaultDocument()

  // Since components are client-only, we can use localStorage directly
  const _documents = useLocalStorage<Document[]>('markvim-documents', [defaultDoc])
  const _activeDocumentId = useLocalStorage('markvim-active-document-id', defaultDoc.id)

  const { onDataReset } = useDataReset()

  // Computed properties
  const documents = computed(() => {
    return [..._documents.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const activeDocument = computed(() => {
    return documents.value.find(doc => doc.id === _activeDocumentId.value) || documents.value[0]
  })

  const activeDocumentId = computed(() => _activeDocumentId.value)

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

  // Initialize immediately since the store needs to be ready when components request state
  initializeStore()

  // Data reset handling
  onDataReset(() => {
    const newDefaultDoc = createDefaultDocument()
    _documents.value = [newDefaultDoc]
    _activeDocumentId.value = newDefaultDoc.id
  })

  // Actions
  function createDocument(content?: string): string {
    const now = Date.now()
    const newDoc: Document = {
      id: crypto.randomUUID(),
      content: content || '# New Note\n\nStart writing...',
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

  function addDocument(content: string): string {
    const now = Date.now()
    const newDoc: Document = {
      id: crypto.randomUUID(),
      content,
      createdAt: now,
      updatedAt: now,
    }
    _documents.value.unshift(newDoc)
    _activeDocumentId.value = newDoc.id
    return newDoc.id
  }

  function importDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): string {
    const now = Date.now()
    const newDoc: Document = {
      id: crypto.randomUUID(),
      ...document,
      createdAt: now,
      updatedAt: now,
    }
    _documents.value.unshift(newDoc)
    _activeDocumentId.value = newDoc.id
    return newDoc.id
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

  // Listen for events from the event bus (all mutations happen through events)
  onAppEvent('document:create', () => {
    createDocument()
  })

  onAppEvent('document:select', (payload) => {
    setActiveDocument(payload.documentId)
  })

  onAppEvent('document:update', (payload) => {
    updateDocument(payload.documentId, payload.content)
  })

  onAppEvent('document:delete-confirmed', (payload) => {
    deleteDocument(payload.documentId)
  })

  onAppEvent('documents:add', (payload) => {
    addDocument(payload.content)
  })

  onAppEvent('documents:import', (payload) => {
    addDocument(payload.content)
  })

  return {
    documents,
    activeDocument,
    activeDocumentId,
    createDocument,
    setActiveDocument,
    updateDocument,
    deleteDocument,
    importDocument,
    getDocumentTitle,
    getDocumentById,
  }
})

// Public store - provides read-only access to private store
export const useDocumentsStore = defineStore('documents', () => {
  const privateStore = useDocumentsStorePrivate()

  return {
    // Read-only computed properties - all mutations happen through events
    documents: computed(() => privateStore.documents),
    activeDocument: computed(() => privateStore.activeDocument),
    activeDocumentId: computed(() => privateStore.activeDocumentId),

    // Utility functions that don't mutate state
    getDocumentTitle: privateStore.getDocumentTitle,
    getDocumentById: privateStore.getDocumentById,
  }
})
