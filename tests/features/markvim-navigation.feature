Feature: MarkVim Navigation and View Modes

  Background:
    Given I am on the MarkVim homepage

  @smoke
  Scenario: Switch between view modes
    When I switch to editor view
    Then the editor pane should be visible
    And the preview pane should not be visible
    
    When I switch to preview view
    Then the preview pane should be visible
    And the editor pane should not be visible
    
    When I switch to split view
    Then both editor and preview panes should be visible

  @smoke
  Scenario: Command palette accessibility
    When I open the command palette
    Then the command palette should be visible
    And the search input should be focused
    
    When I press the key "Escape"
    Then element with testid "command-palette" should not be visible

  Scenario: Quick keyboard navigation
    When I press the key "Cmd+K"
    Then element with testid "command-palette" should be visible
    
    When I press the key "Escape"
    And I press the key "Ctrl+K"
    Then element with testid "command-palette" should be visible

  Scenario: Document management
    When I create a new document
    Then the MarkVim UI should be fully loaded
    And the document list should be visible 