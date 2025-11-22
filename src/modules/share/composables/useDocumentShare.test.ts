import { gzipSync, strToU8 } from 'fflate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useDocumentShare', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  describe('when parsing shared document from URL', () => {
    it('should reject document that exceeds maximum decompressed size limit', async () => {
      const OVER_TWO_MB = 2_100_000
      const hugeDoc = {
        id: 'test',
        title: 'Test',
        content: 'a'.repeat(OVER_TWO_MB),
        createdAt: Date.now(),
        sharedAt: Date.now(),
      }

      const jsonString = JSON.stringify(hugeDoc)
      const compressed = gzipSync(strToU8(jsonString), { level: 9 })
      const encodedData = btoa(String.fromCharCode(...compressed))

      const mockHash = `#share=${encodedData}`
      Object.defineProperty(window, 'location', {
        value: {
          href: `http://localhost${mockHash}`,
          hash: mockHash,
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
      })

      const { useDocumentShare } = await import('./useDocumentShare')
      const { parseShareUrl, importError } = useDocumentShare()

      const result = parseShareUrl()

      expect(result).toBeNull()
      expect(importError.value).toContain('too large')
    })

    it('should accept document within the size limit', async () => {
      const smallDoc = {
        id: 'test-id',
        title: 'Test Document',
        content: 'Small content',
        createdAt: Date.now(),
        sharedAt: Date.now(),
      }

      const jsonString = JSON.stringify(smallDoc)
      const compressed = gzipSync(strToU8(jsonString), { level: 9 })
      const encodedData = btoa(String.fromCharCode(...compressed))

      const mockHash = `#share=${encodedData}`
      Object.defineProperty(window, 'location', {
        value: {
          href: `http://localhost${mockHash}`,
          hash: mockHash,
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
      })

      const { useDocumentShare } = await import('./useDocumentShare')
      const { parseShareUrl, importError } = useDocumentShare()
      const result = parseShareUrl()

      expect(result).not.toBeNull()
      expect(importError.value).toBeNull()
      expect(result?.content).toBe('Small content')
    })
  })
})
