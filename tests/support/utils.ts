import type { MarkVimWorld } from './world.js'

export async function ensurePage(world: MarkVimWorld) {
  if (!world.page) {
    await world.init()
  }
  if (!world.page) {
    throw new Error('Page not initialized')
  }
  return world.page
}

/**
 * Retry a function multiple times with exponential backoff
 * Useful for handling transient failures in CI environments
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  initialDelayMs: number = 1000,
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    }
    catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * 2 ** attempt
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  throw lastError || new Error('Retry failed')
}
