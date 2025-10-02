export interface StorageService {
  get: <T>(key: string) => T | null
  set: <T>(key: string, value: T) => void
  remove: (key: string) => void
  clear: () => void
  has: (key: string) => boolean
}
