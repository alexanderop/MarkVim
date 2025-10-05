/**
 * Document title extraction utility
 *
 * Extracts a display title from document content.
 * Uses the first line (stripped of markdown heading syntax).
 * Truncates long titles for display.
 */

const TITLE_MAX_LENGTH = 50

/**
 * Extract document title from content
 *
 * @param content - The document content
 * @returns The extracted and formatted title
 */
export function getDocumentTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  const title = firstLine.startsWith('#')
    ? firstLine.replace(/^#+\s*/, '') || 'Untitled'
    : firstLine || 'Untitled'

  if (title.length > TITLE_MAX_LENGTH) {
    return `${title.slice(0, TITLE_MAX_LENGTH)}…`
  }
  return title
}
