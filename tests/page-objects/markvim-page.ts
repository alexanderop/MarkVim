import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class MarkVimPage {
  readonly page: Page
  readonly headerToolbar: Locator
  readonly editorPane: Locator
  readonly previewPane: Locator
  readonly statusBar: Locator
  readonly commandPalette: Locator
  readonly commandPaletteSearch: Locator
  readonly viewModeToggle: Locator
  readonly viewModeEditor: Locator
  readonly viewModeSplit: Locator
  readonly viewModePreview: Locator
  readonly documentList: Locator
  readonly createDocumentBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.headerToolbar = page.locator('[data-testid="header-toolbar"]')
    this.editorPane = page.locator('[data-testid="editor-pane"]')
    this.previewPane = page.locator('[data-testid="preview-pane"]')
    this.statusBar = page.locator('[data-testid="status-bar"]')
    this.commandPalette = page.locator('[data-testid="command-palette"]')
    this.commandPaletteSearch = page.locator('[data-testid="command-palette-search"]')
    this.viewModeToggle = page.locator('[data-testid="view-mode-toggle"]')
    this.viewModeEditor = page.locator('[data-testid="view-mode-editor"]')
    this.viewModeSplit = page.locator('[data-testid="view-mode-split"]')
    this.viewModePreview = page.locator('[data-testid="view-mode-preview"]')
    this.documentList = page.locator('[data-testid="document-list"]')
    this.createDocumentBtn = page.locator('[data-testid="create-document-btn"]')
  }

  async navigate(): Promise<void> {
    await this.page.goto('http://localhost:3000')
    await this.page.waitForLoadState('networkidle')
  }

  async pressKey(key: string): Promise<void> {
    const keyMap: Record<string, string> = {
      'Cmd+K': 'Meta+KeyK',
      'Ctrl+K': 'Control+KeyK',
      'Escape': 'Escape',
      'Tab': 'Tab',
      'Enter': 'Enter',
    }

    const mappedKey = keyMap[key] || key
    await this.page.keyboard.press(mappedKey)
  }

  async openCommandPalette(): Promise<void> {
    await this.pressKey('Cmd+K')
  }

  async verifyElementsVisible(dataTable: any): Promise<void> {
    const testids: string[] = dataTable.raw().slice(1).flat()
    for (const testid of testids) {
      await expect(this.page.locator(`[data-testid="${testid}"]`)).toBeVisible()
    }
  }

  async verifyCommandPaletteVisible(): Promise<void> {
    await expect(this.commandPalette).toBeVisible()
  }

  async verifySearchInputFocused(): Promise<void> {
    await expect(this.commandPaletteSearch).toBeFocused()
  }

  async verifyBothPanesVisible(): Promise<void> {
    await expect(this.editorPane).toBeVisible()
    await expect(this.previewPane).toBeVisible()
  }

  async verifyViewModeTogglePresent(): Promise<void> {
    await expect(this.viewModeToggle).toBeVisible()
  }

  async verifyDocumentListVisible(): Promise<void> {
    await expect(this.documentList).toBeVisible()
  }

  async verifyCreateDocumentButtonPresent(): Promise<void> {
    await expect(this.createDocumentBtn).toBeVisible()
  }

  async verifyUIFullyLoaded(): Promise<void> {
    const essentialElements = ['header-toolbar', 'editor-pane', 'preview-pane', 'status-bar']
    for (const testid of essentialElements) {
      await expect(this.page.locator(`[data-testid="${testid}"]`)).toBeVisible()
    }
  }

  async switchToEditorView(): Promise<void> {
    await this.viewModeEditor.click()
  }

  async switchToSplitView(): Promise<void> {
    await this.viewModeSplit.click()
  }

  async switchToPreviewView(): Promise<void> {
    await this.viewModePreview.click()
  }

  async createNewDocument(): Promise<void> {
    await this.createDocumentBtn.click()
  }
}
