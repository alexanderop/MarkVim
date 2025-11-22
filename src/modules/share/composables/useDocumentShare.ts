import type { Ref } from 'vue'
import type { Document } from '~/shared/types/Document'
import type { Result } from '~/shared/utils/result'
import { getDocumentTitle } from '@modules/documents'
import { useClipboard } from '@vueuse/core'
import { Gunzip, gzipSync, strFromU8, strToU8 } from 'fflate'
import { readonly, ref } from 'vue'
import { z } from 'zod'
import { Err, Ok, tryCatch, tryCatchAsync } from '~/shared/utils/result'

// Security constants for zip bomb protection
const BYTES_PER_KB = 1024
const MAX_DECOMPRESSED_SIZE = 2 * BYTES_PER_KB * BYTES_PER_KB // 2MB

/**
 * Safely decompress gzipped data with size limits to prevent zip bomb attacks.
 * Uses streaming decompression to abort early if size limit is exceeded,
 * preventing memory exhaustion before the limit is reached.
 */
function safeGunzip(compressedData: Uint8Array): Result<Uint8Array, Error> {
  let totalSize = 0
  const chunks: Uint8Array[] = []
  let aborted = false

  const gunzip = new Gunzip((chunk) => {
    if (aborted) {
      return
    }

    totalSize += chunk.length
    if (totalSize > MAX_DECOMPRESSED_SIZE) {
      aborted = true
      return
    }

    chunks.push(chunk)
  })

  gunzip.ondata = (chunk) => {
    if (aborted) {
      return
    }

    totalSize += chunk.length
    if (totalSize > MAX_DECOMPRESSED_SIZE) {
      aborted = true
      return
    }

    chunks.push(chunk)
  }

  const pushResult = tryCatch(
    () => {
      gunzip.push(compressedData, true)
      return null
    },
    error => (error instanceof Error ? error : new Error(String(error))),
  )

  if (!pushResult.ok) {
    return Err(pushResult.error)
  }

  // eslint-disable-next-line ts/no-unnecessary-condition -- aborted is set in callback
  if (aborted) {
    return Err(new Error('Document is too large to process safely.'))
  }

  // Combine chunks into single Uint8Array
  const result = new Uint8Array(totalSize)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return Ok(result)
}

export interface ShareableDocument {
  id: string
  title: string
  content: string
  createdAt: number
  sharedAt: number
}

const ShareableDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.number(),
  sharedAt: z.number(),
})

export function useDocumentShare(): {
  isSharing: Readonly<Ref<boolean>>
  isImporting: Readonly<Ref<boolean>>
  shareError: Readonly<Ref<string | null>>
  importError: Readonly<Ref<string | null>>
  clipboardSupported: Readonly<Ref<boolean>>
  generateShareLink: (document: Document) => string | null
  shareDocument: (document: Document) => Promise<boolean>
  parseShareUrl: (url?: string) => ShareableDocument | null
  importFromUrl: (url?: string) => Promise<Document | null>
  clearShareFromUrl: () => void
  getShareStats: (document: Document) => { originalSize: number, compressedSize: number, compressionRatio: number, canShare: boolean }
} {
  const { copy: copyToClipboard, isSupported: clipboardSupported } = useClipboard()
  const isSharing = ref(false)
  const isImporting = ref(false)
  const shareError = ref<string | null>(null)
  const importError = ref<string | null>(null)

  const MAX_COMPRESSED_SIZE = 50_000 // 50KB
  const BYTES_TO_KB_DIVISOR = 1000
  const GZIP_COMPRESSION_LEVEL = 9
  const SHARE_PREFIX_LENGTH = 7 // Length of '#share='

  function generateShareLink(document: Document): string | null {
    shareError.value = null

    if (!document.content) {
      shareError.value = 'No document content to share'
      return null
    }

    const result = tryCatch(
      () => {
        const shareableDoc: ShareableDocument = {
          id: document.id,
          title: getDocumentTitle(document.content),
          content: document.content,
          createdAt: document.createdAt,
          sharedAt: Date.now(),
        }

        const jsonString = JSON.stringify(shareableDoc)
        const compressed = gzipSync(strToU8(jsonString), { level: GZIP_COMPRESSION_LEVEL })
        const encodedData = btoa(String.fromCharCode(...compressed))

        if (!encodedData) {
          return Err(new Error('Failed to compress document data'))
        }

        if (encodedData.length > MAX_COMPRESSED_SIZE) {
          return Err(new Error(`Document is too large to share via link (${Math.round(encodedData.length / BYTES_TO_KB_DIVISOR)}KB compressed). Try sharing a smaller document.`))
        }

        const baseUrl = window.location.origin + window.location.pathname
        const shareUrl = `${baseUrl}#share=${encodedData}`

        return Ok(shareUrl)
      },
      error => (error instanceof Error ? error : new Error(String(error))),
    )

    if (result.ok) {
      const innerResult = result.value
      if (innerResult.ok) {
        return innerResult.value
      }
      shareError.value = innerResult.error.message
      return null
    }

    shareError.value = 'Failed to generate share link'
    console.error('Share generation error:', result.error)
    return null
  }

  async function shareDocument(document: Document): Promise<boolean> {
    isSharing.value = true
    shareError.value = null

    const shareResult = await tryCatchAsync(
      async () => {
        const shareUrl = generateShareLink(document)

        if (!shareUrl) {
          return Ok(false)
        }

        if (clipboardSupported.value) {
          await copyToClipboard(shareUrl)
          return Ok(true)
        }

        shareError.value = 'Clipboard access not supported in this browser'
        return Ok(false)
      },
      error => (error instanceof Error ? error : new Error(String(error))),
    )

    isSharing.value = false

    if (!shareResult.ok) {
      shareError.value = 'Failed to copy share link to clipboard'
      console.error('Share error:', shareResult.error)
      return false
    }

    return shareResult.value.ok ? shareResult.value.value : false
  }

  function parseShareUrl(url?: string): ShareableDocument | null {
    importError.value = null

    const parseResult = tryCatch(
      () => {
        // eslint-disable-next-line ts/prefer-nullish-coalescing
        const targetUrl = url || window.location.href
        const urlObj = new URL(targetUrl)

        const hash = urlObj.hash
        if (!hash || !hash.startsWith('#share=')) {
          return null
        }

        const encodedData = hash.slice(SHARE_PREFIX_LENGTH)
        if (!encodedData) {
          importError.value = 'No share data found in URL'
          return null
        }

        const compressedData = Uint8Array.from(atob(encodedData), c => c.charCodeAt(0))

        // Security: Use streaming decompression with size limit to prevent zip bomb attacks
        const decompressResult = safeGunzip(compressedData)
        if (!decompressResult.ok) {
          importError.value = decompressResult.error.message
          return null
        }

        const jsonString = strFromU8(decompressResult.value)

        if (!jsonString) {
          importError.value = 'Failed to decode share data. The link may be corrupted.'
          return null
        }

        const parsedData = JSON.parse(jsonString)
        const result = ShareableDocumentSchema.safeParse(parsedData)

        if (!result.success) {
          importError.value = 'Invalid document data in share link'
          return null
        }

        return result.data
      },
      error => (error instanceof Error ? error : new Error(String(error))),
    )

    if (parseResult.ok) {
      return parseResult.value
    }

    importError.value = 'Failed to parse share link. The link may be invalid or corrupted.'
    console.error('Import parsing error:', parseResult.error)
    return null
  }

  function importSharedDocument(shareableDoc: ShareableDocument): Document {
    const importedDoc: Document = {
      id: crypto.randomUUID(),
      content: shareableDoc.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    return importedDoc
  }

  function importFromUrl(url?: string): Promise<Document | null> {
    isImporting.value = true
    importError.value = null

    const importResult = tryCatch(
      () => {
        const shareableDoc = parseShareUrl(url)
        if (!shareableDoc) {
          return null
        }

        const importedDoc = importSharedDocument(shareableDoc)
        return importedDoc
      },
      error => (error instanceof Error ? error : new Error(String(error))),
    )

    isImporting.value = false

    if (importResult.ok) {
      return Promise.resolve(importResult.value)
    }

    importError.value = 'Failed to import document from share link'
    console.error('Import error:', importResult.error)
    return Promise.resolve(null)
  }

  function clearShareFromUrl(): void {
    if (window.location.hash.startsWith('#share=')) {
      const newUrl = window.location.pathname + window.location.search
      window.history.replaceState(null, '', newUrl)
    }
  }

  function getShareStats(document: Document): {
    originalSize: number
    compressedSize: number
    compressionRatio: number
    canShare: boolean
  } {
    const shareableDoc: ShareableDocument = {
      id: document.id,
      title: getDocumentTitle(document.content),
      content: document.content,
      createdAt: document.createdAt,
      sharedAt: Date.now(),
    }

    const jsonString = JSON.stringify(shareableDoc)
    const compressed = gzipSync(strToU8(jsonString), { level: 9 })
    const encodedData = btoa(String.fromCharCode(...compressed))

    const originalSize = new TextEncoder().encode(jsonString).length
    const compressedSize = encodedData ? new TextEncoder().encode(encodedData).length : 0
    const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1
    const canShare = compressedSize > 0 && compressedSize <= MAX_COMPRESSED_SIZE

    return {
      originalSize,
      compressedSize,
      compressionRatio,
      canShare,
    }
  }

  return {
    isSharing: readonly(isSharing),
    isImporting: readonly(isImporting),
    shareError: readonly(shareError),
    importError: readonly(importError),
    clipboardSupported: readonly(clipboardSupported),

    generateShareLink,
    shareDocument,
    parseShareUrl,
    importFromUrl,
    clearShareFromUrl,
    getShareStats,
  }
}
