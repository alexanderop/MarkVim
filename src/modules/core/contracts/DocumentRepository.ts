import type { Document } from '../types/Document'

export interface DocumentRepository {
  getAll: () => Document[]
  getById: (id: string) => Document | undefined
  getActiveDocument: () => Document | undefined
  getActiveDocumentId: () => string
  create: () => string
  setActive: (id: string) => void
  update: (id: string, content: string) => void
  delete: (id: string) => void
  getTitle: (content: string) => string
}
