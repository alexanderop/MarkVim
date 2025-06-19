Feature: Documents Management
  As a user
  I want to manage my documents effectively
  So that I can organize and access my content easily

  Background:
    Given I navigate to the App
    When the page is loaded

  Scenario: Toggle sidebar visibility using g+t keyboard shortcut
    Given the sidebar is visible
    When I press the "g+t" keyboard shortcut
    Then the sidebar should be hidden
    When I press the "g+t" keyboard shortcut
    Then the sidebar should be visible

  Scenario: Default document is listed in the sidebar
    Given the sidebar is visible
    Then I should see "Welcome to MarkVim" in the document-list
    And the document-list should contain 1 document
    And the first document should be "Welcome to MarkVim"

  Scenario: Sidebar toggle button works
    Given the sidebar is visible
    When I click the sidebar-toggle button
    Then the sidebar should be hidden
    When I click the sidebar-toggle button
    Then the sidebar should be visible

  Scenario: Document list shows correct information
    Given the sidebar is visible
    Then I should see "Welcome to MarkVim" in the document-list
    And the document should show a preview text
    And the document should show a timestamp

  Scenario: Create new document from sidebar
    Given the sidebar is visible
    When I create a new document
    Then a new document should be created
    And the document should be active
    And the document-list should contain 2 documents

  Scenario: Complete sidebar workflow
    Given the sidebar is visible
    When I toggle the sidebar
    Then the sidebar should be hidden
    When I toggle the sidebar  
    Then the sidebar should be visible
    And the document-list should contain 1 document

  Scenario: Delete document confirmation modal
    Given the sidebar is visible
    And the document-list should contain 1 document
    When I click the delete-document button
    Then the delete-modal should be visible
    And the delete modal should contain the document title "Welcome to MarkVim"

  Scenario: Cancel document deletion
    Given the sidebar is visible
    And the document-list should contain 1 document
    When I click the delete-document button
    Then the delete-modal should be visible
    When I click the delete-cancel button
    Then the delete-modal should be hidden
    And the document-list should contain 1 document

  Scenario: Confirm document deletion
    Given the sidebar is visible
    When I create a new document
    Then the document-list should contain 2 documents
    When I click the delete-document button
    Then the delete-modal should be visible
    When I click the delete-confirm button
    Then the delete-modal should be hidden
    And the document-list should contain 1 document
    And I should see "Welcome to MarkVim" in the document-list

  Scenario: Delete document workflow using steps
    Given the sidebar is visible
    When I create a new document
    Then the document-list should contain 2 documents
    When I delete the active document
    Then the delete-modal should be visible
    When I confirm the deletion
    Then the document should be deleted
    And the document-list should contain 1 document

  Scenario: Document persistence bug - active document resets on reload
    Given the sidebar is visible
    When I create a new document
    When I reload the page
    Then the new document should still be active 