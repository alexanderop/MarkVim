import type { Document } from '~/shared/types/Document'

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
