Feature: Application Smoke Test
  As a user
  I want to verify the basic functionality works when the application loads
  So that I can be confident the core features are operational

  Scenario: Default application state on page load
    Given I navigate to the App
    When the page is loaded
    Then the selected mode should be "split"
    And I should see the headline "Welcome to MarkVim" in the editor
    And I should see the headline "Welcome to MarkVim" in the preview

  Scenario: Switch to editor-only mode
    Given I navigate to the App
    When the page is loaded
    When I click on editor mode
    Then the selected mode should be "editor"
    And I should see the headline "Welcome to MarkVim" in the editor
    And I should not see the headline "Welcome to MarkVim" in the preview

  Scenario: Switch to preview-only mode
    Given I navigate to the App
    When the page is loaded
    When I click on preview mode
    Then the selected mode should be "preview"
    And I should not see the headline "Welcome to MarkVim" in the editor
    And I should see the headline "Welcome to MarkVim" in the preview
