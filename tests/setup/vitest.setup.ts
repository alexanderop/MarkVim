import { cleanup } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import ResizeObserver from 'resize-observer-polyfill'
import { afterEach, beforeEach, vi } from 'vitest'

// 0. Suppress Vue's Suspense experimental warning (it's informational noise in tests)
// Vue uses console.info or console.log for this warning, not console.warn
// eslint-disable-next-line no-console
const originalInfo = console.info
// eslint-disable-next-line no-console
const originalLog = console.log

function isSuspenseWarning(message: unknown): boolean {
  return typeof message === 'string' && message.includes('Suspense') && message.includes('experimental')
}

// eslint-disable-next-line no-console
console.info = (...args: unknown[]): void => {
  if (isSuspenseWarning(args[0])) {
    return
  }
  originalInfo.apply(console, args)
}

// eslint-disable-next-line no-console
console.log = (...args: unknown[]): void => {
  if (isSuspenseWarning(args[0])) {
    return
  }
  originalLog.apply(console, args)
}

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
