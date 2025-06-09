Feature: MarkVim UI Elements

  Scenario: Essential UI components are present
    Given I open the MarkVim homepage
    Then the following elements are visible
      | testid                      |
      | header-toolbar              |
      | editor-pane                 |
      | preview-pane                |
      | status-bar                  |

  Scenario: Command palette can be opened
    Given I open the MarkVim homepage  
    When I press "Cmd+K"
    Then the command palette should be visible
    And the search input should be focused

  Scenario: Split view mode works correctly
    Given I open the MarkVim homepage
    Then both editor and preview panes should be visible
    And the view mode toggle should be present

  Scenario: Sidebar functionality works
    Given I open the MarkVim homepage
    Then the document list should be visible
    And the create document button should be present

  Scenario: Note deletion functionality works
    Given I open the MarkVim homepage
    When I click on element with testid "delete-document-btn"
    Then element with testid "delete-confirm-modal" should be visible
    And element with testid "delete-confirm-btn" should be visible
    And element with testid "delete-cancel-btn" should be visible
    When I click on element with testid "delete-confirm-btn"
    Then element with testid "delete-confirm-modal" should not be visible
    And a new document should be created automatically

  Scenario: Create note and edit with vim motions
    Given I open the MarkVim homepage
    When I create a new document
    Then a new document should be created automatically
    When I focus the editor
    And I press "i" to enter insert mode
    And I type "# My Test Note" in the editor
    And I press "Escape" to exit insert mode
    And I press "o" to create new line and enter insert mode
    And I type "This is a **bold** text with vim motions." in the editor
    And I press "Escape" to exit insert mode
    Then the preview should contain "My Test Note"
    And the preview should contain "This is a bold text with vim motions."
    And the preview should have rendered markdown formatting

  Scenario: Keyboard shortcuts for view mode switching
    Given I open the MarkVim homepage
    When I press "1"
    Then the editor pane should be visible
    And the preview pane should not be visible
    When I press "2"
    Then both editor and preview panes should be visible
    When I press "3"
    Then the preview pane should be visible
    And the editor pane should not be visible

  Scenario: Sidebar toggle keyboard shortcut
    Given I open the MarkVim homepage
    Then the document list should be visible
    When I toggle the sidebar with keyboard shortcut
    Then element with testid "document-list" should not be visible
    When I toggle the sidebar with keyboard shortcut
    Then element with testid "document-list" should be visible 

  Scenario: Theme toggle functionality works
    Given I open the MarkVim homepage
    When I open the settings modal
    Then the settings modal should be visible
    When I switch to light theme
    Then the theme should be stored in localStorage as "light"
    And the document should have "light" theme class
    When I switch to dark theme
    Then the theme should be stored in localStorage as "dark"
    And the document should have "dark" theme class