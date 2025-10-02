/**
 * Core Module API
 *
 * This module contains core domain types and interfaces that are shared
 * across multiple modules. Other modules should import from this API
 * to access fundamental domain entities and contracts.
 */

// Contracts/Interfaces
export type { DocumentRepository } from './contracts/DocumentRepository'

export type { StorageService } from './contracts/StorageService'
// Schemas
export { documentsArraySchema, documentSchema, parseDocument, parseDocuments } from './schemas/document.schema'
// Domain Types
export type { Document } from './types/Document'
