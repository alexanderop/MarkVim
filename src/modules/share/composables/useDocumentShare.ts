import type { Document } from '~/modules/documents/api'
import { useClipboard } from '@vueuse/core'
import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate'
import { readonly, ref } from 'vue'

export interface ShareableDocument {
  id: string
  title: string
  content: string
  createdAt: number
  sharedAt: number
}

export function useDocumentShare() {
  const { copy: copyToClipboard, isSupported: clipboardSupported } = useClipboard()
  const isSharing = ref(false)
  const isImporting = ref(false)
  const shareError = ref<string | null>(null)
  const importError = ref<string | null>(null)

  const MAX_COMPRESSED_SIZE = 50_000 // 50KB

  function generateShareLink(document: Document): string | null {
    shareError.value = null

    if (!document || !document.content) {
      shareError.value = 'No document content to share'
      return null
    }

    try {
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

      if (!encodedData) {
        shareError.value = 'Failed to compress document data'
        return null
      }

      if (encodedData.length > MAX_COMPRESSED_SIZE) {
        shareError.value = `Document is too large to share via link (${Math.round(encodedData.length / 1000)}KB compressed). Try sharing a smaller document.`
        return null
      }

      const baseUrl = window.location.origin + window.location.pathname
      const shareUrl = `${baseUrl}#share=${encodedData}`

      return shareUrl
    }
    catch (error) {
      shareError.value = 'Failed to generate share link'
      console.error('Share generation error:', error)
      return null
    }
  }

  async function shareDocument(document: Document): Promise<boolean> {
    if (!document)
      return false

    isSharing.value = true
    shareError.value = null

    try {
      const shareUrl = generateShareLink(document)

      if (!shareUrl) {
        return false
      }

      if (clipboardSupported.value) {
        await copyToClipboard(shareUrl)
        return true
      }
      else {
        shareError.value = 'Clipboard access not supported in this browser'
        return false
      }
    }
    catch (error) {
      shareError.value = 'Failed to copy share link to clipboard'
      console.error('Share error:', error)
      return false
    }
    finally {
      isSharing.value = false
    }
  }

  function parseShareUrl(url?: string): ShareableDocument | null {
    importError.value = null

    try {
      const targetUrl = url || window.location.href
      const urlObj = new URL(targetUrl)

      const hash = urlObj.hash
      if (!hash || !hash.startsWith('#share=')) {
        return null
      }

      const encodedData = hash.slice(7)
      if (!encodedData) {
        importError.value = 'No share data found in URL'
        return null
      }

      const compressedData = Uint8Array.from(atob(encodedData), c => c.charCodeAt(0))
      const decompressed = gunzipSync(compressedData)
      const jsonString = strFromU8(decompressed)

      if (!jsonString) {
        importError.value = 'Failed to decode share data. The link may be corrupted.'
        return null
      }

      const shareableDoc = JSON.parse(jsonString) as ShareableDocument

      if (!shareableDoc.content || typeof shareableDoc.content !== 'string') {
        importError.value = 'Invalid document data in share link'
        return null
      }

      return shareableDoc
    }
    catch (error) {
      importError.value = 'Failed to parse share link. The link may be invalid or corrupted.'
      console.error('Import parsing error:', error)
      return null
    }
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

  async function importFromUrl(url?: string): Promise<Document | null> {
    isImporting.value = true
    importError.value = null

    try {
      const shareableDoc = parseShareUrl(url)
      if (!shareableDoc) {
        return null
      }

      const importedDoc = importSharedDocument(shareableDoc)
      return importedDoc
    }
    catch (error) {
      importError.value = 'Failed to import document from share link'
      console.error('Import error:', error)
      return null
    }
    finally {
      isImporting.value = false
    }
  }

  function clearShareFromUrl(): void {
    if (window.location.hash.startsWith('#share=')) {
      const newUrl = window.location.pathname + window.location.search
      window.history.replaceState(null, '', newUrl)
    }
  }

  function getDocumentTitle(content: string): string {
    const firstLine = content.split('\n')[0].trim()
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '') || 'Untitled'
    }
    return firstLine || 'Untitled'
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

    getDocumentTitle,
  }
}
