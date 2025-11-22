import type { Document as DocType } from '~/shared/types/Document'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { documentFactory } from '../../../../tests/factories'
import DocumentListClient from '../components/DocumentList.client.vue'
import { useDocumentsStore } from '../store'

describe('documentList', () => {
  describe('when viewing default state', () => {
    it('should display the welcome document', async () => {
      const page = await createDocumentListPage()

      expect(page.getDocumentByTitle('Welcome to MarkVim')).toBeDefined()
    })

    it('should show document count as 1', async () => {
      const page = await createDocumentListPage()

      expect(page.getDocumentCount()).toBe('1')
    })
  })

  describe('when creating a new document', () => {
    it('should add document to store when add button is clicked', async () => {
      const store = useDocumentsStore()
      const initialCount = store.documents.length

      const page = await createDocumentListPage()

      await page.clickCreateDocument()

      const updatedStore = useDocumentsStore()

      expect(updatedStore.documents.length).toBe(initialCount + 1)
    })

    it('should create document with default content', async () => {
      const page = await createDocumentListPage()

      await page.clickCreateDocument()

      const updatedStore = useDocumentsStore()

      expect(updatedStore.documents[0]?.content).toContain('# New Note')
    })
  })

  describe('when store has multiple documents', () => {
    it('should display correct document count', async () => {
      const store = useDocumentsStore()

      store.dispatch({ type: 'CREATE_DOCUMENT', payload: undefined })
      store.dispatch({ type: 'CREATE_DOCUMENT', payload: undefined })

      const page = await createDocumentListPage()

      expect(page.getDocumentCount()).toBe('3')
    })

    it('should render all documents from factory', async () => {
      const store = useDocumentsStore()

      const factoryDocs = documentFactory.buildList(2, {
        content: '# Factory Document\n\nCreated with Fishery',
      })

      const allDocs = [...store.documents, ...factoryDocs]

      const page = await createDocumentListPageWithDocs(allDocs, store.state.activeDocumentId)

      expect(page.getDocumentCount()).toBe('3')
    })
  })

  describe('when displaying factory-created document', () => {
    it('should show document title extracted from content', async () => {
      const testDoc = documentFactory.build({
        content: '# Test Factory Title\n\nSome content here',
      })

      const page = await createDocumentListPageWithDocs([testDoc], testDoc.id)

      expect(page.getDocumentByTitle('Test Factory Title')).toBeDefined()
    })
  })
})

// Page Object Factory
async function createDocumentListPage(): Promise<{
  getDocumentByTitle: (title: string) => HTMLElement
  getDocumentCount: () => string
  getCreateButton: () => HTMLElement
  clickCreateDocument: () => Promise<void>
}> {
  const store = useDocumentsStore()
  const user = userEvent.setup()

  await renderSuspended(DocumentListClient, {
    props: {
      documents: store.documents,
      activeDocumentId: store.state.activeDocumentId,
    },
  })

  return {
    // Getters
    getDocumentByTitle: (title: string) => screen.getByText(title),
    getDocumentCount: () => screen.getByRole('complementary', { name: 'Documents' }).querySelector('.rounded-full span')?.textContent ?? '',
    getCreateButton: () => screen.getByRole('button', { name: 'Create new document' }),

    // Actions
    clickCreateDocument: async () => {
      const createBtn = screen.getByRole('button', { name: 'Create new document' })
      await user.click(createBtn)
    },
  }
}

async function createDocumentListPageWithDocs(documents: DocType[], activeDocumentId: string): Promise<{
  getDocumentByTitle: (title: string) => HTMLElement
  getDocumentCount: () => string
  getCreateButton: () => HTMLElement
  clickCreateDocument: () => Promise<void>
}> {
  const user = userEvent.setup()

  await renderSuspended(DocumentListClient, {
    props: {
      documents,
      activeDocumentId,
    },
  })

  return {
    // Getters
    getDocumentByTitle: (title: string) => screen.getByText(title),
    getDocumentCount: () => screen.getByRole('complementary', { name: 'Documents' }).querySelector('.rounded-full span')?.textContent ?? '',
    getCreateButton: () => screen.getByRole('button', { name: 'Create new document' }),

    // Actions
    clickCreateDocument: async () => {
      const createBtn = screen.getByRole('button', { name: 'Create new document' })
      await user.click(createBtn)
    },
  }
}
