import { z } from 'zod'

/**
 * Zod schema for Document validation
 * Provides runtime validation for document data from localStorage or external sources
 */
export const documentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
})

/**
 * Schema for an array of documents
 */
export const documentsArraySchema = z.array(documentSchema)

/**
 * Validates and parses a single document
 * Returns null if validation fails
 */
export function parseDocument(data: unknown): z.infer<typeof documentSchema> | null {
  const result = documentSchema.safeParse(data)
  return result.success ? result.data : null
}

/**
 * Validates and parses an array of documents
 * Filters out invalid documents instead of failing completely
 */
export function parseDocuments(data: unknown): Array<z.infer<typeof documentSchema>> {
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .map(item => parseDocument(item))
    .filter((doc): doc is NonNullable<typeof doc> => doc !== null)
}
