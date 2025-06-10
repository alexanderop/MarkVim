Feature: MarkVim Document Sharing

  Background:
    Given I am on the MarkVim homepage

  @smoke
  Scenario: Share button is visible in header toolbar
    Then element with testid "share-button" should be visible
    And element with testid "share-button" should be enabled

  Scenario: Create and share a document
    When I create a new document
    And I focus the editor
    And I type "# Test Document\n\nThis is a test document for sharing."
    And I click on element with testid "share-button"
    Then element with testid "share-dialog" should be visible
    And element with testid "share-link-input" should be visible
    And element with testid "copy-share-link-btn" should be enabled

  Scenario: Copy share link to clipboard
    When I create a new document
    And I focus the editor  
    And I type "# Test Document\n\nShared content."
    And I click on element with testid "share-button"
    And I click on element with testid "copy-share-link-btn"
    Then element with testid "copy-share-link-btn" should contain text "Copied!"

  Scenario: View advanced sharing statistics
    When I create a new document
    And I focus the editor
    And I type "# Advanced Test\n\nThis document has some content to test compression stats."
    And I click on element with testid "share-button"
    And I click on element with testid "share-advanced-toggle"
    Then element with testid "share-advanced-stats" should be visible
    And element with testid "share-advanced-stats" should contain text "Original size:"
    And element with testid "share-advanced-stats" should contain text "Compressed size:"
    And element with testid "share-advanced-stats" should contain text "Compression ratio:"

  Scenario: Share button disabled for large documents
    When I create a new document
    And I focus the editor
    And I generate large document content
    Then element with testid "share-button" should be disabled

  Scenario: Document title extraction for sharing
    When I create a new document
    And I focus the editor
    And I type "# My Special Document\n\nContent here."
    And I click on element with testid "share-button"
    Then element with testid "share-dialog" should contain text "My Special Document"

  Scenario: Document title extraction for documents without headers
    When I create a new document
    And I focus the editor
    And I type "This is just plain text without headers."
    And I click on element with testid "share-button"
    Then element with testid "share-dialog" should contain text "This is just plain text without headers."

  Scenario: Share dialog close functionality
    When I create a new document
    And I focus the editor
    And I type "# Test\n\nContent."
    And I click on element with testid "share-button"
    When I click on element with testid "share-dialog-close-btn"
    Then element with testid "share-dialog" should not be visible 