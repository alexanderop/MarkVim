import type { Document as DocType } from '~/shared/types/Document'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { documentFactory } from '../../../../tests/factories'
import DocumentListClient from '../components/DocumentList.client.vue'
import { useDocumentsStore } from '../store'

type MountedWrapper = Awaited<ReturnType<typeof mountSuspended>>

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

interface DocumentListPage {
  getDocumentByTitle: (title: string) => Element | undefined
  getDocumentCount: () => string
  getCreateButton: () => Element | undefined
  clickCreateDocument: () => Promise<void>
}

// Page Object Factory
async function createDocumentListPage(): Promise<DocumentListPage> {
  const store = useDocumentsStore()

  const wrapper = await mountSuspended(DocumentListClient, {
    props: {
      documents: store.documents,
      activeDocumentId: store.state.activeDocumentId,
    },
  })

  return createPageHelpers(wrapper)
}

async function createDocumentListPageWithDocs(documents: DocType[], activeDocumentId: string): Promise<DocumentListPage> {
  const wrapper = await mountSuspended(DocumentListClient, {
    props: {
      documents,
      activeDocumentId,
    },
  })

  return createPageHelpers(wrapper)
}

function createPageHelpers(wrapper: MountedWrapper): DocumentListPage {
  return {
    // Getters
    getDocumentByTitle: (title: string): Element | undefined => {
      const elements: Element[] = Array.from(wrapper.element.querySelectorAll('*'))
      return elements.find((el: Element) => el.textContent?.includes(title))
    },
    getDocumentCount: (): string => {
      const sidebar = wrapper.find('[aria-label="Documents"]')
      return sidebar.element.querySelector('.rounded-full span')?.textContent ?? ''
    },
    getCreateButton: (): Element | undefined => {
      return wrapper.find('[aria-label="Create new document"]').element
    },

    // Actions
    clickCreateDocument: async (): Promise<void> => {
      const createBtn = wrapper.find('[aria-label="Create new document"]')
      await createBtn.trigger('click')
    },
  }
}
