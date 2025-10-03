import type { Document } from '~/modules/domain/api'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useDataReset } from '@/shared/composables/useDataReset'
import { parseDocuments } from '~/modules/domain/api'
import { defaultDocumentContent } from './defaultContent'
import {
  createDefaultDocument,
  handleCreateDocument,
  handleDeleteDocument,
  handleImportDocument,
  handleResetDocuments,
  handleSelectDocument,
  handleUpdateDocument,
} from './internal/updateHandlers'

// --- THE MODEL ---
// This interface represents the entire state of our documents module.
export interface DocumentsState {
  documents: Document[]
  activeDocumentId: string
}

// --- THE MESSAGES ---
// A union type of all possible actions that can change the state.
// This replaces scattered event strings with a single, typed definition.
export type DocumentMessage
  = | { type: 'CREATE_DOCUMENT', payload?: { content?: string } }
    | { type: 'SELECT_DOCUMENT', payload: { documentId: string } }
    | { type: 'UPDATE_DOCUMENT', payload: { documentId: string, content: string } }
    | { type: 'DELETE_DOCUMENT', payload: { documentId: string } }
    | { type: 'IMPORT_DOCUMENT', payload: { document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> } }
    | { type: 'ADD_DOCUMENT', payload: { content: string } }
    | { type: 'RESET_DOCUMENTS' }

// --- THE UPDATE FUNCTION (Reducer) ---
// A pure function that calculates the next state based on the current state and a message.
function update(currentState: DocumentsState, message: DocumentMessage): DocumentsState {
  switch (message.type) {
    case 'CREATE_DOCUMENT':
      return handleCreateDocument(currentState, message.payload)

    case 'SELECT_DOCUMENT':
      return handleSelectDocument(currentState, message.payload)

    case 'UPDATE_DOCUMENT':
      return handleUpdateDocument(currentState, message.payload)

    case 'DELETE_DOCUMENT':
      return handleDeleteDocument(currentState, message.payload, defaultDocumentContent)

    case 'IMPORT_DOCUMENT':
      return handleImportDocument(currentState, message.payload)

    case 'ADD_DOCUMENT':
      return update(currentState, {
        type: 'CREATE_DOCUMENT',
        payload: { content: message.payload.content },
      })

    case 'RESET_DOCUMENTS':
      return handleResetDocuments(defaultDocumentContent)

    default:
      return currentState
  }
}

// Documents store following The Elm Architecture (TEA) pattern
export const useDocumentsStore = defineStore('documents', () => {
  const defaultDoc = createDefaultDocument(defaultDocumentContent)

  // The state (Model) is initialized and synced with localStorage.
  const state = useLocalStorage<DocumentsState>('markvim-documents', {
    documents: [defaultDoc],
    activeDocumentId: defaultDoc.id,
  }, {
    serializer: {
      read: (raw: string) => {
        try {
          const parsed = JSON.parse(raw)
          const validatedDocs = parseDocuments(parsed.documents || [])
          const docs = validatedDocs.length > 0 ? validatedDocs : [defaultDoc]
          const activeId = parsed.activeDocumentId && docs.some(d => d.id === parsed.activeDocumentId)
            ? parsed.activeDocumentId
            : docs[0]?.id || defaultDoc.id
          return {
            documents: docs,
            activeDocumentId: activeId,
          }
        }
        catch {
          return {
            documents: [defaultDoc],
            activeDocumentId: defaultDoc.id,
          }
        }
      },
      write: (value: DocumentsState) => JSON.stringify(value),
    },
  })

  const { onDataReset } = useDataReset()

  // --- GETTERS (Selectors) ---
  const documents = computed(() => {
    return [...state.value.documents].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const activeDocument = computed(() => {
    return documents.value.find(doc => doc.id === state.value.activeDocumentId) ?? documents.value[0] ?? null
  })

  const activeDocumentId = computed(() => state.value.activeDocumentId)

  const activeDocumentTitle = computed(() => {
    if (!activeDocument.value)
      return 'MarkVim'
    const firstLine = activeDocument.value.content.split('\n')[0]?.trim() ?? ''
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '') || 'Untitled'
    }
    return firstLine || 'Untitled'
  })

  // --- ACTION (The only way to mutate state) ---
  function dispatch(message: DocumentMessage): string | void {
    // Pass the current state and the message to our pure update function.
    // The result is the new state, which we assign back to our reactive state object.
    const newState = update(state.value, message)
    state.value = newState

    // Return the new active document ID for operations that create documents
    if (message.type === 'CREATE_DOCUMENT' || message.type === 'ADD_DOCUMENT' || message.type === 'IMPORT_DOCUMENT') {
      return newState.activeDocumentId
    }
  }

  // Data reset handling
  onDataReset(() => {
    dispatch({ type: 'RESET_DOCUMENTS' })
  })

  function getDocumentTitle(content: string): string {
    const firstLine = content.split('\n')[0]?.trim() ?? ''
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '') || 'Untitled'
    }
    return firstLine || 'Untitled'
  }

  function getDocumentById(id: string): Document | undefined {
    return state.value.documents.find(doc => doc.id === id)
  }

  return {
    documents,
    activeDocument,
    activeDocumentId,
    activeDocumentTitle,
    dispatch,
    getDocumentTitle,
    getDocumentById,
  }
})
