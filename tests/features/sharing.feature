# tests/features/sharing.feature

Feature: Document Sharing and Importing
  As a user
  I want to share my documents via a link and import documents from others
  So that I can collaborate and move content easily.

  Background:
    Given I navigate to the App
    When the page is loaded

  Scenario: Successfully generate and import a share link
    Given I create a document with the content "# My Shared Note\nThis is a test."
    When I click the share button
    Then the share dialog should be visible
    And the share link input should contain a valid share link

    When I copy the share link
    And I navigate to the copied share link in the browser
    Then the page should display the content of the shared note
    And the document list should contain 2 documents 