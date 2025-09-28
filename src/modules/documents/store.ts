import type { Document } from '~/modules/core/api'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useDataReset } from '@/shared/composables/useDataReset'
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'
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

export const useDocumentsStore = defineStore('documents', () => {
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

  // Emit current state to all subscribers
  const emitState = () => {
    emitAppEvent('documents:state-updated', {
      documents: documents.value,
      activeDocumentId: activeDocumentId.value,
    })
  }

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

    // Emit initial state
    emitState()
  }

  // Initialize immediately since the store needs to be ready when components request state
  initializeStore()

  // Data reset handling
  onDataReset(() => {
    const newDefaultDoc = createDefaultDocument()
    _documents.value = [newDefaultDoc]
    _activeDocumentId.value = newDefaultDoc.id
    emitState()
  })

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
    emitState()

    return newDoc.id
  }

  function setActiveDocument(id: string): void {
    const doc = _documents.value.find(d => d.id === id)
    if (doc) {
      _activeDocumentId.value = id
      emitState()
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
      emitState()
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
    emitState()
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
    emitState()
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

  // Listen for events from the event bus
  onAppEvent('document:create', () => {
    createDocument()
  })

  onAppEvent('document:select', (payload) => {
    setActiveDocument(payload.documentId)
  })

  onAppEvent('documents:request-state', () => {
    emitState()
  })

  onAppEvent('documents:update', (payload) => {
    updateDocument(payload.id, payload.content)
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
    getDocumentTitle,
    getDocumentById,
  }
})
