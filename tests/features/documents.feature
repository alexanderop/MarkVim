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