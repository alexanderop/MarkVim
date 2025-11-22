import { cleanup } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import ResizeObserver from 'resize-observer-polyfill'
import { afterEach, beforeEach, vi } from 'vitest'

// 1. Polyfill ResizeObserver (needed for Nuxt UI/ResizablePanes)
globalThis.ResizeObserver = ResizeObserver

// 2. Polyfill crypto.randomUUID (used in documents store)
if (!globalThis.crypto?.randomUUID) {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
      value: {},
      writable: true,
      configurable: true,
    })
  }
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: (): string => `test-uuid-${Math.random().toString(36).substring(2)}`,
  })
}

// 3. Mock matchMedia (used in useViewMode/EditorMarkdown)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 4. Reset Pinia before each test for isolation
beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

// 5. Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
