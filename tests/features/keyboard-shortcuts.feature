Feature: Keyboard Shortcuts Modal

  Background:
    Given I am on the MarkVim homepage

  @smoke
  Scenario: Keyboard shortcuts modal displays correctly via button click
    When I click the keyboard shortcuts button
    Then the keyboard shortcuts modal should be visible
    And the modal should have title "Keyboard Shortcuts"
    And the shortcuts should be properly categorized

  @smoke
  Scenario: Keyboard shortcuts modal displays correctly via question mark key
    When I press "?"
    Then the keyboard shortcuts modal should be visible
    And the modal should have title "Keyboard Shortcuts"
    And the shortcuts should be properly categorized

  Scenario: Keyboard shortcuts modal shows all expected categories
    When I click the keyboard shortcuts button
    Then the modal should display category "Navigation"
    And the modal should display category "View" 
    And the modal should display category "File"
    And the modal should display category "Settings"
    And the modal should display category "Help"

  Scenario: No duplicate shortcuts in modal
    When I click the keyboard shortcuts button
    Then there should be no duplicate shortcuts displayed
    And each shortcut should appear only once

  Scenario: All essential shortcuts are present
    When I click the keyboard shortcuts button
    Then the modal should contain shortcut "Open command palette"
    And the modal should contain shortcut "Switch to Editor only"
    And the modal should contain shortcut "Switch to Split view"
    And the modal should contain shortcut "Switch to Preview only"
    And the modal should contain shortcut "Toggle sidebar"
    And the modal should contain shortcut "Save document"
    And the modal should contain shortcut "New Document"
    And the modal should contain shortcut "Download as Markdown"
    And the modal should contain shortcut "Open settings"
    And the modal should contain shortcut "Show keyboard shortcuts"

  Scenario: Settings shortcuts use single keys
    When I click the keyboard shortcuts button
    Then the modal should contain shortcut "Toggle Line Numbers"
    And the shortcut "Toggle Line Numbers" should use key "L"
    And the modal should contain shortcut "Toggle Preview Sync"
    And the shortcut "Toggle Preview Sync" should use key "P"
    And the modal should contain shortcut "Toggle Vim Mode"
    And the shortcut "Toggle Vim Mode" should use key "V"

  Scenario: Single key settings shortcuts work functionally
    Given I am on the MarkVim homepage
    When I press "l"
    Then line numbers should be toggled
    When I press "p"
    Then preview sync should be toggled
    When I press "v"
    Then vim mode should be toggled
    And the vim mode indicator should show the new state

  Scenario: Modal can be opened both ways
    When I click the keyboard shortcuts button
    Then the keyboard shortcuts modal should be visible
    When I press "Escape"
    Then the keyboard shortcuts modal should not be visible
    When I press "?"
    Then the keyboard shortcuts modal should be visible

  Scenario: Modal can be closed with escape key
    Given the keyboard shortcuts modal is open
    When I press "Escape"
    Then the keyboard shortcuts modal should not be visible

  Scenario: Shortcuts are formatted properly
    When I click the keyboard shortcuts button
    Then shortcuts should display formatted key combinations
    And single keys should be displayed properly
    And modifier keys should use platform-specific symbols

  Scenario: All shortcuts show keyboard combinations
    When I click the keyboard shortcuts button
    Then all shortcuts should have visible key combinations
    And no shortcuts should be missing key bindings
    And settings shortcuts should have proper key combinations 