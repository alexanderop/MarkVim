import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class MarkVimPage {
  readonly page: Page
  readonly headerToolbar: Locator
  readonly headerTitle: Locator
  readonly editorPane: Locator
  readonly editorContent: Locator
  readonly previewPane: Locator
  readonly previewContent: Locator
  readonly statusBar: Locator
  readonly commandPalette: Locator
  readonly commandPaletteSearch: Locator
  readonly viewModeToggle: Locator
  readonly viewModeEditor: Locator
  readonly viewModeSplit: Locator
  readonly viewModePreview: Locator
  readonly documentList: Locator
  readonly createDocumentBtn: Locator
  readonly settingsModalTrigger: Locator
  readonly settingsModal: Locator
  readonly themeToggleLight: Locator
  readonly themeToggleDark: Locator

  constructor(page: Page) {
    this.page = page
    this.headerToolbar = page.locator('[data-testid="header-toolbar"]')
    this.headerTitle = this.headerToolbar.locator('h1')
    this.editorPane = page.locator('[data-testid="editor-pane"]')
    this.editorContent = this.editorPane.locator('.cm-content')
    this.previewPane = page.locator('[data-testid="preview-pane"]')
    this.previewContent = this.previewPane.locator('.prose')
    this.statusBar = page.locator('[data-testid="status-bar"]')
    this.commandPalette = page.locator('[data-testid="command-palette"]')
    this.commandPaletteSearch = page.locator('[data-testid="command-palette-search"]')
    this.viewModeToggle = page.locator('[data-testid="view-mode-toggle"]')
    this.viewModeEditor = page.locator('[data-testid="view-mode-editor"]')
    this.viewModeSplit = page.locator('[data-testid="view-mode-split"]')
    this.viewModePreview = page.locator('[data-testid="view-mode-preview"]')
    this.documentList = page.locator('[data-testid="document-list"]')
    this.createDocumentBtn = page.locator('[data-testid="create-document-btn"]')
    this.settingsModalTrigger = page.locator('[data-testid="settings-modal-trigger"]')
    this.settingsModal = page.locator('[data-testid="settings-modal"]')
    this.themeToggleLight = page.locator('[data-testid="theme-light-btn"]')
    this.themeToggleDark = page.locator('[data-testid="theme-dark-btn"]')
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
      '1': 'Digit1',
      '2': 'Digit2',
      '3': 'Digit3',
      'Cmd+Shift+\\': 'Meta+Shift+Backslash',
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

  async verifyNewDocumentCreated(): Promise<void> {
    await expect(this.headerTitle).toHaveText('New Note')
  }

  async focusEditor(): Promise<void> {
    await this.editorContent.click()
  }

  async typeInEditor(text: string): Promise<void> {
    await this.page.keyboard.type(text)
  }

  async verifyPreviewContains(text: string): Promise<void> {
    await expect(this.previewContent).toContainText(text)
  }

  async verifyMarkdownRendering(): Promise<void> {
    await expect(this.previewContent.locator('h1')).toBeVisible()
    await expect(this.previewContent.locator('strong')).toBeVisible()
  }

  async toggleSidebarWithKeyboard(): Promise<void> {
    await this.page.keyboard.press('Meta+Shift+Backslash')
  }

  async verifyViewModeInLocalStorage(expectedMode: string): Promise<void> {
    const storedValue = await this.page.evaluate(() => {
      return localStorage.getItem('markvim-view-mode')
    })
    expect(storedValue).toBe(expectedMode)
  }

  async verifyCurrentViewMode(expectedMode: string): Promise<void> {
    // Check for the active indicator element which is more reliable
    const activeIndicator = this.page.locator(`[data-testid="view-mode-${expectedMode}-active"]`)
    await expect(activeIndicator).toBeVisible()

    // Also verify the UI state matches the expected mode
    if (expectedMode === 'editor') {
      await expect(this.editorPane).toBeVisible()
      await expect(this.previewPane).toBeHidden()
    }
    else if (expectedMode === 'preview') {
      await expect(this.previewPane).toBeVisible()
      await expect(this.editorPane).toBeHidden()
    }
    else if (expectedMode === 'split') {
      await expect(this.editorPane).toBeVisible()
      await expect(this.previewPane).toBeVisible()
    }
  }

  async reloadPage(): Promise<void> {
    await this.page.reload()
    await this.page.waitForLoadState('networkidle')
  }

  async openSettingsModal(): Promise<void> {
    await this.settingsModalTrigger.click()
    await expect(this.settingsModal).toBeVisible()
  }

  async verifySettingsModalVisible(): Promise<void> {
    await expect(this.settingsModal).toBeVisible()
  }

  async switchToLightTheme(): Promise<void> {
    await this.themeToggleLight.click()
  }

  async switchToDarkTheme(): Promise<void> {
    await this.themeToggleDark.click()
  }

  async verifyThemeInLocalStorage(expectedTheme: string): Promise<void> {
    const storedValue = await this.page.evaluate(() => {
      return localStorage.getItem('markvim-theme')
    })
    expect(storedValue).toBe(expectedTheme)
  }

  async verifyDocumentHasThemeClass(expectedTheme: string): Promise<void> {
    const htmlElement = this.page.locator('html')
    if (expectedTheme === 'dark') {
      await expect(htmlElement).toHaveClass(/dark/)
    }
    else if (expectedTheme === 'light') {
      await expect(htmlElement).not.toHaveClass(/dark/)
    }
  }
}
