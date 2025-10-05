Feature: Document persistence across page reloads
  As a user
  I want my documents to persist when I reload the page
  So that I don't lose my work

  Background:
    Given I navigate to the App
    When the page is loaded

  Scenario: Document persists after page reload
    When I create a new document with content "# My Test Document\n\nThis is test content"
    And I reload the page
    Then I should see the document "My Test Document" is still active
    And the document content should contain "This is test content"

  Scenario: Active document is restored after reload
    When I create a new document with content "# Document 1\n\nFirst document"
    And I create a new document with content "# Document 2\n\nSecond document"
    When I select the first document "Document 1"
    And I reload the page
    Then the active document should be "Document 1"
    And I should see "First document" in the editor

  Scenario: No hydration warnings in console
    When I check the browser console
    Then I should not see any hydration mismatch warnings