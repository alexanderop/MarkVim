import type { DocumentsState } from '../types'
import type { Document } from '~/shared/types/Document'

// Use a consistent default document ID
const DEFAULT_DOCUMENT_ID = 'default-welcome-document-id'
// Use fixed timestamps to avoid hydration mismatches
const DEFAULT_TIMESTAMP = 1703980800000 // 2023-12-31 00:00:00 UTC

export function createDefaultDocument(content: string): Document {
  return {
    id: DEFAULT_DOCUMENT_ID,
    content,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP,
  }
}

export function handleCreateDocument(
  state: DocumentsState,
  payload?: { content?: string },
): DocumentsState {
  const now = Date.now()
  const newDoc: Document = {
    id: crypto.randomUUID(),
    content: payload?.content || '# New Note\n\nStart writing...',
    createdAt: now,
    updatedAt: now,
  }
  return {
    ...state,
    documents: [newDoc, ...state.documents],
    activeDocumentId: newDoc.id,
  }
}

export function handleSelectDocument(
  state: DocumentsState,
  payload: { documentId: string },
): DocumentsState {
  if (state.documents.some(doc => doc.id === payload.documentId)) {
    return {
      ...state,
      activeDocumentId: payload.documentId,
    }
  }
  return state
}

export function handleUpdateDocument(
  state: DocumentsState,
  payload: { documentId: string, content: string },
): DocumentsState {
  return {
    ...state,
    documents: state.documents.map(doc =>
      (doc.id === payload.documentId
        ? { ...doc, content: payload.content, updatedAt: Date.now() }
        : doc),
    ),
  }
}

export function handleDeleteDocument(
  state: DocumentsState,
  payload: { documentId: string },
  defaultContent: string,
): DocumentsState {
  const remainingDocs = state.documents.filter(doc => doc.id !== payload.documentId)

  let newActiveId = state.activeDocumentId
  let newDocs = remainingDocs

  if (newActiveId === payload.documentId) {
    if (remainingDocs.length === 0) {
      const newDefaultDoc = createDefaultDocument(defaultContent)
      newDocs = [newDefaultDoc]
      newActiveId = newDefaultDoc.id
      return {
        ...state,
        documents: newDocs,
        activeDocumentId: newActiveId,
      }
    }
    newActiveId = remainingDocs[0]?.id || ''
  }

  return {
    ...state,
    documents: newDocs,
    activeDocumentId: newActiveId,
  }
}

export function handleImportDocument(
  state: DocumentsState,
  payload: { document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> },
): DocumentsState {
  const now = Date.now()
  const newDoc: Document = {
    id: crypto.randomUUID(),
    ...payload.document,
    createdAt: now,
    updatedAt: now,
  }
  return {
    ...state,
    documents: [newDoc, ...state.documents],
    activeDocumentId: newDoc.id,
  }
}

export function handleResetDocuments(defaultContent: string): DocumentsState {
  const newDefaultDoc = createDefaultDocument(defaultContent)
  return {
    documents: [newDefaultDoc],
    activeDocumentId: newDefaultDoc.id,
  }
}
