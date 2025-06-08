Feature: Document Management
  As a user of MarkVim
  I want to create, manage, and delete documents
  So I can effectively organize my notes.

  Scenario: A user can create a new document
    Given I am on the MarkVim application
    When I click the "New note" button
    Then the document title in the header should be "New Note"
    And I should see "# New Note" in the editor content

  Scenario: A user can delete a document
    Given I see the default document titled "Welcome to MarkVim"
    When I click the "Delete note" button in the header
    Then I should see the "Delete Document" confirmation modal
    And the modal should contain the text "Are you sure you want to delete"
    When I click the "Delete" confirmation button
    Then the "Welcome to MarkVim" document should no longer be in the document list

  Scenario: A user can toggle the sidebar with keyboard shortcut
    Given I am on the MarkVim application
    And the sidebar is visible
    When I press "Meta+Shift+Backslash"
    Then the sidebar should be hidden
    When I press "Meta+Shift+Backslash" again
    Then the sidebar should be visible

  Scenario: A user can switch between view modes with keyboard shortcuts
    Given I am on the MarkVim application
    And the view mode is "split"
    When I press "1"
    Then the view mode should be "editor"
    And only the editor should be visible
    When I press "2"
    Then the view mode should be "split"
    And both editor and preview should be visible
    When I press "3"
    Then the view mode should be "preview"
    And only the preview should be visible