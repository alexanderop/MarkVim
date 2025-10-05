import type { StorageService } from '~/modules/domain/api'
import { tryCatch } from '~/shared/utils/result'

export class LocalStorageService implements StorageService {
  get<T>(key: string): T | null {
    const item = localStorage.getItem(key)
    if (!item)
      return null

    const parseResult = tryCatch(
      () => JSON.parse(item),
      () => new Error(`Failed to parse item from localStorage: ${key}`),
    )

    if (parseResult.ok) {
      return parseResult.value
    }

    console.warn(`Failed to get item from localStorage: ${key}`, parseResult.error)
    return null
  }

  set<T>(key: string, value: T): void {
    const result = tryCatch(
      () => localStorage.setItem(key, JSON.stringify(value)),
      () => new Error(`Failed to set item in localStorage: ${key}`),
    )

    if (!result.ok) {
      console.warn(`Failed to set item in localStorage: ${key}`, result.error)
    }
  }

  remove(key: string): void {
    const result = tryCatch(
      () => localStorage.removeItem(key),
      () => new Error(`Failed to remove item from localStorage: ${key}`),
    )

    if (!result.ok) {
      console.warn(`Failed to remove item from localStorage: ${key}`, result.error)
    }
  }

  clear(): void {
    const result = tryCatch(
      () => localStorage.clear(),
      () => new Error('Failed to clear localStorage'),
    )

    if (!result.ok) {
      console.warn('Failed to clear localStorage', result.error)
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}

// Create singleton instance
export const localStorageService = new LocalStorageService()
