import { tryCatchAsync } from '~/shared/utils/result'

/**
 * Pure business logic for exporting theme data
 * Following Thin Composables pattern - no Vue reactivity, just pure functions
 */

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const result = await tryCatchAsync(
    () => navigator.clipboard.writeText(text),
    error => (error instanceof Error ? error : new Error(String(error))),
  )

  if (result.ok) {
    return true
  }

  console.error('Failed to copy to clipboard:', result.error)
  return false
}

/**
 * Download text as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Show temporary message on a button element
 */
export function showTemporaryButtonMessage(
  selector: string,
  message: string,
  durationMs: number,
): void {
  const button = document.querySelector(selector)
  if (!button)
    return

  const originalText = button.textContent
  button.textContent = message
  setTimeout(() => {
    button.textContent = originalText
  }, durationMs)
}
