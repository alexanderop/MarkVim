/**
 * Markdown Preview Module API
 *
 * This file defines the public interface for the markdown preview module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export composables that other modules might need
export { useMarkdown } from './composables/useMarkdown'
export { useMermaid } from './composables/useMermaid'

// Export any types if needed (check composables for exported types)
