import type { Document as DocType } from '~/shared/types/Document'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { fireEvent, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { documentFactory } from '../../../../tests/factories'
import DocumentListClient from '../components/DocumentList.client.vue'
import { useDocumentsStore } from '../store'

describe('feature: Document Management', () => {
  it('should render the default document from the store', async () => {
    const page = await createDocumentListPage()

    expect(page.getDocumentByTitle('Welcome to MarkVim')).toBeDefined()
    expect(page.getDocumentCount()).toBe('1')
  })

  it('should create a new document when add button is clicked', async () => {
    const store = useDocumentsStore()
    const initialCount = store.documents.length

    const page = await createDocumentListPage()

    await page.clickCreateDocument()

    // Get fresh store reference after action
    const updatedStore = useDocumentsStore()

    // Store should now have 1 more document than initially
    expect(updatedStore.documents.length).toBe(initialCount + 1)
    expect(updatedStore.documents[0]?.content).toContain('# New Note')
  })

  it('should render multiple documents when store has them', async () => {
    const store = useDocumentsStore()

    // Create additional documents via the real store
    store.dispatch({ type: 'CREATE_DOCUMENT', payload: undefined })
    store.dispatch({ type: 'CREATE_DOCUMENT', payload: undefined })

    const page = await createDocumentListPage()

    expect(page.getDocumentCount()).toBe('3')
  })

  it('should render documents created from factory', async () => {
    const store = useDocumentsStore()

    // Use factory to create test documents with realistic data
    const factoryDocs = documentFactory.buildList(2, {
      content: '# Factory Document\n\nCreated with Fishery',
    })

    // Combine default docs with factory-generated ones
    const allDocs = [...store.documents, ...factoryDocs]

    const page = await createDocumentListPageWithDocs(allDocs, store.state.activeDocumentId)

    expect(page.getDocumentCount()).toBe('3')
  })

  it('should display document with specific title from factory', async () => {
    // Create a document with a specific title we can assert on
    const testDoc = documentFactory.build({
      content: '# Test Factory Title\n\nSome content here',
    })

    const page = await createDocumentListPageWithDocs([testDoc], testDoc.id)

    expect(page.getDocumentByTitle('Test Factory Title')).toBeDefined()
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
      await fireEvent.click(createBtn)
    },
  }
}

async function createDocumentListPageWithDocs(documents: DocType[], activeDocumentId: string): Promise<{
  getDocumentByTitle: (title: string) => HTMLElement
  getDocumentCount: () => string
  getCreateButton: () => HTMLElement
  clickCreateDocument: () => Promise<void>
}> {
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
      await fireEvent.click(createBtn)
    },
  }
}
