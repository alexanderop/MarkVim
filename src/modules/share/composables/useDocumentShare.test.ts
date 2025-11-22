import { gzipSync, strToU8 } from 'fflate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useDocumentShare Security', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    // Restore original window properties
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  it('should reject documents that exceed the maximum decompressed size limit', async () => {
    // Create a document that exceeds 2MB when decompressed
    // 2MB = 2 * 1024 * 1024 = 2097152 bytes
    const OVER_TWO_MB = 2_100_000
    const hugeDoc = {
      id: 'test',
      title: 'Test',
      content: 'a'.repeat(OVER_TWO_MB), // Over 2MB
      createdAt: Date.now(),
      sharedAt: Date.now(),
    }

    // Compress it properly
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

    // Import fresh module
    const { useDocumentShare } = await import('./useDocumentShare')
    const { parseShareUrl, importError } = useDocumentShare()

    const result = parseShareUrl()

    // EXPECTATION: It should return null and set an error
    expect(result).toBeNull()
    expect(importError.value).toContain('too large')
  })

  it('should accept documents within the size limit', async () => {
    // Create a small valid document
    const smallDoc = {
      id: 'test-id',
      title: 'Test Document',
      content: 'Small content',
      createdAt: Date.now(),
      sharedAt: Date.now(),
    }

    // Compress it properly
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

    // Should successfully parse
    expect(result).not.toBeNull()
    expect(importError.value).toBeNull()
    expect(result?.content).toBe('Small content')
  })
})
