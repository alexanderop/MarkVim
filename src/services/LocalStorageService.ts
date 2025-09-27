import type { StorageService } from '~/modules/core/api'

export class LocalStorageService implements StorageService {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error)
      return null
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    }
    catch (error) {
      console.warn(`Failed to set item in localStorage: ${key}`, error)
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    }
    catch (error) {
      console.warn(`Failed to remove item from localStorage: ${key}`, error)
    }
  }

  clear(): void {
    try {
      localStorage.clear()
    }
    catch (error) {
      console.warn('Failed to clear localStorage', error)
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}

// Create singleton instance
export const localStorageService = new LocalStorageService()
